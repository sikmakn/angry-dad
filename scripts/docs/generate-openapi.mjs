import { readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { stringify } from 'yaml';

const root = fileURLToPath(new URL('../../', import.meta.url));
const args = process.argv.slice(2);
if (args.some(arg => arg !== '--check') || args.length > 1) {
  throw new Error('Usage: npm run generate:openapi -- [--check]');
}
const check = args.includes('--check');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const build = spawnSync(npm, ['run', 'build', '-w', 'api'], {
  cwd: root,
  stdio: 'inherit',
});
if (build.error) {
  throw build.error;
}
if (build.status !== 0) {
  throw new Error(`API compilation failed (${build.status ?? build.signal})`);
}

// Set before importing API modules: export must never load .env or construct
// database/external clients. The factory uses Nest preview without init/listen.
process.env.OPENAPI_EXPORT = '1';
const exporterPath = resolve(root, 'apps/api/dist/openapi/create-openapi-document.js');
const { createOpenApiDocument } = await import(pathToFileURL(exporterPath).href);
const rawDocument = await createOpenApiDocument();
if (!rawDocument.openapi?.startsWith('3.') || !Object.keys(rawDocument.paths ?? {}).length) {
  throw new Error('Swagger did not produce a nonempty OpenAPI 3 document');
}
const sorted = canonical(rawDocument);
const document = Object.fromEntries([...new Set(['openapi', 'info', 'servers', 'tags', 'security', 'paths', 'components', ...Object.keys(sorted)])]
  .filter(key => key in sorted).map(key => [key, sorted[key]]));
const artifacts = [
  ['docs/openapi.yaml', '# Generated from NestJS Swagger metadata. Run npm run generate:openapi.\n' + stringify(document, { lineWidth: 0, aliasDuplicateObjects: false })],
  ['docs/openapi.json', JSON.stringify(document, null, 2) + '\n'],
];
let stale = false;
for (const [relative, content] of artifacts) {
  const path = resolve(root, relative);
  if (check) {
    let current;
    try {
      current = await readFile(path, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
    if (current !== content) {
      console.error(`Stale OpenAPI artifact: ${relative}`);
      stale = true;
    }
  } else {
    await writeFile(path, content);
    console.log(`Generated ${relative}`);
  }
}
if (stale) {
  console.error('Run npm run generate:openapi and save both contract files.');
  process.exitCode = 1;
} else if (check) {
  console.log('OpenAPI YAML and JSON match the NestJS source.');
}

function canonical(value) {
  if (Array.isArray(value)) {
    return value.map(canonical);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  }
  return value;
}
