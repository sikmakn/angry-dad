// Держит проект доступным из интернета: бэкенд, воркер, фронт и туннель Cloudflare.
// Перезапускает упавшее, не даёт Mac уснуть и, когда адрес туннеля меняется, сам обновляет
// вебхук и кнопку меню бота. Остановка: Ctrl+C.
import { spawn } from 'node:child_process';
import { createWriteStream, mkdirSync } from 'node:fs';
import { join } from 'node:path';

process.loadEnvFile('.env');
for (const key of ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_WEBHOOK_SECRET']) {
  if (!process.env[key]) {
    console.error(`В .env нет ${key}`);
    process.exit(1);
  }
}

const WEB_PORT = process.env.WEB_PORT ?? '5180';
const logDir = join('.online', 'logs');
mkdirSync(logDir, { recursive: true });
const stamp = () => new Date().toLocaleTimeString('ru-RU');
const say = message => console.log(`[${stamp()}] ${message}`);

const children = new Map();
let stopping = false;

function supervise(name, command, args, { cwd, env = {}, onLine } = {}) {
  const log = createWriteStream(join(logDir, `${name}.log`), { flags: 'a' });
  let delay = 2000, started = 0;
  const service = {
    name,
    process: undefined,
    start() {
      started = Date.now();
      const child = spawn(command, args, { cwd, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
      service.process = child;
      for (const stream of [child.stdout, child.stderr]) {
        stream.on('data', chunk => {
          log.write(chunk);
          if (onLine) {
            for (const line of chunk.toString().split('\n')) {
              onLine(line);
            }
          }
        });
      }
      child.on('error', error => say(`${name}: не запустился (${error.message})`));
      child.on('exit', code => {
        if (stopping || service.process !== child) {
          return;
        }
        // Долго проработавший сервис начинает с короткой паузы, быстро падающий ждёт дольше.
        delay = Date.now() - started > 60000 ? 2000 : Math.min(delay * 2, 30000);
        say(`${name}: остановился (код ${code}), перезапуск через ${Math.round(delay / 1000)} с`);
        setTimeout(() => !stopping && service.start(), delay);
      });
    },
    restart() {
      const old = service.process;
      service.process = undefined;
      old?.kill('SIGTERM');
      setTimeout(() => !stopping && service.start(), 1500);
    },
  };
  children.set(name, service);
  service.start();
  return service;
}

async function telegram(method, body) {
  const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json();
  if (!data.ok) {
    throw new Error(`${method}: ${data.description}`);
  }
  return data.result;
}

// Подставляет новый адрес в бота. allowed_updates берём из текущего вебхука, чтобы ничего не потерять.
async function registerBot(url) {
  const info = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getWebhookInfo`).then(r => r.json());
  await telegram('setWebhook', {
    url: `${url}/api/telegram/webhook`,
    secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
    ...(info.result?.allowed_updates?.length ? { allowed_updates: info.result.allowed_updates } : {}),
  });
  const menu = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getChatMenuButton`).then(r => r.json());
  await telegram('setChatMenuButton', { menu_button: { type: 'web_app', text: menu.result?.text ?? 'Открыть Батю', web_app: { url: `${url}/` } } });
}

let tunnelUrl;
let api;

async function adopt(url) {
  if (url === tunnelUrl) {
    return;
  }
  tunnelUrl = url;
  say(`адрес: ${url}`);
  // API читает адрес Mini App из окружения при старте: при смене адреса его надо перезапустить.
  if (api) {
    api.env.MINI_APP_URL = url;
    api.restart();
  }
  try {
    await registerBot(url);
    say('вебхук и кнопка меню бота обновлены');
  } catch (error) {
    say(`бот не обновлён: ${error.message}`);
  }
}

mkdirSync('.online', { recursive: true });
const apiEnv = {};
api = Object.assign(supervise('api', process.execPath, ['apps/api/dist/main.js'], { env: apiEnv }), { env: apiEnv });
supervise('worker', process.execPath, ['apps/api/dist/worker.js']);
supervise('web', process.execPath, ['../../node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', WEB_PORT, '--strictPort'], { cwd: 'apps/web' });
const tunnel = supervise('tunnel', 'cloudflared', ['tunnel', '--url', `http://127.0.0.1:${WEB_PORT}`, '--no-autoupdate'], {
  onLine(line) {
    const match = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/.exec(line);
    if (match) {
      void adopt(match[0]);
    }
  },
});

// Не даёт Mac уснуть, пока скрипт работает. Закрытая крышка без питания и внешнего экрана всё равно усыпляет.
if (process.platform === 'darwin') {
  spawn('caffeinate', ['-i', '-s', '-w', String(process.pid)], { stdio: 'ignore' });
}

async function healthy() {
  if (!tunnelUrl) {
    return true;
  }
  try {
    const response = await fetch(`${tunnelUrl}/`, { signal: AbortSignal.timeout(10000) });
    return response.ok;
  } catch {
    return false;
  }
}

// Проверка раз в 30 секунд. Большая пауза между проверками значит, что компьютер спал: проверяем сразу.
let misses = 0, last = Date.now();
setInterval(async () => {
  const slept = Date.now() - last > 90000;
  last = Date.now();
  if (await healthy()) {
    misses = 0;
    return;
  }
  misses += 1;
  if (misses >= 2 || slept) {
    say('адрес не отвечает, перезапускаю туннель');
    misses = 0;
    tunnelUrl = undefined;
    tunnel.restart();
  }
}, 30000);

function stop() {
  stopping = true;
  for (const service of children.values()) {
    service.process?.kill('SIGTERM');
  }
  setTimeout(() => process.exit(0), 1000);
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
say('запущено: api, worker, web, tunnel');
