// Cloudflare Worker：讓攻略網站經由這個中轉讀取 SAO Minecraft 官方 API（官方 API 只允許官方網站的瀏覽器直接讀取）。
// - 只轉送「讀取」(GET) 和下面列出的路徑，不能用來修改任何東西。
// - API key 由網站每次在 Authorization 標頭帶過來，這裡不儲存、不記錄。
// 部署：Cloudflare 主控台 → Workers & Pages → 建立 Worker → 編輯程式碼 → 整份貼上 → Deploy。
const ALLOWED_ORIGINS = ['https://johnnywcyin.github.io', 'http://localhost:8766'];
const PATHS = new Set(['/status', '/me', '/me/balance', '/me/transactions', '/me/dungeons', '/me/inventory']);
const API = 'https://api.saominecraft.com/api/v1';

const json = (body, status, headers) => new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } });

export default {
  async fetch(req) {
    const origin = req.headers.get('Origin') || '';
    const ok = ALLOWED_ORIGINS.includes(origin);
    const cors = ok ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'Authorization', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Max-Age': '86400', Vary: 'Origin' } : { Vary: 'Origin' };
    if (req.method === 'OPTIONS') return new Response(null, { status: ok ? 204 : 403, headers: cors });
    const url = new URL(req.url);
    if (req.method !== 'GET' || !PATHS.has(url.pathname)) return json({ error: 'not allowed' }, 404, cors);
    if (!ok) return json({ error: 'origin not allowed' }, 403, cors);
    const auth = req.headers.get('Authorization') || '';
    if (!/^Bearer sao_[\w-]{10,200}$/.test(auth)) return json({ error: 'missing or malformed API key' }, 401, cors);
    const r = await fetch(API + url.pathname + url.search, { headers: { Authorization: auth, Accept: 'application/json' } });
    return new Response(r.body, { status: r.status, headers: { ...cors, 'Content-Type': r.headers.get('Content-Type') || 'application/json', 'Cache-Control': 'no-store' } });
  },
};
