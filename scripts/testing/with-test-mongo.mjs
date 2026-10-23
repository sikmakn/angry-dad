import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const IMAGE = 'mongo:8.0';
const LABEL = 'angry-dad.test-run';

function docker(args, input) {
  const result = spawnSync('docker', args, { input, encoding: 'utf8', timeout: 30000, maxBuffer: 1024 * 1024 });
  if (result.error || result.status !== 0) {
    // Docker/mongosh output may contain credentials; never include it in errors.
    throw new Error(`Test MongoDB: docker ${args[0]} failed. Check Docker Desktop and image availability.`);
  }
  return result.stdout.trim();
}

export function testEnvironment() {
  // Allow only runtime settings, never application credentials from the invoking shell.
  const allowed = ['PATH', 'HOME', 'TMPDIR', 'TEMP', 'TMP', 'SystemRoot', 'COMSPEC', 'USERPROFILE', 'LANG', 'LC_ALL', 'CI', 'TERM', 'NO_COLOR', 'FORCE_COLOR', 'PLAYWRIGHT_BROWSERS_PATH'];
  const env = Object.fromEntries(allowed.flatMap(key => process.env[key] === undefined ? [] : [[key, process.env[key]]]));
  return {
    ...env,
    NODE_ENV: 'test',
    // Добавь сюда переменные, которые нужны приложению в тесте: случайные значения, не реальные секреты.
  };
}

export async function withTestMongo(action) {
  const runId = randomBytes(16).toString('hex');
  const databaseName = `angry-dad_test_${runId}`;
  const name = `angry-dad-test-${runId}`;
  let containerId;
  let containerAttempted = false;
  let child;
  let cleaned = false;

  function cleanup() {
    if (cleaned || !containerAttempted) {
      return;
    }
    const inspection = spawnSync('docker', ['inspect', '--format', `{{.Id}} {{index .Config.Labels "${LABEL}"}}`, name], { encoding: 'utf8', timeout: 10000 });
    if (inspection.status !== 0) {
      // --rm can have already removed a stopped container. Confirm Docker is still reachable.
      docker(['info', '--format', '{{.ServerVersion}}']);
      cleaned = true;
      return;
    }
    const [ownedId, owner] = inspection.stdout.trim().split(' ');
    if (!/^[a-f0-9]{64}$/.test(ownedId) || owner !== runId || (containerId && containerId !== ownedId)) {
      throw new Error('Refusing to clean a container not owned by this test run');
    }
    docker(['rm', '--force', '--volumes', ownedId]);
    cleaned = true;
  }

  function interrupted(signal) {
    child?.kill(signal);
    process.exitCode = signal === 'SIGINT' ? 130 : 143;
    cleanup();
  }

  const onInterrupt = () => interrupted('SIGINT');
  const onTerminate = () => interrupted('SIGTERM');
  process.once('SIGINT', onInterrupt);
  process.once('SIGTERM', onTerminate);
  try {
    docker(['info', '--format', '{{.ServerVersion}}']);
    // Pulling explicitly avoids an ambiguous timed-out docker run creating an orphan.
    if (spawnSync('docker', ['image', 'inspect', IMAGE], { stdio: 'ignore' }).status !== 0) {
      const pull = spawn('docker', ['pull', IMAGE], { stdio: 'inherit' });
      child = pull;
      const code = await new Promise((resolve, reject) => {
        pull.once('error', reject);
        pull.once('exit', resolve);
      });
      child = undefined;
      if (code !== 0) {
        throw new Error('Unable to pull the official MongoDB test image');
      }
    }
    containerAttempted = true;
    containerId = docker([
      'run', '--detach', '--rm', '--name', name, '--label', `${LABEL}=${runId}`,
      '--publish', '127.0.0.1::27017', '--memory', '2g',
      '--tmpfs', '/data/db:rw,size=1073741824', '--tmpfs', '/data/configdb:rw,size=67108864',
      // Replica set нужен транзакциям; ключ создаётся внутри контейнера и в нём же остаётся.
      '--entrypoint', 'bash', IMAGE, '-c',
      'openssl rand -base64 756 > /data/configdb/keyfile && chmod 400 /data/configdb/keyfile && chown mongodb:mongodb /data/configdb/keyfile /data/db && '
      + 'exec gosu mongodb mongod --replSet rs0 --keyFile /data/configdb/keyfile --auth --bind_ip_all --wiredTigerCacheSizeGB 0.25',
    ]);
    if (!/^[a-f0-9]{64}$/.test(containerId)) {
      throw new Error('Docker did not return a valid test container ID');
    }
    let ready = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      const probe = spawnSync('docker', ['exec', containerId, 'mongosh', '--quiet', '--eval', 'quit(db.adminCommand({ping:1}).ok === 1 ? 0 : 1)'], { stdio: 'ignore', timeout: 5000 });
      if (probe.status === 0) {
        ready = true;
        break;
      }
      await delay(500);
    }
    if (!ready) {
      throw new Error('Temporary MongoDB did not become ready');
    }
    // Localhost exception разрешает инициализацию набора до создания первого пользователя.
    docker(['exec', containerId, 'mongosh', '--quiet', '--eval',
      'rs.initiate({_id:"rs0",members:[{_id:0,host:"127.0.0.1:27017"}]})']);
    let primary = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      const probe = spawnSync('docker', ['exec', containerId, 'mongosh', '--quiet', '--eval', 'quit(db.hello().isWritablePrimary ? 0 : 1)'], { stdio: 'ignore', timeout: 5000 });
      if (probe.status === 0) {
        primary = true;
        break;
      }
      await delay(500);
    }
    if (!primary) {
      throw new Error('Temporary MongoDB replica set did not elect a primary');
    }
    const password = randomBytes(32).toString('hex');
    const adminPassword = randomBytes(32).toString('hex');
    const user = `angry-dad_test_${runId}`;
    const init = `
      const admin = db.getSiblingDB('admin');
      admin.createUser({user:'test_runner_admin',pwd:${JSON.stringify(adminPassword)},roles:['root']});
      admin.auth('test_runner_admin',${JSON.stringify(adminPassword)});
      admin.createRole({role:'test_application',privileges:[{
        resource:{db:'',collection:''},
        actions:['find','insert','update','remove','createCollection','createIndex','listIndexes','listCollections','dropIndex','collStats','dbStats']
      }],roles:[]});
      admin.createUser({user:${JSON.stringify(user)},pwd:${JSON.stringify(password)},roles:['test_application']});
      admin.logout();
      admin.auth(${JSON.stringify(user)},${JSON.stringify(password)});
      const permissions = admin.runCommand({connectionStatus:1,showPrivileges:true});
      if (permissions.authInfo.authenticatedUserPrivileges.some(privilege =>
        privilege.actions.some(action => ['dropDatabase','dropCollection'].includes(action)))) {
        throw new Error('Unexpected destructive test application privilege');
      }
    `;
    docker(['exec', '--interactive', containerId, 'mongosh', '--quiet', '--file', '/dev/stdin'], init);
    const port = docker(['port', containerId, '27017/tcp']);
    const match = /^127\.0\.0\.1:(\d+)$/.exec(port);
    if (!match || Number(match[1]) === 27017) {
      throw new Error('Temporary MongoDB must have a dedicated loopback port');
    }
    const uri = `mongodb://${user}:${password}@127.0.0.1:${match[1]}/${databaseName}?authSource=admin&directConnection=true`;
    const env = {
      ...testEnvironment(), MONGODB_URI: uri, TEST_MONGODB_URI: uri,
      TEST_MONGO_RUN_ID: runId, TEST_MONGO_CONTAINER_ID: containerId,
    };
    console.log('Temporary MongoDB ready; application has no database/collection removal privileges.');
    return await action({ env, uri, databaseName, runId });
  } finally {
    process.removeListener('SIGINT', onInterrupt);
    process.removeListener('SIGTERM', onTerminate);
    cleanup();
    if (cleaned) {
      console.log('Temporary MongoDB container and its data removed.');
    }
  }
}

async function main() {
  const separator = process.argv.indexOf('--');
  const [command, ...args] = separator < 0 ? [] : process.argv.slice(separator + 1);
  if (!command) {
    throw new Error('Usage: with-test-mongo.mjs -- command [arguments]');
  }
  await withTestMongo(async ({ env }) => {
    const test = spawn(command, args, { env, stdio: 'inherit' });
    const forwardInterrupt = () => test.kill('SIGINT');
    const forwardTerminate = () => test.kill('SIGTERM');
    process.once('SIGINT', forwardInterrupt);
    process.once('SIGTERM', forwardTerminate);
    try {
      const code = await new Promise((resolve, reject) => {
        test.once('error', reject);
        test.once('exit', code => resolve(code ?? 1));
      });
      process.exitCode = code;
    } finally {
      process.removeListener('SIGINT', forwardInterrupt);
      process.removeListener('SIGTERM', forwardTerminate);
    }
  });
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch(() => {
    console.error('Test environment failed. Docker must be running; no host database fallback is allowed.');
    process.exitCode = 1;
  });
}
