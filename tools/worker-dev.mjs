// Local stand-in for Cloudflare (node tools/worker-dev.mjs → http://localhost:8787):
// serves docs/ as the ASSETS binding and runs the Worker for the run_worker_first paths in wrangler.jsonc.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import worker from './cloudflare-worker.mjs';

const ROOT = path.resolve(import.meta.dirname, '../docs');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json' };
const ASSETS = { fetch: async req => {
  let p = decodeURIComponent(new URL(req.url).pathname); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) return new Response('not found', { status: 404 });
  return new Response(fs.readFileSync(f), { headers: { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' } });
} };
const workerFirst = p => p.startsWith('/api/') || p === '/status' || p === '/me' || p.startsWith('/me/');

http.createServer(async (req, res) => {
  const r0 = new Request('http://localhost:8787' + req.url, { method: req.method, headers: req.headers });
  const r = workerFirst(new URL(r0.url).pathname) ? await worker.fetch(r0, { ASSETS }) : await ASSETS.fetch(r0);
  res.writeHead(r.status, Object.fromEntries(r.headers));
  res.end(Buffer.from(await r.arrayBuffer()));
}).listen(8787, () => console.log('site + relay on http://localhost:8787'));
