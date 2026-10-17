import { createServer } from 'node:http';
import { appendFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const port = Number(process.env.BOOPSTICK_BROWSER_PORT);
if (!Number.isSafeInteger(port) || port < 1024 || port > 65535) throw new Error('Explicit unprivileged port required');
const specimen = readFileSync(new URL('./specimen.html', import.meta.url));
const record = event => appendFileSync(join(process.env.BOOPSTICK_OUTPUT_DIR, 'server-lifecycle.jsonl'), `${JSON.stringify({ event, pid: process.pid, port })}\n`);
const server = createServer((request, response) => {
  const url = new URL(request.url, `http://127.0.0.1:${port}`);
  if (request.method !== 'GET' || url.pathname !== '/') {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store',
    'content-security-policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; frame-src 'none'",
  }).end(specimen);
});
server.listen(port, '127.0.0.1', () => record('listening'));
process.on('SIGTERM', () => server.close(() => { record('closed'); process.exit(0); }));
