// Cloudflare Worker：同時提供攻略網站（docs/ 靜態檔案）和官方 API 中轉。
// 官方 API 只允許官方網站的瀏覽器直接讀取，所以網站經由 /api/... 讀取：
//   - 只轉送「讀取」(GET) 和下面列出的路徑，不能用來修改任何東西。
//   - API key 由網站每次在 Authorization 標頭帶過來，這裡不儲存、不記錄。
// 部署設定在 wrangler.jsonc；連上 GitHub 後每次 push 會自動部署。
// 也可以單獨使用（不帶網站）：把這份程式碼貼進 Cloudflare 主控台的 Worker，網站填 https://你的worker/api。
const ALLOWED_ORIGINS = ['https://johnnywcyin.github.io', 'http://localhost:8766'];
const PATHS = new Set(['/status', '/me', '/me/balance', '/me/transactions', '/me/dungeons', '/me/inventory']);
const API = 'https://api.saominecraft.com/api/v1';

const json = (body, status, headers) => new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } });

async function relay(req, url, path) {
  const origin = req.headers.get('Origin') || '';
  // same-origin: the site served by this Worker (browsers omit Origin on same-origin GET)
  const same = origin === url.origin || (!origin && req.headers.get('Sec-Fetch-Site') === 'same-origin');
  const cross = ALLOWED_ORIGINS.includes(origin);
  const cors = cross ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'Authorization', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Max-Age': '86400', Vary: 'Origin' } : { Vary: 'Origin' };
  if (req.method === 'OPTIONS') return new Response(null, { status: cross ? 204 : 403, headers: cors });
  if (req.method !== 'GET' || !PATHS.has(path)) return json({ error: 'not allowed' }, 404, cors);
  if (!same && !cross) return json({ error: 'origin not allowed' }, 403, cors);
  const auth = req.headers.get('Authorization') || '';
  if (!/^Bearer sao_[\w-]{10,200}$/.test(auth)) return json({ error: 'missing or malformed API key' }, 401, cors);
  const r = await fetch(API + path + url.search, { headers: { Authorization: auth, Accept: 'application/json' } });
  return new Response(r.body, { status: r.status, headers: { ...cors, 'Content-Type': r.headers.get('Content-Type') || 'application/json', 'Cache-Control': 'no-store' } });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    // /api/me → /me ; the bare paths (/me, /status …) keep working for sites that saved the old relay address
    const path = url.pathname.startsWith('/api/') ? url.pathname.slice(4) : url.pathname;
    if (url.pathname.startsWith('/api/') || PATHS.has(url.pathname)) return relay(req, url, path);
    return env?.ASSETS ? env.ASSETS.fetch(req) : json({ error: 'not allowed' }, 404, {});
  },
};
