// Download item / monster / loot / boss images once into raw/img (artifact pages cannot load other hosts).
// Run: node tools/fetch-images.js   (needs site/data/*.js built first)
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'raw', 'img');
global.window = {};
for (const f of ['items', 'mobs', 'guide']) require(path.join(ROOT, 'site', 'data', f + '.js'));
const EXO = 'https://exiled-order.pages.dev', ARGO = 'https://cheng-1001.github.io/ArgoStrategyGuide/';
const jobs = [];
for (const i of window.ITEMS) if (i.img) jobs.push([`${EXO}/objetos-wiki/items/${i.id}.png?v=2`, `items/${i.id}.png`]);
for (const m of window.MOBS.mobs) {
  if (m.img) jobs.push([EXO + m.img, m.img.replace(/^\//, '')]);
  for (const b of m.botin) if (b.img) jobs.push([EXO + b.img, b.img.replace(/^\//, '')]);
}
const B = window.GUIDE.bosses;
for (const b of [...B.world, ...B.unique]) if (b.img) jobs.push([ARGO + b.img, 'argo/' + b.img]);
const todo = [...new Map(jobs.map(j => [j[1], j])).values()].filter(([, p]) => !fs.existsSync(path.join(OUT, p.replace(/\?.*$/, ''))));
let ok = 0, fail = 0;
async function worker() {
  for (let j; (j = todo.shift());) {
    const [url, rel0] = j, rel = rel0.replace(/\?.*$/, ''), dest = path.join(OUT, rel);
    try {
      const r = await fetch(url); if (!r.ok) throw new Error(r.status);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer())); ok++;
    } catch (e) { fail++; console.log('FAIL', url, e.message); }
  }
}
Promise.all(Array.from({ length: 8 }, worker)).then(() => console.log('downloaded', ok, 'failed', fail));
