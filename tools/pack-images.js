// Pack raw/img into two data-URI bundles (an artifact allows ~511 files and no other image hosts).
// site/data/img-items.js -> window.IMG_I = {itemId: dataURI}
// site/data/img-mobs.js  -> window.IMG_M = {"/bestiario/..." or "argo/img/bosses/...": dataURI}
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), IMG = path.join(ROOT, 'raw', 'img'), OUT = path.join(ROOT, 'site', 'data');
const MIME = { '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
const uri = f => `data:${MIME[path.extname(f)]};base64,${fs.readFileSync(f).toString('base64')}`;
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const I = {}, M = {};
for (const f of walk(path.join(IMG, 'items'))) I[path.basename(f, '.png')] = uri(f);
for (const f of walk(IMG).filter(f => !f.includes(path.sep + 'items' + path.sep) || f.includes('objetos-wiki'))) {
  const rel = path.relative(IMG, f).split(path.sep).join('/');
  M[rel.startsWith('argo/') ? rel : '/' + rel] = uri(f);
}
fs.writeFileSync(path.join(OUT, 'img-items.js'), 'window.IMG_I=' + JSON.stringify(I) + ';\n');
fs.writeFileSync(path.join(OUT, 'img-mobs.js'), 'window.IMG_M=' + JSON.stringify(M) + ';\n');
console.log('items', Object.keys(I).length, 'mobs/loot/boss', Object.keys(M).length);
