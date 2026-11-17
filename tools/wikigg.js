// Extract Chinese names (zh-tw pages) and bestiary facts from the SAO Minecraft fan wiki dump.
// in: raw/wikigg/pages.json (title -> wikitext, from the wiki's public API)  out: raw/wikigg-zh.json
const fs = require('fs');
const D = __dirname + '/../raw/';
const P = JSON.parse(fs.readFileSync(D + 'wikigg/pages.json', 'utf8'));
const clean = s => s.replace(/<[^>]+>/g, '').replace(/'''?/g, '').replace(/[\u{1F300}-\u{1FAFF}☀-➿️]/gu, '').trim();
const hasCJK = s => /[一-鿿]/.test(s);

// FR page title / zh page -> internal item id
const idOf = t => +((P[t] || '').match(/\|\s*(?:ID interne|Internal ID|內部 ID)\s*\|\|\s*(\d+)/) || [])[1] || null;

const items = {}; // id -> zh
// the wiki has a few names with broken UTF-8 (U+FFFD); skip those so the build falls back to another name
const add = (id, zh) => { zh = clean(zh); if (id && zh && hasCJK(zh) && !zh.includes('�') && !items[id]) items[id] = zh; };
// 1) zh-tw item pages: infobox caption
for (const t in P) if (t.endsWith('/zh-tw')) {
  const cap = (P[t].match(/^\|\+[^\n]*\|\s*([^|\n]+)$/m) || [])[1];
  if (cap) add(idOf(t) || idOf(t.slice(0, -6)), cap);
}
// 2) links in zh-tw list pages: [[French Title|中文]]
for (const t in P) if (t.endsWith('/zh-tw')) for (const m of P[t].matchAll(/\[\[([^\]|#]+)\|([^\]]+)\]\]/g)) {
  const target = m[1].replace(/\/zh-tw$/, '').replace(/_/g, ' ').trim();
  add(idOf(target), m[2]);
}

// bestiary: codex no., English page link, zh name, type, behaviour, stars
const mobs = {};
const TYPE = { '怪物': 'mob', '小頭目': 'mini', '嘍囉': 'minion', 'Boss': 'boss' };
const BEH = { Aggressive: '主動攻擊', Neutral: '中立', Passive: '被動', '主動攻擊': '主動攻擊', '中立': '中立', '被動': '被動' };
for (const row of P['Bestiary/zh-tw'].split(/\n\|-/)) {
  const m = row.match(/\|\s*(\d{3}|—)\s*\|\|\s*(?:\[\[([^\]|]+)\|)?([^\]|]+?)(?:\]\])?\s*\|\|(.*?)\|\|(.*?)\|\|(.*?)\|\|(.*?)\|\|/s);
  if (!m) continue;
  const type = clean(m[4]), beh = clean(m[5]).replace(/\s+/g, ''), stars = (m[7].match(/★/g) || []).length;
  const o = { no: m[1] === '—' ? null : +m[1], en: m[2] ? m[2].replace(/\/zh-tw$/, '').trim() : null, zh: clean(m[3]), type: TYPE[type] || type, beh: BEH[beh] || beh, zone: clean(m[6]), stars };
  mobs[o.no ? '#' + o.no : o.en?.toLowerCase() || o.zh] = o;
}

// rune list: name, rarity, level, bonuses (+ item id when the page has one)
const runes = [];
for (const row of P['Runes/zh-tw'].split(/\n\|-/)) {
  const m = row.match(/\|\s*\[\[([^\]|]+)\|([^\]]+)\]\]\s*\|\|(.*?)\|\|(.*?)\|\|(.*)/s);
  if (m) runes.push({ zh: clean(m[2]), id: idOf(m[1].replace(/\/zh-tw$/, '')), r: clean(m[3]), l: +clean(m[4]) || 1, b: clean(m[5].split('\n')[0]) });
}
console.assert(runes.length > 30, 'rune table parse');
fs.writeFileSync(D + 'wikigg-zh.json', JSON.stringify({ items, mobs, runes }, null, 1));
console.log('runes', runes.length);
console.log('items', Object.keys(items).length, 'mobs', Object.keys(mobs).length);
console.assert(items[1527] === '漆黑之靴', 'Bottes Noires -> 漆黑之靴');
console.assert(mobs['#1']?.zh === '腐化野豬' && mobs['#1'].stars === 1, 'bestiary row parse');
