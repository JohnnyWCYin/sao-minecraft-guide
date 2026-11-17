// Run the Cloudflare Worker locally on http://localhost:8787 for testing: node tools/worker-dev.mjs
import http from 'node:http';
import worker from './cloudflare-worker.mjs';

http.createServer(async (req, res) => {
  const r = await worker.fetch(new Request('http://localhost:8787' + req.url, { method: req.method, headers: req.headers }));
  res.writeHead(r.status, Object.fromEntries(r.headers));
  res.end(Buffer.from(await r.arrayBuffer()));
}).listen(8787, () => console.log('worker on http://localhost:8787'));
