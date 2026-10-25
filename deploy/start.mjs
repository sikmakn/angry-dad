// Один контейнер: api (внутренний порт), worker и статика фронта с прокси /api на одном публичном порту.
import { spawn } from 'node:child_process';
import { createReadStream, existsSync, statSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const publicPort = Number(process.env.PORT || 10000);
const apiPort = 3000;
const webRoot = path.resolve('apps/web/dist');
const publicUrl = process.env.RENDER_EXTERNAL_URL || process.env.PUBLIC_URL;
const token = process.env.TELEGRAM_BOT_TOKEN;

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };

function supervise(name, args, env = {}) {
  const run = () => {
    const child = spawn(process.execPath, args, { stdio: 'inherit', env: { ...process.env, ...env } });
    child.on('exit', (code) => {
      console.error(`[${name}] завершился с кодом ${code}, перезапуск через 3 с`);
      setTimeout(run, 3000);
    });
  };
  run();
}

supervise('api', ['apps/api/dist/main.js'], { PORT: String(apiPort), MINI_APP_URL: process.env.MINI_APP_URL || `${publicUrl}/` });
supervise('worker', ['apps/api/dist/worker.js'], { MINI_APP_URL: process.env.MINI_APP_URL || `${publicUrl}/` });

http.createServer((req, res) => {
  if (req.url === '/health') { res.end('ok'); return; }
  if (req.url.startsWith('/api')) {
    const upstream = http.request({ host: '127.0.0.1', port: apiPort, path: req.url, method: req.method, headers: req.headers }, (r) => {
      res.writeHead(r.statusCode, r.headers);
      r.pipe(res);
    });
    upstream.on('error', () => { res.writeHead(502); res.end('api недоступен'); });
    req.pipe(upstream);
    return;
  }
  const rel = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(webRoot, path.normalize(rel));
  if (!file.startsWith(webRoot) || !existsSync(file) || statSync(file).isDirectory()) file = path.join(webRoot, 'index.html');
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(res);
}).listen(publicPort, () => console.log(`публичный порт ${publicPort}`));

// Регистрация бота: вебхук и кнопка меню. Повторы, пока api не поднялся.
async function telegram(method, body) {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!j.ok) throw new Error(`${method}: ${j.description}`);
}
async function registerBot() {
  if (!token || !publicUrl) return console.log('регистрация бота пропущена (нет токена или адреса)');
  for (let i = 0; i < 10; i++) {
    try {
      const info = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`).then((r) => r.json());
      const updates = info.result?.allowed_updates;
      await telegram('setWebhook', { url: `${publicUrl}/api/telegram/webhook`, secret_token: process.env.TELEGRAM_WEBHOOK_SECRET, ...(updates?.length ? { allowed_updates: updates } : {}) });
      await telegram('setChatMenuButton', { menu_button: { type: 'web_app', text: 'Открыть Батю', web_app: { url: `${publicUrl}/` } } });
      return console.log('бот зарегистрирован:', publicUrl);
    } catch (e) {
      console.error('регистрация бота не удалась:', e.message);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}
void registerBot();
