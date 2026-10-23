import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { extname, join, normalize, resolve } from 'node:path';

// Local Swagger UI for docs/openapi.yaml: the spec is re-read on every request, so a reload shows edits.
const require = createRequire(import.meta.url);
const uiRoot = require('swagger-ui-dist').getAbsoluteFSPath();
const specPath = resolve(process.argv[2] ?? 'docs/openapi.yaml');
const port = Number(process.env.PORT ?? 4010);
const types = {
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.html': 'text/html; charset=utf-8',
};
const page = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><title>API</title>
<link rel="stylesheet" href="/ui/swagger-ui.css"></head>
<body><div id="ui"></div>
<script src="/ui/swagger-ui-bundle.js"></script>
<script>SwaggerUIBundle({ url: '/openapi.yaml', dom_id: '#ui', deepLinking: true });</script>
</body></html>`;

createServer(async (request, response) => {
  const { pathname } = new URL(request.url, 'http://localhost');
  try {
    if (pathname === '/') {
      response.writeHead(200, { 'content-type': types['.html'] });
      response.end(page);
    } else if (pathname === '/openapi.yaml') {
      response.writeHead(200, { 'content-type': 'text/yaml; charset=utf-8', 'cache-control': 'no-store' });
      response.end(await readFile(specPath));
    } else if (pathname.startsWith('/ui/')) {
      const file = join(uiRoot, normalize(pathname.slice(4)).replace(/^(\.\.[/\\])+/, ''));
      response.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
      response.end(await readFile(file));
    } else {
      response.writeHead(404).end();
    }
  } catch {
    response.writeHead(404).end();
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Swagger UI: http://localhost:${port}  (spec: ${specPath})`);
});
