// Merge both guides' data into site/data/*.js (window.X = JSON). Run: node tools/build.js <siteDir>
const fs = require('fs'), path = require('path'), L = require('./mod');
const D = __dirname + '/../raw/', OUT = process.argv[2];
const EX = f => D + 'exiled/' + fs.readdirSync(D + 'exiled').find(n => n.startsWith(f + '-'));
const A = require('./argo')();

// ---------- translation (exiled Spanish -> zh-TW, else English) ----------
const tw = L(EX('tw')).get('r'), en = L(EX('en')).get('r') || {}, lore = L(EX('wiki-lore.en')).get('e') || {};
const un = { ...lore, ...en, ...tw };
const RULES = [ // ported by hand from the site's tw rules (most common patterns only)
  [/^Punto oficial de SAO Minecraft \((.+)\)\.$/, m => `SAO Minecraft 官方標記點（${T(m[1])}）。`],
  [/^Donde apareces al entrar al Nivel (\d+)\.$/, m => `進入第 ${m[1]} 層時的出生點。`],
  [/^Nivel (\d+)$/, m => `第 ${m[1]} 層`],
  [/^(?:Nivel (\d+) · )?([\d.]+) de vida\.(?: Visto en (\d+) zonas del piso\.)?$/, m => (m[1] ? `等級 ${m[1]} · ` : '') + `${m[2]} 生命值。` + (m[3] ? ` 在本層 ${m[3]} 個區域出現。` : '')],
  [/^(Zona PvP\. )?Entrada(s?) vistas? en (.+)\.$/, m => (m[1] ? 'PvP 區域。' : '') + `入口位於 ${m[3]}。`],
  [/^(\d+) puntos de recolección por la zona\.$/, m => `附近有 ${m[1]} 個採集點。`],
  [/^Entrada a la mazmorra: (.+)$/, m => `地下城入口：${T(m[1])}`],
  [/^Clic derecho en el cartel para entrar\.$/, () => '對告示牌按右鍵進入。'],
  [/^(.+) \((Tala|Minería|Agricultura|Pesca) nv\. (\d+)\+\)$/, m => `${T(m[1])}（${T(m[2])} ${m[3]} 級以上）`],
  [/^([\d.]+(?:,\d+)?) col(?: \(se compra(; existencias limitadas)?\))?$/, m => `${m[1]} 珂爾` + (m[0].includes('(') ? (m[2] ? '（收購；數量有限）' : '（收購）') : '')],
  [/^([+\-−])(\d[\d.,]*) ?(%)?(\/s)?(?: de)? (\D.*)$/, m => `${m[1]}${m[2]}${m[3] || ''}${m[4] || ''} ${T(m[5])}`],
  [/^(\d+)(?: a (\d+))? piezas: (.+)$/, m => `${m[1]}${m[2] ? ' 至 ' + m[2] : ''} 件：` + m[3].split(/, | y /).map(x => T(x)).join('、')],
  [/^\d+ ?(s|m|min|h)$/, m => m[0]],
  [/^(Puesto de fabricación. )?En el juego: (.+).$/, m => (m[1] ? '製作台。' : '') + `遊戲內名稱：${m[2]}。`],
  [/^[^,]+(, [^,]+)+$/, m => m[0].split(', ').map(x => T(x)).join('、')],
  [/^Clase (.+)$/, m => `${T(m[1])}職業`],
  [/^Remodelador de (.+)$/, m => `重鑄師（${m[1]}）`],
  [/^(.+) ×(\d+)$/, m => T(m[1]) + ' ×' + m[2]],
];
let miss = {};
function T(s) {
  if (typeof s !== 'string' || !s) return s;
  const n = s.replace(/\|[a-z]+$/, '');
  const r = un[s] ?? un[n]; if (r != null) return r;
  for (const [re, f] of RULES) { const m = re.exec(n); if (m) return f(m); }
  miss[n] = (miss[n] || 0) + 1; return n;
}
const KEEP = new Set(['nivel', 'padre', 'id', 'capa', 'tipo', 'img', 'imagen', 'preview', 'creditos', 'original', 'mapa', 'zona', 'comprador', 'objeto', 'rareza', 'color', 'icono', 'bluemap', 'bluemapVuelo', 'fr', 'pistaOriginal', 'mundo', 'ficha', 'entrada', 'desde', 'inicio', 'grupo', 'url', 'puntos', 'propuestas']);
const deepT = (v, k) => typeof v === 'string' ? (KEEP.has(k) ? v : T(v)) : Array.isArray(v) ? v.map(x => deepT(x, k === 'puntos' ? 'puntos' : undefined)) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([kk, vv]) => [kk, deepT(vv, kk)])) : v;

// ---------- official zh names (argo) ----------
const ZH = A.SAO_ZHNAMES, zhById = {}, zhByEn = {};
for (const it of ZH.items) for (const id of it.ids || []) { const [t, k] = id.split('|'); if (t === 'i') zhByEn[k] = it.zh; else zhById[k] = it.zh; if (it.en) zhByEn[it.en] = it.zh; }
const zhOf = (enName, id) => (id != null && zhById[id]) || zhByEn[enName] || ZH.mobsByName[enName] || ZH.npcs[enName] || ZH.places[enName] || null;
// our own translations (raw/zh-extra-*.tsv, "English<TAB>中文"), used only where no official Chinese name exists
// Chinese names + bestiary facts from the fan wiki's zh-tw pages (tools/wikigg.js)
const WK = fs.existsSync(D + 'wikigg-zh.json') ? JSON.parse(fs.readFileSync(D + 'wikigg-zh.json', 'utf8')) : { items: {}, mobs: {} };
const wkMob = m => Object.values(WK.mobs).find(w => (m.zh && w.zh === m.zh) || (w.en && w.en.toLowerCase() === String(m.nombre).toLowerCase()));
const zhExtra = {};
for (const f of fs.readdirSync(D).filter(n => /^zh-extra-\d+\.tsv$/.test(n)))
  for (const l of fs.readFileSync(D + f, 'utf8').split(/\r?\n/)) { const [en, zh] = l.split('\t'); if (en && zh) zhExtra[en.trim()] = zh.trim(); }
const normX = x => String(x || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const zhByFr = {}; for (const it of ZH.items) if (it.fr) zhByFr[normX(it.fr)] = it.zh;
// official name from the codex number or English name, else our translation; [name, unofficial?]
const mobZh = m => { const en = lore[m.nombre] || un[m.nombre] || m.nombre; const off = ZH.mobsByName[en] || (m.codice && ZH.mobs[String(m.codice).padStart(3, '0')]); return off ? [off, false] : zhExtra[en] ? [zhExtra[en], true] : [null, false]; };

// ---------- MAP ----------
const M = L(EX('map'));
const floors = M.get('u');
const ptsRaw = ['ue', 'A', 'f', 'C', 'h', 'T', 'k', 'N', 'B', 'P', 'q'].flatMap(n => M.get(n) || []);
const tpNames = M.get('g') || {};
const over = new Map((M.get('y') || []).map(o => [o.id, o]));
const ids = new Set(ptsRaw.map(p => p.id));
let points = [...ptsRaw.map(p => ({ ...p, ...(tpNames[p.id] ? { tp: tpNames[p.id] } : {}), ...(over.get(p.id) || {}) })), ...[...over.values()].filter(o => !ids.has(o.id))]
  .map(p => ((p.capa === 'pnj' || p.capa === 'poi') && Array.isArray(p.objetos) && p.objetos.some(o => o.receta)) ? { ...p, capa: 'tiendas' } : p)
  .filter(p => p.nivel != null && p.wx != null);
const norm = x => String(x || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const frZh = {};
const addFr = (fr, zh) => { if (fr && zh && !frZh[norm(fr)]) frZh[norm(fr)] = zh; };
for (const m of L(EX('mobs')).get('l') || []) { const [z] = mobZh(m); addFr(m.original, z); addFr(m.nombre, z); addFr(lore[m.nombre] || un[m.nombre], z); }
{ const d1 = L(D + 'argo/data.js'), d23 = L(D + 'argo/data23.js');
  for (const F of [{ zones: d1.get('ZONES'), spots: d1.get('SPOTS'), towns: d1.get('TOWNS') }, d23.get('F2'), d23.get('F3')]) {
    for (const z of Object.values(F.zones || {})) { addFr(z.fr, z.zl || z.zh); addFr(z.n, z.zl || z.zh); }
    for (const x of [...(F.spots || []), ...(F.towns || [])]) { addFr(x.csrc, x.zh); addFr(x.tp, x.zh); addFr(x.n, x.zh); }
  }
  for (const [en, zh] of Object.entries(ZH.places)) addFr(en, zh);
  for (const [en, zh] of Object.entries(ZH.mobsByName)) addFr(en, zh);
}
points = points.map(p => { const t = deepT(p); t.es = p.nombre; const z = zhOf(t.nombre) || frZh[norm(t.nombre)] || frZh[norm(p.nombre)] || frZh[norm(p.original)]; if (z && z !== t.nombre) t.zh = z; return t; });

// image bounds in world coords for each map; floor 1 has no "plano": fit from (x%,y%) <-> (wx,wz)
function fit(ps, a, b) { // least squares b = c0 + c1*a
  const n = ps.length, sa = ps.reduce((s, p) => s + p[a], 0), sb = ps.reduce((s, p) => s + p[b], 0);
  const saa = ps.reduce((s, p) => s + p[a] * p[a], 0), sab = ps.reduce((s, p) => s + p[a] * p[b], 0);
  const c1 = (n * sab - sa * sb) / (n * saa - sa * sa); return [(sb - c1 * sa) / n, c1];
}
const maps = floors.map(f => {
  const ps = points.filter(p => String(p.nivel) === String(f.id) && p.x != null);
  let b;
  if (f.plano) b = [f.plano.x0, f.plano.z0, f.plano.x0 + f.plano.lado, f.plano.z0 + f.plano.lado * (f.alto || f.ancho) / (f.ancho || f.alto)];
  else if (ps.length > 3) { const [x0, kx] = fit(ps, 'x', 'wx'), [z0, kz] = fit(ps, 'y', 'wz'); b = [x0, z0, x0 + 100 * kx, z0 + 100 * kz]; }
  return {
    id: String(f.id), name: T(f.nombre) || ('第 ' + f.id + ' 層'), parent: f.padre ? String(f.padre) : null, dungeon: !!f.mazmorra, quest: !!f.mision,
    group: f.grupo || null, floorNo: f.planta || null, title: T(f.titulo || f.rotulo || ''), short: T(f.corto || ''),
    img: f.imagen ? 'maps/' + path.basename(f.imagen) : null, bounds: b,
    guide: (f.guia || []).map(g => ({ text: T(g.texto || ''), pts: g.puntos || [] })),
    routes: (f.rutas || []).filter(r => Array.isArray(r.puntos)).map(r => ({ name: T(r.nombre || ''), color: r.color, pts: r.puntos })),
  };
});
const layers = (M.get('xe') || []).map(l => ({ id: l.id, name: T(l.nombre || l.id), color: l.color, icon: l.icono }));

// argo extras: floor-1 monster zones (polygons), quest NPCs, boss spawns, NPCs
const d1 = L(D + 'argo/data.js'), d23 = L(D + 'argo/data23.js');
const F = { 1: { towns: d1.get('TOWNS'), spots: d1.get('SPOTS'), boss: d1.get('BOSS_SPAWNS'), quests: d1.get('QUESTS'), zones: d1.get('ZONES'), M: d1.get('M') }, 2: d23.get('F2'), 3: d23.get('F3') };
const extra = [];
for (const fl of ['1', '2', '3']) {
  const f = F[fl]; if (!f) continue;
  for (const s of f.spots || []) extra.push({ id: 'argo-' + fl + '-' + s.id, nivel: fl, capa: s.kind === 'mob' ? 'zonas' : s.kind === 'boss' ? 'jefes' : s.kind === 'dungeon' ? 'jefes' : 'poi', nombre: s.zh || s.n, en: s.n, wx: s.x, wz: s.z, area: s.area, nota: s.note, mons: s.mons, items: s.items, src: 'argo' });
  for (const b of f.boss || f.BOSS_SPAWNS || []) extra.push({ id: 'argo-b-' + fl + '-' + b[0] + b[1], nivel: fl, capa: 'spawns', nombre: (ZH.mobsByName[b[0]] || b[0]) + ' 重生點', en: b[0], wx: b[1], wz: b[2], src: 'argo' });
  for (const q of f.quests || []) { const a = q.args || [q.npc, q.town, q.x, q.z, q.need, q.xp, q.money]; if (a[2] == null) continue; extra.push({ id: 'argo-q-' + fl + '-' + a[0], nivel: fl, capa: 'misiones', nombre: a[0], wx: a[2], wz: a[3], need: a[4], xp: a[5], money: a[6], src: 'argo' }); }
}
for (const [fl, list] of Object.entries(A.SAO_NPCS)) for (const r of list) extra.push({ id: 'argo-n-' + fl + '-' + r[1] + r[2], nivel: fl, capa: 'npcs', nombre: ZH.npcs[r[1]] || r[1], en: r[1], role: r[0], wx: r[2], wz: r[3], beta: r[4] === 'beta', under: r[5] || 0, src: 'argo' });
layers.push({ id: 'zonas', name: '怪物分佈範圍', color: '#ff7a59', icon: 'area' }, { id: 'spawns', name: '首領重生點', color: '#ff3d6e', icon: 'x' }, { id: 'misiones', name: '支線任務 NPC', color: '#ffe066', icon: 'quest' }, { id: 'npcs', name: '功能 NPC', color: '#5cc8ff', icon: 'diamond' });

// main quest steps with coords
const mainq = A.SAO_MAINQ;
for (const [fl, qs] of Object.entries(mainq)) qs.forEach((q, qi) => (q.s || []).forEach((s, si) => { if (s[1] != null) extra.push({ id: `mq-${fl}-${qi}-${si}`, nivel: fl, capa: 'principal', nombre: `${(ZH.quests[q.t] || {}).zh || q.t}・${si + 1}`, nota: s[0], wx: s[1], wz: s[2], q: qi, src: 'argo' }); }));
layers.push({ id: 'principal', name: '主線任務步驟', color: '#c9a7ff', icon: 'quest' });

// DelayedCode SAO-MC-Interactive-Map "Current Data": add points not already within 10 blocks of one we have
{
  const { parseAt } = require('./lit');
  const DCCAT = { biomes: 'biomas', bossSpawns: 'spawns', sideQuests: 'misiones', dungeons: 'jefes', farmingSpots: 'recursos', worldEvents: 'poi', mainQuests: 'principal' };
  const all = [...points, ...extra];
  let added = 0;
  for (const f of ['maps_current.js', 'maps_mainquests.js']) {
    const s = fs.readFileSync(D + 'dc/' + f, 'utf8');
    for (const m of s.matchAll(/Object\.assign\(\s*[\w.]+\s*,\s*/g)) for (const [id, v] of Object.entries(parseAt(s, m.index + m[0].length).value)) {
      if (!v.coords || !v.floor) continue;
      const fl = v.floor.replace('floor', ''), x = v.coords.x, z = v.coords.z;
      if (all.some(p => String(p.nivel) === fl && Math.hypot(p.wx - x, p.wz - z) < 10)) continue;
      extra.push({ id: 'dc-' + id, nivel: fl, capa: DCCAT[v.category] || 'npcs', nombre: zhOf(v.title) || frZh[norm(v.title)] || v.title, en: v.title, wx: x, wz: z, nota: v.description, src: 'dc' }); added++;
    }
  }
  layers.push({ id: 'biomas', name: '生態區域', color: '#9be564', icon: 'house' });
  console.log('delayedcode added', added);
}

fs.mkdirSync(OUT + '/data', { recursive: true });
const W = (f, name, obj) => fs.writeFileSync(`${OUT}/data/${f}.js`, `window.${name}=${JSON.stringify(obj)};\n`);
for (const p of [...points, ...extra]) { // our translation where no official Chinese name was found
  const z = !p.zh && !/[㐀-鿿]/.test(p.nombre || '') && (zhExtra[p.nombre] || zhExtra[p.en]);
  if (z) { p.zh = z; p.zhU = 1; }
}
W('map', 'MAPDATA', { maps, layers, points: [...points, ...extra] });

// ---------- ITEMS ----------
const WT = L(EX('wikiTodo'));
const itemOver = WT.get('a') || {};
const items = [...(WT.get('r') || []), ...(WT.get('n') || [])].map(it => {
  const o = { ...it, ...(itemOver[it.id] || {}) }, juego = { ...(it.juego || {}), ...((itemOver[it.id] || {}).juego || {}) };
  const enName = lore[it.n] || un[it.n] || it.n;
  const off = zhById[it.id] || zhByEn[enName] || zhByFr[normX(it.fr)];
  return { id: it.id, zh: off || WK.items[it.id] || zhExtra[enName] || null, ...(off ? {} : WK.items[it.id] ? { zhW: 1 } : zhExtra[enName] ? { zhU: 1 } : {}), en: enName, fr: it.fr, c: o.c, r: o.r, l: o.l, s: o.s, lore: lore[it.lore] || un[it.lore] || null, img: !!it.img, game: !!juego.nuevo, src: deepT(juego.f || []) };
});
const IDX = L(EX('itemIndex'));
W('items', 'ITEMS', items);

// ---------- MOBS ----------
const MB = L(EX('mobs'));
const loot = MB.get('t') || {}, zonesEx = MB.get('n') || [];
const itemZhLc = {}; // loot names differ in letter case from item names ("Boar hide" / "Boar Hide")
for (const [en, zh] of [...Object.entries(zhExtra), ...items.filter(i => i.zh).map(i => [i.en, i.zh]), ...Object.entries(zhByEn)]) itemZhLc[en.toLowerCase()] = zh;
const mobs = (MB.get('l') || []).map(m => { const [zh, u] = mobZh(m); const w = wkMob({ zh, nombre: m.nombre }); return { ...deepT(m), zh, ...(u ? { zhU: 1 } : {}), ...(w ? { beh: /動攻擊/.test(w.beh) ? '主動攻擊' : w.beh, stars: w.stars } : {}), botin: (m.botin || []).map(b => { const name = T((loot[b.objeto] || {}).nombre || b.objeto); return { ...b, name, zh: itemZhLc[String(name).toLowerCase()] || null, img: (loot[b.objeto] || {}).img }; }) }; });
W('mobs', 'MOBS', { zones: zonesEx.map(z => ({ id: z.id, name: T(z.nombre), fr: z.original })), mobs });

// ---------- GUIDE (argo, already zh) ----------
W('guide', 'GUIDE', {
  mainq, questZh: ZH.quests, sideq: Object.fromEntries(['1', '2', '3'].map(fl => [fl, (F[fl].quests || []).map(q => q.args || [q.npc, q.town, q.x, q.z, q.need, q.xp, q.money, q.bonus, q.raw])])),
  towns: Object.fromEntries(['1', '2', '3'].map(fl => [fl, F[fl].towns])), zones: Object.fromEntries(['1', '2', '3'].map(fl => [fl, F[fl].zones])),
  recipes: A.SAO_RECIPES, classes: A.SAO_CLASSES, skills: A.SAO_GAMESKILLS, bosses: A.SAO_BOSSES, events: A.SAO_EVENTS, sets: A.SAO_SETS,
  runes: WK.runes || [], zhItems: { ...zhExtra, ...zhByEn }, zhNpcs: ZH.npcs, zhPlaces: ZH.places, buyback: A.SAO_BUYBACK,
});

const top = Object.entries(miss).sort((a, b) => b[1] - a[1]);
console.log('points', points.length, 'extra', extra.length, 'maps', maps.length, 'items', items.length, 'mobs', mobs.length, 'untranslated', top.length);
console.log(top.slice(0, 40).map(([k, v]) => v + ' ' + k.slice(0, 90)).join('\n'));
console.log(maps.map(m => m.id + ' ' + JSON.stringify(m.bounds)).join('\n'));
