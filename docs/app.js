/* 艾恩葛朗特攻略本 — data: data/*.js (built by tools/build.js) */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } } };
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, 1800); }
function copy(text) { try { navigator.clipboard.writeText(text).then(() => toast('已複製：' + text), () => toast(text)); } catch { toast(text); } }
function modal(html) { $('#modalBody').innerHTML = html; $('#modal').hidden = false; }
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal' || e.target.closest('.x')) $('#modal').hidden = true; });
document.addEventListener('keydown', e => { if (e.key === 'Escape') $('#modal').hidden = true; });
// theme toggle: explicit choice overrides the OS / host setting
const isDark = () => (document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')) === 'dark';
if (store.get('theme')) document.documentElement.dataset.theme = store.get('theme');
$('#themeBtn').onclick = () => { const t = isDark() ? 'light' : 'dark'; document.documentElement.dataset.theme = t; store.set('theme', t); };
// SAO-style ripple on buttons and cards
document.addEventListener('pointerdown', e => {
  const b = e.target.closest('button,.card'); if (!b || b.closest('.leaflet-container') || b.id === 'themeBtn') return;
  const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height), s = document.createElement('span');
  if (getComputedStyle(b).position === 'static') b.style.position = 'relative';
  b.style.overflow = 'hidden'; s.className = 'ripple';
  s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
  b.append(s); setTimeout(() => s.remove(), 550);
});

const RAR = { c: ['普通', 1], b: ['稀有', 2], a: ['史詩', 3], s: ['傳說', 4], splus: ['神話', 5], splusplus: ['神聖', 6], ss: ['特殊', 7] };
const rarCss = r => `--rc:var(--r-${r || 'c'})`;
const CAT = { sword: '劍', dagger: '匕首', bow: '弓', crossbow: '弩', staff_mage: '法師法杖', staff_shaman: '薩滿法杖', catalyst: '法器', shield: '盾牌', quiver: '箭袋', offhand_dagger: '副手匕首', armor: '護甲', ring: '戒指', amulet: '護符', bracelet: '手鐲', gloves: '手套', artifact: '神器', tool: '工具', consumable: '消耗品', consumable_item: '消耗類物品', food: '食物', crystal: '水晶', fortifier: '強化劑', potion_heal: '生命藥水', potion_mana: '魔力藥水', potion_stamina: '耐力藥水', scroll: '卷軸', gem_stone: '符文/寶石', material: '材料', miner_job: '採礦', lumberjack_job: '伐木', farmer_job: '農耕', fishing_job: '釣魚', halloween: '萬聖節', noel2025: '2025 聖誕', lunar: '農曆新年', saint_valentin: '情人節', dungeon_key: '地城鑰匙', key_crate: '寶箱鑰匙' };
const STAT = { 'Attack Speed': '攻擊速度', 'Movement Speed': '移動速度', 'Movement_speed': '移動速度', 'Cooldown Reduction': '技能加速', 'Skill Critical Strike Power': '技能爆擊傷害', 'Skill Critical Strike Chance': '技能爆擊率', 'Defense': '防禦', 'Max Health': '最大生命', 'Physical Damage': '物理傷害', 'Stamina Regeneration': '耐力恢復', 'Projectile Damage': '投射物傷害', 'Max Mana': '最大魔力', 'Heal Bonus': '治療加成', 'Magic Damage': '魔法傷害', 'Weapon Damage': '武器傷害', 'Max Stamina': '最大耐力', 'Skill Damage': '技能傷害', 'Mana Regeneration': '魔力恢復', 'Lifesteal': '生命偷取', 'Critical Strike Power': '爆擊傷害', 'Spell Vampirism': '法術吸血', 'Critical Strike Chance': '爆擊率', 'Health Regeneration': '生命恢復', 'Dodge Rating': '閃避', 'Block Rating': '格擋率', 'Damage Reduction': '傷害減免', 'Knockback Resistance': '擊退抗性', 'Max Durability': '耐久', 'Pickaxe Power': '採礦力', 'Item Cooldown': '冷卻', 'Restore Health': '恢復生命', 'Restore Mana': '恢復魔力', 'Restore Stamina': '恢復耐力', 'Restore Food': '恢復飽食', 'Range': '射程', 'Block Power': '格擋力', 'Faction Damage Dungeon': '地城陣營傷害', 'Fall Damage Reduction': '摔落傷害減免', 'Dodge Cooldown Reduction': '閃避冷卻縮短', 'Shield Durability': '盾牌耐久', 'Sneaking Speed': '潛行速度', 'Entity Interaction Range': '互動距離', 'Max Consume': '最多食用', 'Restore Saturation': '恢復飽和度', 'Random Unsocket': '隨機拆除符文' };
const statZh = k => STAT[k] || k.replace(/^Required (\w+)/, '需求 $1').replace(/^Additional (\w+)/, '額外 $1');
const PCT = /Chance|Power|Damage|Lifesteal|Vampirism|Reduction|Bonus|Rating/;
const statLine = (k, v) => `${statZh(k)} ${typeof v === 'number' && v > 0 ? '+' : ''}${v}${typeof v === 'number' && PCT.test(k) && !/Weapon Damage/.test(k) ? '%' : ''}`;

const ITEMS = window.ITEMS, GUIDE = window.GUIDE, MOBS = window.MOBS;
const RENDER = {};
const loadJs = src => new Promise(ok => { const s = document.createElement('script'); s.charset = 'utf-8'; s.src = src; s.onload = s.onerror = ok; document.head.append(s); });
const imgM = p => (window.IMG_M || {})[String(p || '').replace(/\?.*$/, '')] || '';

/* ================= MAP ================= */
const MD = window.MAPDATA;
const LAYER = {
  regiones: ['區域・城鎮', '#d9a7ff'], poi: ['地標・傳送點', '#8df0a0'], jefes: ['首領・地城入口', '#ff6b6b'], spawns: ['首領重生點', '#ff3d6e'],
  mobs: ['怪物', '#ff9f6b'], zonas: ['怪物分佈範圍', '#ff7a59'], tiendas: ['商店・工匠・配方', '#7ee0c3'], compradores: ['戰利品收購商', '#ffd166'],
  pnj: ['NPC', '#7fd9ff'], npcs: ['功能 NPC', '#5cc8ff'], misiones: ['支線任務 NPC', '#ffe066'], principal: ['主線任務步驟', '#c9a7ff'],
  biomas: ['生態區域', '#9be564'], recursos: ['採集點', '#e8b46b'], objetivos: ['任務目標', '#ff8fd8'], beta: ['測試版資料（可能已改）', '#c3a6ff'],
};
const ICON = { boss: '💀', dungeon: '🏰', mob: '🐾', merchant: '🛒', smith: '⚒️', buyer: '💰', resource: '⛏️', region: '🏘️', special: '⭐', poi: '⭐', pnj: '💬', guard: '🛡️', pk: '⚔️', unknown: '❓', accessory: '💍', beta: '🧪' };
const CAPA_ICON = { biomas: '🌿', zonas: '🐾', spawns: '💀', misiones: '❗', npcs: '🧑', principal: '📜', objetivos: '🎯', recursos: '⛏️' };
const zhTag = o => o.zhU ? '<span class="tag" title="官方未有中文名，這是本站自己的翻譯">非官方譯名</span>' : o.zhW ? '<span class="tag" title="官方未有中文名，這是玩家社群的翻譯">社群譯名</span>' : '';
const pName = p => p.zh || p.nombre;
const pSub = p => [p.zh && p.zh !== p.nombre ? p.nombre : null, p.en && p.en !== pName(p) ? p.en : null, p.original].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(' · ');
const ll = (x, z) => [-z, x];
const mapById = Object.fromEntries(MD.maps.map(m => [m.id, m]));
const ptsByMap = {};
for (const p of MD.points) (ptsByMap[String(p.nivel)] ||= []).push(p);
const ptById = Object.fromEntries(MD.points.map(p => [p.id, p]));
const safe = id => String(id).normalize('NFD').replace(/[^A-Za-z0-9-]+/g, '-');
const ptBySafe = Object.fromEntries(MD.points.map(p => [safe(p.id), p.id]));
const num = n => (n < 0 ? 'n' : '') + Math.abs(Math.round(n));
const unnum = s => (s[0] === 'n' ? -1 : 1) * +s.replace(/^n/, '');
function setHash(h, msg) { history.replaceState(null, '', '#' + h); copy(location.href); if (msg) toast(msg); }

const map = L.map('map', { crs: L.CRS.Simple, minZoom: -4, maxZoom: 4, zoomSnap: 0.25, zoomDelta: 0.5, attributionControl: false });
let cur = null, overlay = null, groups = {}, markers = {}, routeLayer = L.layerGroup().addTo(map), hidden = new Set(store.get('hiddenLayers', ['beta', 'npcs', 'principal', 'spawns', 'misiones']));

// map selector
const sel = $('#mapSel');
const floorMaps = MD.maps.filter(m => !m.parent);
sel.innerHTML = floorMaps.map(f => `<optgroup label="${esc(f.name)}"><option value="${f.id}">${esc(f.name)}（大地圖）</option>` +
  MD.maps.filter(m => m.parent === f.id).map(m => `<option value="${m.id}">${m.quest ? '📜' : '🏰'} ${esc(m.name)}${m.title ? '・' + esc(m.title) : ''}</option>`).join('') + '</optgroup>').join('');
sel.onchange = () => showMap(sel.value);

function icon(p) {
  const c = (LAYER[p.capa] || ['', '#aaa'])[1];
  const e = CAPA_ICON[p.capa] || ICON[p.tipo] || '•';
  return L.divIcon({ className: '', html: `<div class="mk${seen.has(p.id) ? ' seen' : ''}" style="background:${c}">${e}${fav.has(p.id) ? '<b class="fav">★</b>' : ''}</div>`, iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -12] });
}
const fmtXYZ = p => `X ${Math.round(p.wx)}${p.wy != null ? ' · Y ' + Math.round(p.wy) : ''} · Z ${Math.round(p.wz)}`;
function popupHtml(p) {
  const list = (arr, f) => arr && arr.length ? `<ul>${arr.map(f).join('')}</ul>` : '';
  const iz = n => esc((GUIDE.zhItems[n] || '') ? `${GUIDE.zhItems[n]}（${n}）` : n);
  let h = `<div class="pop"><h3>${esc(pName(p))}</h3>`;
  const sub = pSub(p); if (sub) h += `<div class="sub">${esc(sub)}</div>`;
  h += `<div class="sub">${zhTag(p)}${esc((LAYER[p.capa] || [p.capa])[0])}${p.tp ? ' · 可傳送：' + esc(p.tp) : ''}</div>`;
  h += `<div class="xyz">${fmtXYZ(p)} <button data-copy="${Math.round(p.wx)} ${p.wy != null ? Math.round(p.wy) + ' ' : ''}${Math.round(p.wz)}">複製</button><button data-share="${esc(p.id)}">🔗</button></div>`;
  if (p.nota) h += `<div class="note">${esc(p.nota)}</div>`;
  if (p.mons) h += `<div class="note">怪物：${p.mons.map(m => esc(MOBZH[m] || m)).join('、')}</div>`;
  if (p.items) h += `<div class="note">可採集：${p.items.map(iz).join('、')}</div>`;
  if (p.need) h += `<div class="note">需要：${p.need.map(n => iz(n[0]) + ' ×' + n[1]).join('、')}${p.xp ? `<br>獎勵：${p.xp} 經驗` : ''}${p.money ? `、${p.money} 珂爾` : ''}</div>`;
  if (p.objetos) h += `<b>出售／製作</b>` + list(p.objetos, o => `<li>${iz(o.nombre)}${o.precio ? ' — ' + esc(o.precio) : ''}${o.receta ? ` <small>${esc([o.receta.coste, o.receta.tiempo, (o.receta.materiales || []).map(m => m[0] + '×' + m[1]).join(' + ')].filter(Boolean).join(' · '))}</small>` : ''}</li>`);
  if (p.compraObjetos) h += `<b>收購</b>` + list(p.compraObjetos, o => `<li>${iz(o.nombre)} — ${esc(o.precio || '')}</li>`);
  else if (p.compra) h += `<div class="note">收購：${esc(p.compra)}</div>`;
  if (p.beta) h += `<div class="cred">⚠ 測試版資料，位置可能已改</div>`;
  h += '</div>';
  return h;
}
const MOBZH = {};
for (const m of window.MOBS.mobs) if (m.zh) MOBZH[m.nombre] = m.zh;

/* ---- favourites / seen (this browser only) and the 全部 / 待辦 / 最愛 filter ---- */
const fav = new Set(store.get('favPts', [])), seen = new Set(store.get('seenPts', []));
let ptView = store.get('ptView', 'all');
const ptFilter = p => ptView === 'todo' ? !seen.has(p.id) : ptView === 'fav' ? fav.has(p.id) : true;
function renderPtView() {
  document.querySelectorAll('#ptView button').forEach(b => b.classList.toggle('on', b.dataset.v === ptView));
  const ps = ptsByMap[cur?.id] || [];
  $('#ptCount').textContent = `已看過 ${ps.filter(p => seen.has(p.id)).length} / ${ps.length} · 最愛 ${ps.filter(p => fav.has(p.id)).length}`;
}
$('#ptView').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (!b) return; ptView = b.dataset.v; store.set('ptView', ptView); showMap(cur.id, true); });
function toggleMark(set, key, id) {
  set.has(id) ? set.delete(id) : set.add(id); store.set(key, [...set]);
  const p = ptById[id]; markers[id]?.setIcon(icon(p)); renderPtView();
  if (detailId === id) openDetail(p);
  if (!ptFilter(p) && markers[id]) { map.removeLayer(markers[id]); groups[p.capa]?.removeLayer(markers[id]); delete markers[id]; }
}

/* ---- right-hand detail panel (replaces map popups for points) ---- */
let detailId = null;
function openDetail(p) {
  if (!p) return; detailId = p.id;
  const d = $('#detail'); d.hidden = false;
  d.innerHTML = `<div class="dhead"><span class="dmap">${esc((mapById[p.nivel] || {}).name || p.nivel)}</span>
    <button class="dbtn${fav.has(p.id) ? ' on' : ''}" data-fav="${esc(p.id)}" title="加入最愛" aria-label="加入最愛">★</button>
    <button class="dbtn${seen.has(p.id) ? ' on' : ''}" data-seen="${esc(p.id)}" title="標記為已看過" aria-label="標記為已看過">✓</button>
    <button class="dbtn" data-close aria-label="關閉">✕</button></div>${popupHtml(p)}`;
}
function closeDetail() { detailId = null; const d = $('#detail'); if (d) d.hidden = true; }
$('#detail').addEventListener('click', e => {
  const f = e.target.closest('[data-fav]'); if (f) return toggleMark(fav, 'favPts', f.dataset.fav);
  const s = e.target.closest('[data-seen]'); if (s) return toggleMark(seen, 'seenPts', s.dataset.seen);
  if (e.target.closest('[data-close]')) closeDetail();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetail(); });

/* ---- drop lookup: which monsters drop an item, and where they are ---- */
const lc = s => String(s || '').toLowerCase().trim(), mobPts = {};
for (const p of MD.points) for (const m of p.mons || []) (mobPts[lc(m)] ||= []).push(p.id);
for (const m of window.MOBS.mobs) for (const p of MD.points) if (!p.mons && (lc(p.nombre) === lc(m.nombre) || (m.zh && p.zh === m.zh))) (mobPts[lc(m.nombre)] ||= []).push(p.id);
$('#dropSearch').addEventListener('input', e => {
  const q = e.target.value.trim().toLowerCase(), out = $('#dropResults');
  if (q.length < 1) return out.innerHTML = '';
  const hits = [];
  for (const m of window.MOBS.mobs) for (const b of m.botin) if ([b.zh, b.name].some(n => n && n.toLowerCase().includes(q))) hits.push({ m, b });
  hits.sort((a, c) => c.b.prob - a.b.prob);
  out.innerHTML = hits.slice(0, 40).map(({ m, b }) => { const pid = [...(mobPts[lc(m.nombre)] || []), ...(mobPts[lc(MOBZH[m.nombre])] || [])].find(id => ptById[id]); return `<div ${pid ? `data-pid="${esc(pid)}"` : `data-mobid="${esc(m.id)}"`}><b>${esc(b.zh || b.name)}</b> ${b.prob}% <small>← ${esc(m.zh || m.nombre)}${pid ? ' · 📍 ' + esc((mapById[ptById[pid].nivel] || {}).name || '') : ' · 怪物資料'}</small></div>`; }).join('') || '<div><small>沒有怪物掉落這個物品</small></div>';
});
$('#dropResults').addEventListener('click', e => {
  const d = e.target.closest('[data-pid],[data-mobid]'); if (!d) return; $('#dropResults').innerHTML = '';
  d.dataset.pid ? (focusPoint(d.dataset.pid), closeSideMobile()) : mobModal(d.dataset.mobid);
});

/* ---- floor picker: 1–100 grid like the in-game floor list ---- */
$('#btnFloors').onclick = () => {
  const open = new Set(floorMaps.map(f => String(f.id)));
  modal(`<h2>🏯 選擇樓層</h2><p class="hint">目前開放第 ${[...open].join('、')} 層。</p>
  <div class="floorgrid">${Array.from({ length: 100 }, (_, i) => String(i + 1)).map(n => `<button class="fl${open.has(n) ? ' open' : ''}${cur && String(cur.id) === n ? ' cur' : ''}" ${open.has(n) ? `data-floor="${n}"` : 'disabled'}>${n}${open.has(n) ? '' : '<i>🔒</i>'}</button>`).join('')}</div>
  <div class="legend"><span><i class="open"></i>可進入</span><span><i></i>未開放</span></div>
  ${floorMaps.map(f => { const subs = MD.maps.filter(m => m.parent === f.id); return subs.length ? `<h3>${esc(f.name)}・地下城與任務地圖</h3><div class="chips">${subs.map(m => `<a href="#" data-floor="${m.id}">${m.quest ? '📜' : '🏰'} ${esc(m.name)}${m.title ? '・' + esc(m.title) : ''}</a>`).join('')}</div>` : ''; }).join('')}`);
};
$('#modalBody').addEventListener('click', e => { const b = e.target.closest('[data-floor]'); if (!b) return; e.preventDefault(); $('#modal').hidden = true; switchTab('map'); showMap(b.dataset.floor); });

function showMap(id, keepView) {
  const m = mapById[id]; if (!m) return;
  cur = m; sel.value = id;
  if (overlay) map.removeLayer(overlay);
  Object.values(groups).forEach(g => map.removeLayer(g));
  routeLayer.clearLayers(); groups = {}; markers = {};
  const b = m.bounds;
  if (m.img && b) { overlay = L.imageOverlay(m.img, [ll(b[0], b[1]), ll(b[2], b[3])]).addTo(map); }
  for (const p of ptsByMap[id] || []) {
    const g = groups[p.capa] ||= L.layerGroup();
    let mk;
    if (!ptFilter(p)) continue;
    if (p.area) L.polygon(p.area.map(a => ll(a[0], a[1])), { color: LAYER.zonas[1], weight: 1.5, fillOpacity: .12 }).on('click', () => openDetail(p)).addTo(g);
    mk = L.marker(ll(p.wx, p.wz), { icon: icon(p), title: pName(p), riseOnHover: true }).on('click', () => openDetail(p));
    if (p.capa === 'regiones') mk.bindTooltip(esc(pName(p)), { permanent: true, direction: 'bottom', offset: [0, 10], className: 'lbl' });
    mk.addTo(g); markers[p.id] = mk;
  }
  for (const r of m.routes || []) L.polyline(r.pts.map(q => ll(q[0], q[2])), { color: r.color || '#ffd23f', weight: 3, dashArray: '6 6' }).bindTooltip(esc(r.name || '路線')).addTo(routeLayer);
  for (const [k, g] of Object.entries(groups)) if (!hidden.has(k)) g.addTo(map);
  renderLayers(); renderGuide(); renderMine(); renderJM(); renderPtView(); closeDetail();
  if (!keepView) {
    if (b) map.fitBounds([ll(b[0], b[1]), ll(b[2], b[3])]);
    else { const ps = ptsByMap[id] || []; if (ps.length) map.fitBounds(ps.map(p => ll(p.wx, p.wz)), { padding: [40, 40] }); }
  }
  map.setMaxBounds(null);
}
function renderLayers() {
  const counts = {}; for (const p of ptsByMap[cur.id] || []) counts[p.capa] = (counts[p.capa] || 0) + 1;
  $('#layerList').innerHTML = Object.keys(LAYER).filter(k => counts[k]).map(k => `<label><input type="checkbox" data-layer="${k}" ${hidden.has(k) ? '' : 'checked'}><span class="dot" style="background:${LAYER[k][1]}"></span>${LAYER[k][0]}<span class="n">${counts[k]}</span></label>`).join('') || '<p class="hint">這張圖沒有標記。</p>';
}
$('#layerList').addEventListener('change', e => {
  const k = e.target.dataset.layer; if (!k) return;
  e.target.checked ? (hidden.delete(k), groups[k]?.addTo(map)) : (hidden.add(k), groups[k] && map.removeLayer(groups[k]));
  store.set('hiddenLayers', [...hidden]);
});
$('#layAll').onclick = () => { hidden.clear(); store.set('hiddenLayers', []); showMap(cur.id, true); };
$('#layNone').onclick = () => { Object.keys(LAYER).forEach(k => hidden.add(k)); store.set('hiddenLayers', [...hidden]); showMap(cur.id, true); };

function renderGuide() {
  const gp = $('#guidePanel'), m = cur;
  const siblings = m.group ? MD.maps.filter(x => x.group === m.group) : [];
  if (!m.guide.length && !siblings.length) { gp.hidden = true; return; }
  gp.hidden = false;
  gp.innerHTML = `<h3>${m.quest ? '📜' : '🏰'} ${esc(m.name)}${m.title ? '・' + esc(m.title) : ''}</h3>` +
    (siblings.length > 1 ? `<div class="row">${siblings.map(s => `<button class="mini" data-map="${s.id}" ${s.id === m.id ? 'style="border-color:var(--accent)"' : ''}>${esc(s.title || ('第 ' + s.floorNo + ' 部分'))}</button>`).join('')}</div>` : '') +
    (m.guide.length ? `<ol>${m.guide.map((g, i) => `<li data-step="${i}">${esc(g.text)}</li>`).join('')}</ol>` : '') +
    (m.parent ? `<button class="mini" data-map="${m.parent}">↩ 返回第 ${m.parent} 層</button>` : '');
}
$('#guidePanel').addEventListener('click', e => {
  const mb = e.target.closest('[data-map]'); if (mb) return showMap(mb.dataset.map);
  const li = e.target.closest('[data-step]'); if (!li) return;
  const ids = cur.guide[+li.dataset.step].pts.filter(id => markers[id]);
  if (!ids.length) return;
  ids.forEach(id => { const p = ptById[id]; hidden.delete(p.capa); groups[p.capa]?.addTo(map); });
  map.once('moveend', () => { ids.forEach(id => markers[id].getElement()?.firstChild?.classList.add('hl')); openDetail(ptById[ids[0]]); setTimeout(() => ids.forEach(id => markers[id].getElement()?.firstChild?.classList.remove('hl')), 3200); });
  map.flyToBounds(ids.map(id => markers[id].getLatLng()), { padding: [80, 80], maxZoom: 1.5, duration: .6 });
});

function focusPoint(id) {
  const p = ptById[id]; if (!p) return;
  switchTab('map');
  if (!cur || cur.id !== String(p.nivel)) showMap(String(p.nivel));
  if (hidden.has(p.capa)) { hidden.delete(p.capa); groups[p.capa]?.addTo(map); renderLayers(); }
  if (!ptFilter(p)) { ptView = 'all'; renderPtView(); showMap(cur.id, true); }
  map.once('moveend', () => { const mk = markers[id]; openDetail(p); mk?.getElement()?.firstChild?.classList.add('hl'); });
  map.flyTo(ll(p.wx, p.wz), Math.max(map.getZoom(), 1), { duration: .6 });
}

new ResizeObserver(() => map.invalidateSize()).observe($('#map'));
const zoomCls = () => { $('#map').classList.toggle('far', map.getZoom() < -1.5); $('#map').classList.toggle('mid', map.getZoom() >= -1.5 && map.getZoom() < 0); };
map.on('zoomend', zoomCls);

// cursor coords + copy on click
map.on('mousemove', e => { $('#coord').textContent = `X ${Math.round(e.latlng.lng)} · Z ${Math.round(-e.latlng.lat)}`; });
document.addEventListener('click', e => {
  const c = e.target.closest('[data-copy]'); if (c) copy(c.dataset.copy);
  const s = e.target.closest('[data-share]'); if (s) setHash('p-' + safe(s.dataset.share), '已把這個標記寫進網址，可以用分享連結傳給別人');
  const f = e.target.closest('[data-focus]'); if (f) { $('#modal').hidden = true; focusPoint(f.dataset.focus); }
});

// search (all maps)
const searchIndex = MD.points.map(p => ({ p, t: [p.zh, p.nombre, p.en, p.es, p.original, p.nota, p.compra, ...(p.mons || []).map(m => m + ' ' + (MOBZH[m] || '')), ...(p.objetos || []).map(o => o.nombre + ' ' + (GUIDE.zhItems[o.nombre] || '')), ...(p.compraObjetos || []).map(o => o.nombre + ' ' + (GUIDE.zhItems[o.nombre] || '')), ...(p.need || []).map(n => n[0] + ' ' + (GUIDE.zhItems[n[0]] || ''))].filter(Boolean).join(' ').toLowerCase() }));
let sIdx = -1;
$('#mapSearch').addEventListener('input', e => {
  const q = e.target.value.trim().toLowerCase(); sIdx = -1;
  if (!q) return $('#mapResults').innerHTML = '';
  const words = q.split(/\s+/);
  const hits = searchIndex.filter(s => words.every(w => s.t.includes(w))).sort((a, b) => (pName(b.p).toLowerCase().includes(q)) - (pName(a.p).toLowerCase().includes(q)) || (String(a.p.nivel) === cur.id ? -1 : 1)).slice(0, 60);
  $('#mapResults').innerHTML = hits.map(({ p }) => `<div data-pid="${esc(p.id)}">${CAPA_ICON[p.capa] || ICON[p.tipo] || '•'} ${esc(pName(p))} <small>${esc((mapById[p.nivel] || {}).name || p.nivel)}${mapById[p.nivel]?.title ? '・' + esc(mapById[p.nivel].title) : ''} · ${esc((LAYER[p.capa] || [p.capa])[0])}</small></div>`).join('') || '<div><small>找不到</small></div>';
});
$('#mapSearch').addEventListener('keydown', e => {
  const items = [...$('#mapResults').children]; if (!items.length) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sIdx = (sIdx + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items.forEach((d, i) => d.classList.toggle('sel', i === sIdx)); items[sIdx].scrollIntoView({ block: 'nearest' }); }
  if (e.key === 'Enter') (items[sIdx] || items[0]).click();
});
$('#mapResults').addEventListener('click', e => { const d = e.target.closest('[data-pid]'); if (!d) return; $('#mapResults').innerHTML = ''; focusPoint(d.dataset.pid); closeSideMobile(); });

// goto coordinates (in-page form: the artifact frame has no prompt())
let gotoMk = null;
const pinIcon = L.divIcon({ className: '', html: '<div class="mk" style="background:#fff">📍</div>', iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -12] });
$('#btnGoto').onclick = () => { const f = $('#gotoForm'); f.hidden = !f.hidden; $('#btnGoto').classList.toggle('on', !f.hidden); if (!f.hidden) $('#gotoIn').focus(); };
$('#gotoForm').addEventListener('submit', e => {
  e.preventDefault();
  const n = $('#gotoIn').value.match(/-?\d+(\.\d+)?/g)?.map(Number); if (!n || n.length < 2) return toast('請輸入 X Z，例如 1700 4300');
  const [x, z] = n.length >= 3 ? [n[0], n[2]] : n;
  if (gotoMk) map.removeLayer(gotoMk);
  gotoMk = L.marker(ll(x, z), { icon: pinIcon }).addTo(map).bindPopup(`<div class="pop"><h3>📍 座標</h3><div class="xyz">X ${x} · Z ${z} <button data-copy="${x} ${z}">複製</button></div></div>`);
  map.once('moveend', () => gotoMk.openPopup()); map.flyTo(ll(x, z), Math.max(map.getZoom(), 1), { duration: .6 }); closeSideMobile();
});

// measure distance
let measuring = false, mPts = [], mLayer = L.layerGroup().addTo(map);
$('#btnMeasure').onclick = () => { measuring = !measuring; $('#btnMeasure').classList.toggle('on', measuring); mPts = []; mLayer.clearLayers(); if (measuring) toast('在地圖上點兩個位置'); };
map.on('click', e => {
  if (!measuring) return;
  mPts.push(e.latlng); L.circleMarker(e.latlng, { radius: 5, color: '#ff9f43' }).addTo(mLayer);
  if (mPts.length === 2) {
    const [a, b] = mPts, dx = b.lng - a.lng, dz = b.lat - a.lat, d = Math.round(Math.hypot(dx, dz));
    L.polyline(mPts, { color: '#ff9f43', weight: 3 }).addTo(mLayer).bindTooltip(`${d} 格（約 ${Math.round(d / 5.6)} 秒步行）`, { permanent: true, className: 'lbl' }).openTooltip();
    mPts = [];
  } else if (mPts.length === 1) mLayer.getLayers().length > 1 && (mLayer.clearLayers(), L.circleMarker(e.latlng, { radius: 5, color: '#ff9f43' }).addTo(mLayer));
});

// share current view
$('#btnShare').onclick = () => { const c = map.getCenter(); setHash(`v-${MD.maps.indexOf(cur)}-${num(c.lng)}-${num(-c.lat)}-${num(map.getZoom() * 100)}`, '已把目前畫面寫進網址，可以用分享連結傳給別人'); };

// my markers (localStorage)
let mine = store.get('myMarkers', []), mineLayer = L.layerGroup().addTo(map), mineOpen = false;
function renderMine() {
  mineLayer.clearLayers();
  for (const m of mine.filter(m => m.map === cur.id)) L.marker(ll(m.x, m.z), { icon: L.divIcon({ className: '', html: '<div class="mk" style="background:#ffe066">⭐</div>', iconSize: [24, 24], iconAnchor: [12, 12] }) })
    .bindPopup(`<div class="pop"><h3>⭐ ${esc(m.label)}</h3><div class="xyz">X ${m.x} · Z ${m.z} <button data-copy="${m.x} ${m.z}">複製</button></div><button class="mini" data-delmine="${m.id}">刪除</button></div>`).addTo(mineLayer);
  renderJM();
  if (!mineOpen) return;
  const box = document.getElementById('mineBox') || Object.assign(document.createElement('div'), { id: 'mineBox', className: 'guide' });
  $('#guidePanel').before(box);
  box.innerHTML = `<h3>⭐ 我的標記（${mine.length}）</h3><div class="mine-list">${mine.map(m => `<div><span data-flymine="${m.id}">${esc(m.label)} <small>${esc((mapById[m.map] || {}).name || m.map)} · ${m.x}, ${m.z}</small></span><button class="mini" data-delmine="${m.id}">✕</button></div>`).join('') || '<p class="hint">右鍵（手機長按）地圖加入標記。</p>'}</div><textarea id="mineTxt" rows="3" placeholder="按匯出後資料會出現在這裡；也可以貼上之前匯出的資料再按匯入"></textarea><div class="row"><button class="mini" id="mineExp">匯出</button><button class="mini" id="mineImp">匯入</button></div>`;
}
$('#btnMine').onclick = () => { mineOpen = !mineOpen; $('#btnMine').classList.toggle('on', mineOpen); if (!mineOpen) document.getElementById('mineBox')?.remove(); renderMine(); };
map.on('contextmenu', e => {
  const x = Math.round(e.latlng.lng), z = Math.round(-e.latlng.lat);
  L.popup().setLatLng(e.latlng).setContent(`<form class="pop addmine" data-x="${x}" data-z="${z}"><h3>⭐ 加入我的標記</h3><div class="xyz">X ${x} · Z ${z}</div><input id="mineLabel" type="text" value="我的標記" maxlength="40" aria-label="標記名稱"> <button class="mini">儲存</button></form>`).openOn(map);
  setTimeout(() => document.getElementById('mineLabel')?.select(), 50);
});
document.addEventListener('submit', e => {
  const f = e.target.closest('.addmine'); if (!f) return; e.preventDefault();
  const label = f.querySelector('input').value.trim() || '我的標記';
  mine.push({ id: Date.now().toString(36), map: cur.id, x: +f.dataset.x, z: +f.dataset.z, label }); store.set('myMarkers', mine); map.closePopup(); renderMine(); toast('已加入標記');
});
document.addEventListener('click', e => {
  const d = e.target.closest('[data-delmine]'); if (d) { mine = mine.filter(m => m.id !== d.dataset.delmine); store.set('myMarkers', mine); map.closePopup(); renderMine(); }
  const f = e.target.closest('[data-flymine]'); if (f) { const m = mine.find(m => m.id === f.dataset.flymine); if (cur.id !== m.map) showMap(m.map); map.flyTo(ll(m.x, m.z), Math.max(map.getZoom(), 1)); }
  if (e.target.id === 'mineExp') { const t = $('#mineTxt'); t.value = JSON.stringify(mine); t.select(); copy(t.value); }
  if (e.target.id === 'mineImp') { try { const v = JSON.parse($('#mineTxt').value || 'null'); if (Array.isArray(v)) { const ids = new Set(mine.map(m => m.id)); mine.push(...v.filter(m => m && m.id && !ids.has(m.id) && Number.isFinite(m.x) && Number.isFinite(m.z))); store.set('myMarkers', mine); renderMine(); toast('已匯入'); } } catch { toast('格式錯誤'); } }
});

// JourneyMap waypoints (jm.js): import into my markers, export current map as WaypointData.dat
let jmBase = null, xaBase = null; // last imported JourneyMap .dat / Xaero .txt, so an export keeps the player's own waypoints
const jmChecked = new Set(['mine']);
function renderJM() {
  if ($('#jmPanel').hidden || !cur) return;
  const counts = {}; for (const p of ptsByMap[cur.id] || []) counts[p.capa] = (counts[p.capa] || 0) + 1;
  const mineN = mine.filter(m => m.map === cur.id).length;
  $('#jmLayers').innerHTML = [['mine', '⭐ 我的標記', '#ffe066', mineN], ...Object.keys(LAYER).filter(k => counts[k]).map(k => [k, LAYER[k][0], LAYER[k][1], counts[k]])]
    .map(([k, n, c, cnt]) => `<label><input type="checkbox" data-jm="${k}" ${jmChecked.has(k) ? 'checked' : ''}><span class="dot" style="background:${c}"></span>${esc(n)}<span class="n">${cnt}</span></label>`).join('') +
    (jmBase ? `<p class="hint">已載入你的 WaypointData.dat，匯出 JourneyMap 時會保留裡面原有的路點。</p>` : '') +
    (xaBase ? `<p class="hint">已載入你的 Xaero 路點檔，匯出 Xaero's 時會保留裡面原有的路點。</p>` : '');
}
$('#btnJM').onclick = () => { const p = $('#jmPanel'); p.hidden = !p.hidden; $('#btnJM').classList.toggle('on', !p.hidden); renderJM(); };
$('#jmLayers').addEventListener('change', e => { const k = e.target.dataset.jm; if (k) e.target.checked ? jmChecked.add(k) : jmChecked.delete(k); });
$('#jmFile').addEventListener('change', async e => {
  let added = 0, dup = 0;
  for (const f of e.target.files) {
    try {
      const buf = await f.arrayBuffer();
      const head = new TextDecoder().decode(new Uint8Array(buf, 0, Math.min(buf.byteLength, 400)));
      const isXaero = /\.txt$/i.test(f.name) || /^(sets:|#|(xaero-)?waypoint:)/.test(head);
      const wps = isXaero ? JM.importXaero(new TextDecoder().decode(buf)) : JM.importFile(buf, f.name);
      if (isXaero) xaBase = new TextDecoder().decode(buf);
      else if (!/\.json$/i.test(f.name)) jmBase = new Uint8Array(buf);
      if (!wps.length) toast(`${f.name} 裡面沒有路點`);
      for (const w of wps) {
        const id = 'jm-' + (w.guid || `${w.name}-${w.x}-${w.z}`);
        if (mine.some(m => m.id === id || (m.map === cur.id && m.label === w.name && m.x === Math.round(w.x) && m.z === Math.round(w.z)))) { dup++; continue; }
        mine.push({ id, guid: w.guid, map: cur.id, x: Math.round(w.x), y: Math.round(w.y), z: Math.round(w.z), label: w.name }); added++;
      }
    } catch (err) { toast(`${f.name} 讀取失敗：${err.message || err}`); }
  }
  e.target.value = '';
  store.set('myMarkers', mine); renderMine(); renderJM();
  if (added || dup) toast(`匯入 ${added} 個路點${dup ? `，${dup} 個已存在所以略過` : ''}`);
});
function jmGroups() {
  const groups = [];
  if (jmChecked.has('mine')) groups.push({ name: '攻略本・我的標記', color: '#ffe066', points: mine.filter(m => m.map === cur.id).map(m => ({ name: m.label, x: m.x, y: m.y, z: m.z, guid: m.guid })) });
  for (const k of jmChecked) if (LAYER[k]) groups.push({ name: '攻略本・' + LAYER[k][0], color: LAYER[k][1], points: (ptsByMap[cur.id] || []).filter(p => p.capa === k).map(p => ({ name: pName(p), x: p.wx, y: p.wy, z: p.wz })) });
  return [groups, groups.reduce((a, g) => a + g.points.length, 0)];
}
$('#xaExport').onclick = async () => {
  const [groups, n] = jmGroups();
  if (!n) return toast('沒有可以匯出的路點：先勾選圖層或加入標記');
  const text = JM.exportXaero(groups, xaBase), filename = 'mw$default_1.txt';
  const dl = await window.claude?.use?.('downloads');
  if (dl) {
    try { await dl.save({ filename, data: text }); toast(`已匯出 ${n} 個路點（Xaero's Minimap）`); }
    catch (err) { if (err?.code !== 'declined') toast('這裡不能下載檔案'); }
    return;
  }
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([text], { type: 'text/plain' })), download: filename });
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); toast(`已匯出 ${n} 個路點（Xaero's Minimap）`);
};
$('#jmExport').onclick = async () => {
  const [groups, n] = jmGroups();
  if (!n) return toast('沒有可以匯出的路點：先勾選圖層或加入標記');
  const dat = JM.exportDat(groups, jmBase);
  const dl = await window.claude?.use?.('downloads');
  if (dl) { // artifact viewer: .dat is not an allowed download type, so ship it inside a zip
    try { await dl.save({ filename: `JourneyMap-${cur.id}.zip`, data: JM.zip('WaypointData.dat', dat) }); toast(`已匯出 ${n} 個路點（zip 裡面是 WaypointData.dat）`); }
    catch (err) { if (err?.code !== 'declined') toast('這裡不能下載檔案'); }
    return;
  }
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([dat])), download: 'WaypointData.dat' });
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); toast(`已匯出 ${n} 個路點`);
};

// mobile side panel
const closeSideMobile = () => $('#mapSide').classList.remove('open');
$('#sideToggle').onclick = () => $('#mapSide').classList.toggle('open');

/* ================= TABS ================= */
const rendered = {};
function switchTab(t) {
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
  document.querySelectorAll('.tab').forEach(s => s.classList.toggle('on', s.id === 'tab-' + t));
  if (!rendered[t]) { rendered[t] = 1; RENDER[t]?.(); }
  if (t === 'map') setTimeout(() => map.invalidateSize(), 0);
  if (location.hash.slice(1) !== t && !(t === 'map' && /^#(v|p)-/.test(location.hash))) history.replaceState(null, '', '#' + t);
}
$('#tabs').onclick = e => { const b = e.target.closest('button'); if (b) switchTab(b.dataset.tab); };

/* ================= ITEMS ================= */
const itemName = i => i.zh || i.en;
const itemImg = i => (i.img && (window.IMG_I || {})[i.id]) || '';
const itemText = ITEMS.map(i => [i.zh, i.en, i.fr, CAT[i.c]].join(' ').toLowerCase());
let itemLimit = 120;
function renderItems() {
  const q = $('#itemQ').value.trim().toLowerCase(), c = $('#itemCat').value, r = $('#itemRar').value, s = $('#itemSort').value;
  const own = $('#itemOwn').checked;
  let list = ITEMS.filter((i, k) => (!q || itemText[k].includes(q)) && (!c || i.c === c) && (!r || i.r === r) && (!own || OWNED.has(i.id)));
  list.sort(s === 'lv' ? (a, b) => (b.l || 0) - (a.l || 0) : s === 'rar' ? (a, b) => (RAR[b.r]?.[1] || 0) - (RAR[a.r]?.[1] || 0) : (a, b) => itemName(a).localeCompare(itemName(b), 'zh-Hant'));
  $('#itemCount').textContent = `${list.length} 件`;
  $('#itemGrid').innerHTML = list.slice(0, itemLimit).map(i => `<div class="card" style="${rarCss(i.r)}" data-item="${i.id}">${itemImg(i) ? `<img loading="lazy" src="${itemImg(i)}" alt="">` : ''}<div class="body"><div class="t">${esc(itemName(i))}${ownTag(i)}</div><div class="s">${i.zh ? esc(i.en) + '<br>' : ''}<span class="rar">${RAR[i.r]?.[0] || ''}</span> · ${esc(CAT[i.c] || i.c)}${i.l ? ' · 等級 ' + i.l : ''}${i.game ? ' <span class="tag">遊戲內</span>' : ''}</div></div></div>`).join('');
  $('#itemMore').hidden = list.length <= itemLimit;
}
const SRC = { build: '官方百科有收錄', tienda: '商店出售', receta: '可以製作', visto: '遊戲內見過', compra: '可以收購' };
// where an NPC / monster stands on the map (recipe NPCs, source NPCs, drop monsters)
const nk = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^\d\|/, '').replace(/^p\d+ - /, '').replace(/[^a-z0-9一-鿿]+/g, ' ').trim();
const ptByName = {}; for (const p of MD.points) for (const n of [p.nombre, p.zh, p.en, p.original]) if (n) (ptByName[nk(n)] ||= []).push(p);
const npcPt = n => (ptByName[nk(n)] || ptByName[nk(GUIDE.zhNpcs[String(n).replace(/^\d\|/, '')])] || [])[0];
const pin = p => p ? ` <button class="maplink" data-focus="${esc(p.id)}">📍 ${esc(mapById[p.nivel]?.name || p.nivel)}</button>` : '';
// items whose category says how they are obtained (shown when nothing more specific is known)
const CAT_SRC = { fishing_job: '🎣 釣魚取得（生活職業：釣魚）', miner_job: '⛏️ 挖礦取得（生活職業：礦工）', lumberjack_job: '🪓 伐木取得（生活職業：伐木工）', farmer_job: '🌾 種植或採集取得（農夫、草藥師）', halloween: '🎃 萬聖節活動限定（活動地下城、萬聖節卡池）', noel2025: '🎄 聖誕節活動限定', saint_valentin: '💝 情人節活動限定', lunar: '🧧 農曆新年活動限定', key_crate: '🗝️ 寶箱鑰匙（活動或商店）' };
function itemModal(id) {
  const i = ITEMS.find(x => x.id == id); if (!i) return;
  const where = MD.points.filter(p => (p.objetos || []).some(o => o.nombre === i.en) || (p.compraObjetos || []).some(o => o.nombre === i.en) || (p.items || []).includes(i.en));
  const drops = MOBS.mobs.filter(m => m.botin.some(b => (b.name || '').toLowerCase() === i.en.toLowerCase() || b.name === i.zh));
  const set = (GUIDE.sets.sets || []).find(s => s.members.includes(i.fr) || s.members.includes(i.en));
  const pot = (GUIDE.sets.potions || []).find(s => s.name === i.en);
  const recipes = Object.entries(GUIDE.recipes).flatMap(([npc, v]) => v.items.filter(r => r[0] == i.id || r[1] === i.en).map(r => [npc, v.floor, r]));
  const uses = Object.entries(GUIDE.recipes).flatMap(([npc, v]) => v.items.filter(r => r[3]?.some(m => m[0] === i.en)).map(r => r[1]));
  modal(`<div class="head">${itemImg(i) ? `<img src="${itemImg(i)}" alt="">` : ''}<div><h2 style="${rarCss(i.r)}" class="rar">${esc(itemName(i))}</h2><div class="sub">${esc([i.zh ? i.en : null, i.fr].filter(Boolean).join(' · '))}</div><div><span class="tag">${RAR[i.r]?.[0] || '?'}</span>${zhTag(i)}${ownTag(i)}<span class="tag">${esc(CAT[i.c] || i.c)}</span>${i.l ? `<span class="tag">等級 ${i.l}</span>` : ''}</div></div></div>
  ${Object.keys(i.s || {}).length ? `<h3>屬性</h3><ul>${Object.entries(i.s).map(([k, v]) => `<li>${esc(statLine(k, v))}</li>`).join('')}</ul>` : ''}
  ${set ? `<h3>套裝：${esc(set.name)}</h3><ul>${set.tiers.map(t => `<li>${t[0]} 件：${esc(t[1])}</li>`).join('')}</ul>` : ''}
  ${pot ? `<h3>效果</h3><ul>${pot.effects.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
  ${i.lore ? `<p><i>${esc(i.lore)}</i></p>` : ''}
  <h3>取得方式</h3><ul>${(i.src || []).map(s => `<li>${SRC[s.tipo] || s.tipo}${s.piso ? `（第 ${s.piso} 層` + (s.pnj ? `・${esc(s.pnj)}` : '') + '）' : ''}${s.pnj ? pin(npcPt(s.pnj)) : ''}</li>`).join('')}
  ${recipes.map(([npc, fl, r]) => `<li>⚒️ ${esc(GUIDE.zhNpcs[npc.replace(/^\d\|/, '')] || npc.replace(/^\d\|/, ''))}（第 ${fl} 層）：${(r[3] || []).map(m => esc(GUIDE.zhItems[m[0]] || m[0]) + '×' + m[1]).join(' + ')}${r[4] ? ' · ' + esc(r[4]) + ' 珂爾' : ''}${pin(npcPt(npc))}</li>`).join('')}
  ${drops.map(m => `<li>🐾 ${esc(m.zh || m.nombre)} 掉落 ${m.botin.find(b => (b.name || '').toLowerCase() === i.en.toLowerCase() || b.name === i.zh).prob}%${pin([...(mobPts[lc(m.nombre)] || []), ...(mobPts[lc(m.zh)] || [])].map(x => ptById[x]).find(Boolean))}</li>`).join('')}
  ${CAT_SRC[i.c] && !recipes.length && !drops.length ? `<li>${CAT_SRC[i.c]} <small class="count">按物品分類推斷</small></li>` : ''}
  ${!(i.src || []).length && !recipes.length && !drops.length && !CAT_SRC[i.c] && !where.length ? '<li class="hint">暫時未有取得方式的資料</li>' : ''}</ul>
  ${uses.length ? `<h3>用來製作</h3><p>${[...new Set(uses)].map(u => esc(GUIDE.zhItems[u] || u)).join('、')}</p>` : ''}
  ${where.length ? `<h3>地圖上的位置</h3><p>${where.map(p => `<button class="maplink" data-focus="${esc(p.id)}">📍 ${esc(pName(p))}（${esc(mapById[p.nivel]?.name || p.nivel)}）</button>`).join(' ')}</p>` : ''}`);
}
Object.assign(RENDER, {
  items() {
    const cats = [...new Set(ITEMS.map(i => i.c))].sort((a, b) => (CAT[a] || a).localeCompare(CAT[b] || b, 'zh-Hant'));
    $('#itemCat').innerHTML = '<option value="">全部分類</option>' + cats.map(c => `<option value="${c}">${esc(CAT[c] || c)}</option>`).join('');
    $('#itemRar').innerHTML = '<option value="">全部稀有度</option>' + Object.entries(RAR).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join('');
    ['#itemQ', '#itemCat', '#itemRar', '#itemSort', '#itemOwn'].forEach(s => $(s).addEventListener('input', () => { itemLimit = 120; renderItems(); }));
    $('#itemMore').onclick = () => { itemLimit += 240; renderItems(); };
    $('#itemGrid').onclick = e => { const c = e.target.closest('[data-item]'); if (c) itemModal(c.dataset.item); };
    $('#itemCount').textContent = '載入圖示中…';
    loadJs('data/img-items.js').then(renderItems);
  },
});

/* ================= MOBS ================= */
const zoneName = Object.fromEntries(MOBS.zones.map(z => [z.id, z.name]));
function renderMobs() {
  const q = $('#mobQ').value.trim().toLowerCase(), z = $('#mobZone').value, boss = $('#mobBoss').checked;
  const list = MOBS.mobs.filter(m => (!z || m.zona === z) && (!boss || m.jefe) && (!q || [m.zh, m.nombre, m.original, m.texto, ...m.botin.map(b => b.name + ' ' + (b.zh || ''))].join(' ').toLowerCase().includes(q)));
  $('#mobCount').textContent = `${list.length} 隻`;
  $('#mobGrid').innerHTML = list.map(m => `<div class="card mobcard" data-mob="${esc(m.id)}" ${m.jefe ? 'style="--rc:var(--r-splus)"' : ''}>${imgM(m.img) ? `<img loading="lazy" src="${imgM(m.img)}" alt="">` : ''}<div class="body"><div class="t">${m.jefe ? '👑 ' : ''}${esc(m.zh || m.nombre)}</div><div class="s">${esc(m.original || '')}<br>${esc(zoneName[m.zona] || m.zona)}${m.codice ? ' · 圖鑑 #' + m.codice : ''}</div><div class="s">${m.botin.slice(0, 4).map(b => esc(b.zh || b.name) + ' ' + b.prob + '%').join('、')}</div></div></div>`).join('');
}
function mobModal(id) {
  const m = MOBS.mobs.find(x => x.id === id); if (!m) return;
  const onMap = MD.points.filter(p => p.id === m.mapa || p.id === m.comprador || ((p.capa === 'mobs' || p.capa === 'jefes' || p.capa === 'spawns') && [p.nombre, p.es, p.en, p.original].some(n => n && (n === m.original || n === m.nombre))));
  modal(`<div class="head">${imgM(m.img) ? `<img src="${imgM(m.img)}" alt="" style="image-rendering:auto;width:110px;height:110px">` : ''}<div><h2>${m.jefe ? '👑 ' : ''}${esc(m.zh || m.nombre)}</h2><div class="sub">${esc([m.zh ? m.nombre : null, m.original].filter(Boolean).join(' · '))}</div><div><span class="tag">${esc(zoneName[m.zona] || m.zona)}</span>${zhTag(m)}${m.codice ? `<span class="tag">圖鑑 #${m.codice}</span>` : ''}${m.beh ? `<span class="tag">${esc(m.beh)}</span>` : ''}${m.stars ? `<span class="tag stars" title="難度">${'★'.repeat(m.stars)}${'☆'.repeat(5 - m.stars)}</span>` : ''}</div></div></div>
  ${m.texto ? `<p>${esc(m.texto)}</p>` : ''}${m.pista ? `<p>🔎 <b>圖鑑提示：</b>${esc(m.pista)}</p>` : ''}
  <h3>掉落</h3><table>${m.botin.map(b => `<tr><td>${imgM(b.img) ? `<img src="${imgM(b.img)}" width="24" height="24" alt="" style="image-rendering:pixelated;vertical-align:middle"> ` : ''}${esc(b.zh ? b.zh + '（' + b.name + '）' : b.name)}</td><td>${b.prob}%</td></tr>`).join('')}</table>
  ${onMap.length ? `<h3>地圖</h3><p>${onMap.map(p => `<button class="maplink" data-focus="${esc(p.id)}">📍 ${esc(pName(p))}（${esc(mapById[p.nivel]?.name || p.nivel)}）</button>`).join(' ')}</p>` : ''}`);
}
RENDER.mobs = () => {
  $('#mobZone').innerHTML = '<option value="">全部區域</option>' + MOBS.zones.map(z => `<option value="${z.id}">${esc(z.name)}</option>`).join('');
  ['#mobQ', '#mobZone', '#mobBoss'].forEach(s => $(s).addEventListener('input', renderMobs));
  $('#mobGrid').onclick = e => { const c = e.target.closest('[data-mob]'); if (c) mobModal(c.dataset.mob); };
  loadJs('data/img-mobs.js').then(renderMobs);
};

/* ================= QUESTS ================= */
const iz = n => esc(GUIDE.zhItems[n] ? `${GUIDE.zhItems[n]}（${n}）` : n);
// quest progress the viewer ticks off, kept in this browser
const qDone = new Set(store.get('questDone', []));
const doneBox = (k, label) => `<input type="checkbox" class="qdone" data-q="${esc(k)}" ${qDone.has(k) ? 'checked' : ''} aria-label="${esc(label)} 已完成">`;
RENDER.quests = () => {
  let h = '<h1>📜 任務</h1><p class="hint">勾選已完成的任務，進度只存在這個瀏覽器。</p>';
  for (const [fl, qs] of Object.entries(GUIDE.mainq)) {
    const ch = (GUIDE.chain || {})[fl];
    if (ch) {
      const keys = ch.map(q => `c${fl}:${q.t}`), n = keys.filter(k => qDone.has(k)).length;
      h += `<h2>第 ${fl} 層主線一覽（${ch.length} 個）</h2><div class="qprog" data-fl="c${fl}"><div class="bar"><i style="width:${n / ch.length * 100}%"></i></div><span>已完成 ${n} / ${ch.length}</span></div>
      <div class="tw"><table class="qchain"><tr><th></th><th>任務</th><th>NPC</th><th>目標</th><th>獎勵</th></tr>${ch.map((q, i) => `<tr class="${qDone.has(keys[i]) ? 'done' : ''}"><td>${doneBox(keys[i], q.t)}</td><td><b>${esc(q.t)}</b>${q.x != null ? ` <button class="maplink" data-focus="ch-${fl}-${i}">📍 X ${q.x} Z ${q.z}</button>` : ''}</td><td>${esc(q.n || '—')}</td><td>${(q.o || []).map(esc).join('<br>') || '—'}</td><td>${q.xp ? q.xp.toLocaleString() + ' 經驗' : ''}<br>${q.col ? q.col.toLocaleString() + ' 珂爾' : ''}</td></tr>`).join('')}</table></div>`;
    }
    h += `<h2>第 ${fl} 層主線${ch ? '詳細步驟' : ''}（${qs.length} 個）</h2>`;
    qs.forEach((q, qi) => {
      const zq = GUIDE.questZh[q.t] || {};
      h += `<details><summary>${ch ? '' : doneBox(`m${fl}:${q.t}`, zq.zh || q.t) + ' '}${q.n ? '#' + q.n + ' ' : ''}${esc(zq.zh || q.t)} <small class="count">${esc(q.t)} · NPC：${esc(q.npc || '?')} · 等級 ${esc(q.lv || '?')}</small></summary>
      ${zq.d ? `<p><i>${esc(zq.d)}</i></p>` : ''}<ol>${(q.s || []).map((s, si) => `<li>${esc(s[0])}${s[1] != null ? ` <button class="maplink" data-focus="mq-${fl}-${qi}-${si}">📍 X ${s[1]} Z ${s[2]}</button>` : ''}</li>`).join('')}</ol>
      ${q.rw ? `<p>🎁 獎勵：${esc(q.rw)}</p>` : ''}${q.tip ? `<p>💡 ${esc(q.tip)}</p>` : ''}</details>`;
    });
  }
  for (const [fl, qs] of Object.entries(GUIDE.sideq)) {
    if (!qs.length) continue;
    const towns = Object.fromEntries((GUIDE.towns[fl] || []).map(t => [t.id, t.zh || t.n]));
    h += `<h2>第 ${fl} 層支線（${qs.length} 個）</h2><div class="tw"><table><tr><th>NPC</th><th>地點</th><th>需要</th><th>獎勵</th><th></th></tr>${qs.map(q => `<tr><td>${esc(q[0])}</td><td>${esc(towns[q[1]] || q[1])}</td><td>${(q[4] || []).map(n => iz(n[0]) + ' ×' + n[1]).join('<br>')}</td><td>${q[5] ? q[5] + ' 經驗' : ''}${q[6] ? '<br>' + q[6] + ' 珂爾' : ''}</td><td>${q[2] != null ? `<button class="maplink" data-focus="argo-q-${fl}-${esc(q[0])}">📍</button>` : ''}</td></tr>`).join('')}</table></div>`;
  }
  $('#questBox').innerHTML = h;
  $('#questBox').addEventListener('change', e => {
    const c = e.target.closest('.qdone'); if (!c) return;
    c.checked ? qDone.add(c.dataset.q) : qDone.delete(c.dataset.q); store.set('questDone', [...qDone]);
    c.closest('tr')?.classList.toggle('done', c.checked);
    const fl = c.dataset.q.split(':')[0], bar = $(`.qprog[data-fl="${fl}"]`);
    if (bar) { const all = [...document.querySelectorAll(`.qdone[data-q^="${fl}:"]`)], n = all.filter(x => x.checked).length; bar.querySelector('i').style.width = n / all.length * 100 + '%'; bar.querySelector('span').textContent = `已完成 ${n} / ${all.length}`; }
  });
  $('#questBox').addEventListener('click', e => { if (e.target.closest('.qdone')) e.stopPropagation(); }, true);
};

/* ================= RECIPES ================= */
const npcPoint = name => MD.points.find(p => p.capa === 'npcs' && p.en === name.replace(/^\d\|/, ''));
function renderRecipes() {
  const q = $('#recQ').value.trim().toLowerCase(), fl = $('#recFloor').value;
  let n = 0, h = '';
  for (const [npc, v] of Object.entries(GUIDE.recipes)) {
    if (fl && String(v.floor) !== fl) continue;
    const nm = npc.replace(/^\d\|/, ''), zh = GUIDE.zhNpcs[nm];
    const rows = v.items.filter(r => !q || [npc, zh, r[1], GUIDE.zhItems[r[1]], ...(r[3] || []).map(m => m[0] + ' ' + (GUIDE.zhItems[m[0]] || ''))].join(' ').toLowerCase().includes(q));
    if (!rows.length) continue; n += rows.length;
    const pt = npcPoint(npc);
    h += `<details ${q ? 'open' : ''}><summary>${esc(zh || nm)} <small class="count">${zh ? esc(nm) + ' · ' : ''}第 ${v.floor} 層 · ${rows.length} 個配方</small> ${pt ? `<button class="maplink" data-focus="${esc(pt.id)}">📍</button>` : ''}</summary><div class="tw"><table><tr><th>成品</th><th>材料</th><th>費用</th><th>時間</th><th>等級</th></tr>${rows.map(r => `<tr><td><span style="${rarCss(r[5])}" class="rar">${iz(r[1])}</span></td><td>${(r[3] || []).map(m => iz(m[0]) + ' ×' + m[1]).join('<br>')}</td><td>${r[4] ? esc(r[4]) + (r[4] === 'Free' ? '' : ' 珂爾') : '?'}</td><td>${r[2] ? r[2] + ' 秒' : ''}</td><td>${r[7] || ''}</td></tr>`).join('')}</table></div></details>`;
  }
  $('#recCount').textContent = `${n} 個配方`;
  $('#recBox').innerHTML = h || '<p>找不到配方。</p>';
}
RENDER.recipes = () => { ['#recQ', '#recFloor'].forEach(s => $(s).addEventListener('input', renderRecipes)); renderRecipes(); };

/* ================= DUNGEONS ================= */
RENDER.dungeons = () => {
  let h = '<h1>🏰 地下城攻略</h1><p>每個地下城都有自己的地圖：按「在地圖開啟」會切換到地下城地圖，側欄有逐步攻略，按步驟會跳到對應的位置。</p>';
  const groups = {};
  for (const m of MD.maps.filter(m => m.parent)) (groups[m.group || m.id] ||= []).push(m);
  for (const ms of Object.values(groups)) {
    const m0 = ms[0], steps = ms.flatMap(m => m.guide.map(g => g.text)).filter(Boolean);
    const bosses = ms.flatMap(m => (ptsByMap[m.id] || []).filter(p => p.capa === 'jefes'));
    h += `<details><summary>${m0.quest ? '📜' : '🏰'} ${esc(m0.name)} <small class="count">第 ${m0.parent} 層 · ${ms.length > 1 ? ms.length + ' 張地圖' : '1 張地圖'}</small></summary>
    <p>${ms.map(m => `<button class="maplink" data-openmap="${m.id}">🗺️ ${esc(m.title || '在地圖開啟')}</button>`).join(' ')}</p>
    ${bosses.length ? `<p>👑 首領：${[...new Set(bosses.map(pName))].map(esc).join('、')}</p>` : ''}
    ${steps.length ? `<ol>${steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}</details>`;
  }
  const ev = GUIDE.events.dungeons || [];
  if (ev.length) h += `<h2>活動地下城</h2>` + ev.map(d => `<details><summary>🎃 ${esc(d.zh)} <small class="count">${esc(d.n)}</small></summary><p>${esc(d.ev || '')}</p><p>人數：${esc(d.players || '?')}</p>${(d.zones || []).map(z => `<p><b>區域 ${esc(z.n)}</b>：${(z.mobs || []).map(esc).join('、')}；領袖 ${esc(z.leader || '')}${z.frag ? '；掉落 ' + esc(z.frag) : ''}</p>`).join('')}${(d.bosses || []).length ? `<p>首領：${d.bosses.map(b => esc(b[0]) + '（' + esc(b[1]) + '）').join('、')}</p>` : ''}${(d.chest || []).length ? `<ul>${d.chest.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}</details>`).join('');
  $('#dunBox').innerHTML = h;
};
document.addEventListener('click', e => { const b = e.target.closest('[data-openmap]'); if (b) { switchTab('map'); showMap(b.dataset.openmap); } });

/* ================= CLASSES ================= */
RENDER.classes = () => {
  $('#classBox').innerHTML = '<h1>⚔️ 職業與技能</h1><p>職業可以之後隨時更換（主線「A Decisive Choice」）。</p>' + GUIDE.classes.map(c => `<details><summary>${c.ic || ''} ${esc(c.zh)} <small class="count">${esc(c.name)} · ${esc(c.role || '')} · 難度 ${'★'.repeat(c.diff || 0)}</small></summary>
  <p>${esc(c.about || '')}</p>
  <div class="tw"><table>${(c.stars || []).map(s => `<tr><td>${esc(s[0])}</td><td class="stars">${'★'.repeat(s[1])}${'☆'.repeat(5 - s[1])}</td></tr>`).join('')}</table></div>
  ${(c.subs || []).length ? `<h3>專精</h3><ul>${c.subs.map(s => `<li><b>${esc(s[0])}</b>：${esc(s[1])}</li>`).join('')}</ul>` : ''}
  ${(c.skills || []).length ? `<h3>技能</h3><div class="tw"><table><tr><th>技能</th><th>類型</th><th>等級</th><th>說明</th></tr>${c.skills.map(s => `<tr><td>${esc(s[0])}</td><td>${esc(s[1])}</td><td>${esc(s[2])}</td><td>${esc(s[3])}</td></tr>`).join('')}</table></div>` : ''}</details>`).join('');
};

/* ================= BOSSES ================= */
const DAYS = ['日', '一', '二', '三', '四', '五', '六'];
function tzOffset(utcMs, zone) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }).formatToParts(new Date(utcMs)).map(x => [x.type, x.value]));
  return Date.UTC(+p.year, p.month - 1, +p.day, +p.hour, +p.minute) - Math.floor(utcMs / 60000) * 60000;
}
function nextRun(s) { // next occurrence of weekday+time in IANA zone, as a Date
  const [hh, mm] = s.time.split(':').map(Number), now = Date.now();
  for (let k = 0; k < 8; k++) {
    const d = new Date(now + k * 864e5), p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: s.zone, year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short' }).formatToParts(d).map(x => [x.type, x.value]));
    if (['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday) !== s.day) continue;
    const guess = Date.UTC(+p.year, p.month - 1, +p.day, hh, mm), t = guess - tzOffset(guess, s.zone);
    if (t + (s.minutes || 0) * 6e4 > now) return new Date(t);
  }
}
const fmtLocal = d => d ? `${d.getMonth() + 1}/${d.getDate()}（${DAYS[d.getDay()]}）${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : '?';
RENDER.bosses = () => { loadJs('data/img-mobs.js').then(renderBosses); };
function renderBosses() {
  const B = GUIDE.bosses;
  let h = '<h1>👑 世界王與特殊首領</h1><h2>世界王</h2>';
  h += B.world.map(b => {
    const runs = (b.schedule || []).map(s => ({ s, d: nextRun(s) })).sort((a, b) => (a.d || 0) - (b.d || 0));
    return `<details open><summary>${esc(b.zh)} <small class="count">${esc(b.name)} · 等級 ${b.level ?? '?'}</small></summary>
    ${imgM('argo/' + b.img) ? `<img class="bossimg" src="${imgM('argo/' + b.img)}" alt="">` : ''}<p>${esc(b.desc || '')}</p>
    <p>入場費：${b.price ?? '?'} 珂爾 · 每隊最多 ${b.maxPlayers ?? '?'} 人${b.queue ? ' · 排隊上限 ' + b.queue : ''}</p>
    <h3>開放時間（已換算成你的時區）</h3><ul>${runs.map(({ s, d }) => `<li>${fmtLocal(d)} 起 ${s.minutes} 分鐘 <small class="count">原定：週${DAYS[s.day]} ${s.time} ${s.zone}</small></li>`).join('')}</ul>
    ${b.guaranteed ? `<p>必得：${esc(b.guaranteed)}</p>` : ''}
    ${(b.roulette || []).length ? `<h3>輪盤獎勵（抽 ${b.rolls || 1} 次）</h3><div class="tw"><table>${b.roulette.map(r => `<tr><td>${esc(r[0])}</td><td>${r[2]}%</td></tr>`).join('')}</table></div>` : ''}
    ${(b.attacks || []).length ? `<h3>招式</h3><ul>${b.attacks.map(a => `<li><b>${esc(a[0])}</b>：${esc(a[1])}</li>`).join('')}</ul>` : ''}
    ${b.weakness ? `<p>🎯 弱點：${esc(typeof b.weakness === 'string' ? b.weakness : JSON.stringify(b.weakness))}</p>` : ''}
    ${b.access ? `<p>🚪 入口：${esc(typeof b.access === 'string' ? b.access : JSON.stringify(b.access))}</p>` : ''}</details>`;
  }).join('');
  h += '<h2>UNIT 特殊首領</h2><ul>' + (B.uniqueRules || []).map(r => `<li>${esc(r)}</li>`).join('') + '</ul>';
  h += (B.unique || []).map(b => `<details><summary>${esc(b.zh)} <small class="count">${esc(b.unit || '')} · 第 ${b.floor} 層 · 等級 ${b.level ?? '?'}${b.available ? '' : ' · 未開放'}</small></summary>
    ${imgM('argo/' + b.img) ? `<img class="bossimg" src="${imgM('argo/' + b.img)}" alt="">` : ''}
    ${(b.attacks || []).length ? `<h3>招式</h3><ul>${b.attacks.map(a => `<li><b>${esc(a[0])}</b>：${esc(a[1])}</li>`).join('')}</ul>` : ''}
    ${b.phases ? `<h3>階段</h3><ul>${[].concat(b.phases).map(a => `<li>${esc(Array.isArray(a) ? a.join('：') : a)}</li>`).join('')}</ul>` : ''}${b.note ? `<p>${esc(b.note)}</p>` : ''}</details>`).join('');
  $('#bossBox').innerHTML = h;
}

/* ================= ABOUT ================= */
/* ================= SYSTEMS ================= */
RENDER.systems = () => {
  const box = $('#sysBox');
  box.innerHTML = `<h1>📖 遊戲系統</h1><p class="hint">未公布的部分不列出，資料以遊戲內為準。</p>
  <nav class="chips">${SYSTEMS.map(s => `<a href="#sys-${s.id}" data-sys="${s.id}">${s.ic} ${esc(s.t)}</a>`).join('')}</nav>` +
    SYSTEMS.map((s, i) => `<details id="sys-${s.id}"${i < 2 ? ' open' : ''}><summary>${s.ic} ${esc(s.t)}</summary>${s.html}</details>`).join('');
  box.addEventListener('click', e => { const a = e.target.closest('[data-item]'); if (a) { e.preventDefault(); itemModal(a.dataset.item); } });
  box.querySelector('.chips').onclick = e => { const a = e.target.closest('[data-sys]'); if (!a) return; e.preventDefault(); const d = $('#sys-' + a.dataset.sys); d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  // defense calculator
  const def = () => { const v = Math.max(0, +$('#defIn').value || 0); $('#defOut').textContent = (v / (v + 60) * 80).toFixed(1) + '%'; };
  $('#defIn').addEventListener('input', def); def();
  // merchant visits in the viewer's time zone (official times are Paris time)
  const m = SYSTEMS.find(s => s.sched);
  $('#merchantTimes').innerHTML = `<div class="tw"><table><tr><th>NPC</th><th>付款</th><th>下一次（你的時區）</th><th>每週</th></tr>${m.sched.map(x => {
    const runs = x.days.map(day => nextRun({ day, time: x.time, zone: 'Europe/Paris', minutes: 10 })).sort((a, b) => a - b);
    return `<tr><td>${x.n}</td><td>${x.pay}</td><td><b>${fmtLocal(runs[0])}</b></td><td>${runs.map(fmtLocal).join('、')}<br><small class="count">原定巴黎時間 ${x.time}，停留 10 分鐘</small></td></tr>`; }).join('')}</table></div>`;
  // runes, linked to the item modal when we have the item
  const R = GUIDE.runes || [], byId = new Map(ITEMS.map(i => [i.id, i]));
  $('#runeTable').innerHTML = `<div class="tw"><table><tr><th>符文</th><th>稀有度</th><th>效果</th></tr>${R.map(r => `<tr><td>${byId.has(r.id) ? `<a href="#" data-item="${r.id}">${esc(r.zh)}</a>` : esc(r.zh)}</td><td>${esc(r.r)}</td><td>${esc(r.b).replace(/(^|、)(-[^、]+)/g, '$1<span style="color:var(--bad)">$2</span>')}</td></tr>`).join('')}</table></div>`;
};

/* ================= MY PROGRESS (official API via the user's own Cloudflare Worker) ================= */
// The official API only allows its own website in browsers, so requests go through a Worker the user deploys
// (tools/cloudflare-worker.mjs). The key stays in this browser and is sent only to that Worker.
const OWNED = new Map(); // item id -> amount, from the last inventory read
const ownTag = i => OWNED.has(i.id) ? `<span class="tag own">✓ 有 ${OWNED.get(i.id)}</span>` : '';
// served by the Cloudflare Worker itself (wrangler.jsonc): the relay is this site's own /api
const SAME_RELAY = /\.workers\.dev$/.test(location.hostname) || location.port === '8787' ? location.origin + '/api' : '';
const meCfg = { get: () => ({ url: store.get('meUrl', '') || SAME_RELAY, key: store.get('meKey', '') || (() => { try { return sessionStorage.getItem('meKey') || ''; } catch { return ''; } })() }) };
const fmtMs = ms => ms == null ? '—' : `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
const fmtWhen = s => { const d = new Date(s); return isNaN(d) ? '—' : `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
const val = v => v == null || v === '' ? '—' : typeof v === 'object' ? esc(v.name ?? v.display ?? v.level ?? JSON.stringify(v)) : esc(v);
async function meFetch(path) {
  const { url, key } = meCfg.get();
  const r = await fetch(url.replace(/\/+$/, '') + path, { headers: { Authorization: 'Bearer ' + key } });
  if (!r.ok) throw Object.assign(new Error('HTTP ' + r.status), { status: r.status });
  return (await r.json()).data;
}
RENDER.me = () => {
  const { url, key } = meCfg.get();
  $('#meBox').innerHTML = `<h1>👤 我的進度</h1>
  <p class="hint">用你自己的官方 API key 讀取等級、生活職業、背包、珂爾和地下城紀錄。key 只存在這個瀏覽器，只會傳給你自己的中轉（Cloudflare Worker）。官方 API 目前沒有任務進度。</p>
  <form id="meForm" class="guide">
    <div ${SAME_RELAY ? 'hidden' : ''}><label class="hint" for="meUrl">中轉網址（你的 Cloudflare Worker，結尾加 /api）</label>
    <input id="meUrl" type="text" inputmode="url" placeholder="https://saominecraft.你的名字.workers.dev/api" value="${esc(url)}" autocomplete="off"></div>
    <label class="hint" for="meKey">官方 API key</label>
    <input id="meKey" type="password" placeholder="sao_live_…" value="${esc(key)}" autocomplete="off">
    <label class="hint"><input type="checkbox" id="meRemember" ${store.get('meKey', '') || !key ? 'checked' : ''}> 記住在這個瀏覽器（取消勾選就只記到關閉分頁為止）</label>
    <div class="row"><button class="mini">讀取進度</button><button type="button" id="meForget" class="mini">清除 key</button></div>
  </form>
  <details><summary>怎樣設定中轉（只要做一次）</summary><ol>
    <li>到 Cloudflare 免費註冊，登入主控台。</li>
    <li>左邊選「Workers 和 Pages」→「建立」→「建立 Worker」，名稱例如 <code>sao-proxy</code> → 部署。</li>
    <li>按「編輯程式碼」，把 GitHub repo 裡 <code>tools/cloudflare-worker.mjs</code> 的內容整份貼上，按「部署」。</li>
    <li>把它給你的網址（<code>https://sao-proxy.….workers.dev</code>）貼到上面。</li>
    <li>到官方開發者頁面開一把新的 API key，權限只勾 profile、inventory、economy、dungeons。</li></ol>
    <p class="hint">這個功能只能在 GitHub Pages 版網站使用。</p></details>
  <div id="meOut"></div>`;
  $('#meForm').onsubmit = e => {
    e.preventDefault();
    const u = $('#meUrl').value.trim(), k = $('#meKey').value.trim();
    if (!/^https:\/\/[\w.-]+(\/[\w./-]*)?$|^http:\/\/localhost(:\d+)?(\/[\w./-]*)?$/.test(u)) return toast('中轉網址要以 https:// 開頭');
    if (!/^sao_[\w-]{10,200}$/.test(k)) return toast('API key 格式不對（要以 sao_ 開頭）');
    store.set('meUrl', u === SAME_RELAY ? '' : u);
    if ($('#meRemember').checked) { store.set('meKey', k); try { sessionStorage.removeItem('meKey'); } catch { } }
    else { store.set('meKey', ''); try { sessionStorage.setItem('meKey', k); } catch { } }
    loadMe();
  };
  $('#meForget').onclick = () => { store.set('meKey', ''); try { sessionStorage.removeItem('meKey'); } catch { } $('#meKey').value = ''; OWNED.clear(); $('#meOut').innerHTML = ''; toast('已清除 API key'); };
  $('#meOut').addEventListener('click', e => { const a = e.target.closest('[data-item]'); if (a) { e.preventDefault(); itemModal(a.dataset.item); } });
  if (url && key) loadMe();
};
async function loadMe() {
  const out = $('#meOut'); out.innerHTML = '<p class="hint">讀取中…</p>';
  const P = ['/me', '/me/balance', '/me/dungeons', '/me/inventory', '/me/transactions'];
  const res = await Promise.allSettled(P.map(meFetch));
  const bad = res.find(r => r.status === 'rejected');
  if (res.every(r => r.status === 'rejected')) {
    const st = bad.reason.status;
    out.innerHTML = `<p class="note">讀取失敗：${st === 401 ? 'API key 不對或已撤銷。' : st === 403 ? '中轉拒絕了這個網站（檢查 Worker 裡的 ALLOWED_ORIGINS）。' : st ? 'HTTP ' + st : '連不上中轉。請確認網址正確、Worker 已部署，以及你是在 GitHub Pages 版網站。'}</p>`;
    return;
  }
  const [me, bal, dun, inv, tx] = res.map(r => r.status === 'fulfilled' ? r.value : null);
  let h = '';
  if (me) {
    const jobs = (me.jobs || []).map(j => `<li>${val(j.name ?? j.job ?? j.id)} ${j.level != null ? '· Lv ' + esc(j.level) : ''}</li>`).join('');
    h += `<h2>${esc(me.name)}</h2><div class="tw"><table>
      <tr><th>等級</th><td>${val(me.level)}</td><th>經驗</th><td>${val(me.xp)}</td></tr>
      <tr><th>職業</th><td>${val(me.className)}</td><th>生活職業</th><td>${val(me.job)}</td></tr>
      <tr><th>Rank</th><td>${val(me.rank)}</td><th>公會</th><td>${val(me.guild)}</td></tr>
      <tr><th>遊戲時數</th><td>${val(me.playtimeHours)}</td><th>珂爾</th><td>${bal ? `<b>${Number(bal.balance).toLocaleString()}</b> ${esc(bal.currency || '')}` : '—'}</td></tr></table></div>
      ${jobs ? `<h3>生活職業等級</h3><ul>${jobs}</ul>` : ''}
      <p class="hint">資料時間：${me.updatedAt ? fmtWhen(me.updatedAt) : '未有（在大廳時是空的，進入樓層後官方才會更新）'}</p>`;
  }
  if (dun) {
    h += `<h2>地下城紀錄</h2>${(dun.records || []).length ? `<div class="tw"><table><tr><th>地下城</th><th>難度</th><th>最佳</th><th>單人</th><th>組隊</th><th>排名</th><th>次數</th></tr>${dun.records.map(r => `<tr><td>${esc(r.name || r.dungeon)}<br><small class="count">${esc(r.floor || '')}</small></td><td>${esc(r.difficulty || '')}</td><td>${fmtMs(r.bestMs)}</td><td>${fmtMs(r.soloMs)}</td><td>${fmtMs(r.groupMs)}</td><td>${r.rank ? `${r.rank} / ${r.total ?? '?'}` : '—'}</td><td>${r.runs ?? '—'}</td></tr>`).join('')}</table></div>` : '<p class="hint">還沒有紀錄。</p>'}`;
    if ((dun.recentRuns || []).length) h += `<h3>最近挑戰</h3><ul>${dun.recentRuns.slice(0, 10).map(r => `<li>${r.success ? '✅' : '❌'} ${esc(r.dungeon)} ${esc(r.difficulty || '')} · ${fmtMs(r.durationMs)} · ${r.groupSize || 1} 人 · ${fmtWhen(r.finishedAt)}</li>`).join('')}</ul>`;
  }
  if (inv) {
    OWNED.clear();
    const all = (inv.sections || []).flatMap(s => (s.items || []).map(it => ({ ...it, sec: s.title || s.key })));
    // the API's item id is an MMO key ("TYPE:KEY") and floor servers return French names, so match on the name
    const norm = s => String(s || '').toLowerCase().replace(/[’‘`]/g, "'").normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
    const byName = new Map(); for (const x of ITEMS) for (const n of [x.zh, x.en, x.fr]) if (n && !byName.has(norm(n))) byName.set(norm(n), x);
    for (const it of all) { const i = byName.get(norm(it.name)); if (i) { it.site = i; OWNED.set(i.id, (OWNED.get(i.id) || 0) + (it.amount || 1)); } }
    $('#itemOwnWrap').hidden = !OWNED.size;
    if (rendered.items) renderItems();
    h += `<h2>背包（${all.length} 格，${OWNED.size} 種對得上本站物品）</h2><p class="hint">快照時間：${fmtWhen(inv.takenAt)}${inv.server ? ' · ' + esc(inv.server) : ''}。物品頁可以勾「只看我有的」。</p>
      <div class="tw"><table><tr><th>物品</th><th>數量</th><th>位置</th></tr>${all.map(it => `<tr><td>${it.site ? `<a href="#" data-item="${it.site.id}">${esc(itemName(it.site))}</a>${it.name && it.name !== itemName(it.site) ? `<br><small class="count">${esc(it.name)}</small>` : ''}` : esc(it.name || it.material)}</td><td>${it.amount ?? 1}</td><td>${esc(it.sec || '')}</td></tr>`).join('')}</table></div>`;
  }
  if (tx && tx.length) h += `<h2>最近珂爾紀錄</h2><div class="tw"><table><tr><th>時間</th><th>類型</th><th>金額</th><th>餘額</th><th>來源</th></tr>${tx.slice(0, 20).map(t => `<tr><td>${fmtWhen(t.at)}</td><td>${esc(t.kind)}</td><td style="color:${t.amount < 0 ? 'var(--bad)' : 'var(--ok)'}">${t.amount > 0 ? '+' : ''}${Number(t.amount).toLocaleString()}</td><td>${Number(t.balanceAfter).toLocaleString()}</td><td>${esc(t.source || t.sourceType || '')}</td></tr>`).join('')}</table></div>`;
  if (bad) h += `<p class="hint">部分資料讀不到（${esc(bad.reason.message)}），可能是 key 沒有那個權限。</p>`;
  out.innerHTML = h;
}

RENDER.about = () => {
  const n = MD.points.length;
  $('#aboutBox').innerHTML = `<h1>ℹ️ 關於本攻略</h1>
  <p>SAO Minecraft 的中文攻略：互動地圖、物品、怪物、任務、配方、地下城、職業、世界王和遊戲系統，全部整理在同一個網站。</p>
  <h2>收錄內容</h2><ul><li>地圖標記：${n} 個（${MD.maps.length} 張地圖）</li><li>物品：${ITEMS.length} 件</li><li>怪物：${MOBS.mobs.length} 隻</li><li>主線任務：${Object.values(GUIDE.mainq).reduce((a, q) => a + q.length, 0)} 個</li><li>配方 NPC：${Object.keys(GUIDE.recipes).length} 位</li></ul>
  <h2>互動地圖功能</h2><ul><li>第 1～3 層大地圖＋18 張地下城／任務地圖，標記可逐層開關。</li><li>全樓層搜尋：地點、NPC、怪物、甚至「哪裡賣／收購某物品」。</li><li>滑鼠即時顯示遊戲座標；任何標記都可以一鍵複製座標或分享連結。</li><li>輸入座標跳轉、量兩點距離。</li><li>右鍵加入自己的標記（存在瀏覽器），可匯出／匯入。</li><li>地下城逐步攻略：按步驟自動跳到對應位置；顯示建議路線。</li><li>物品、怪物、任務、配方頁都可以一鍵跳到地圖位置。</li></ul>
  <p class="hint">遊戲資料以遊戲內為準。非官方網站。</p>`;
};

/* ================= BOOT ================= */
function route() {
  const h = decodeURIComponent(location.hash.slice(1));
  if (h.startsWith('p-')) { switchTab('map'); return focusPoint(ptBySafe[h.slice(2)]); }
  if (h.startsWith('v-')) { const [, i, x, z, zm] = h.split('-'); const m = MD.maps[+i]; if (m) { switchTab('map'); showMap(m.id, true); return map.setView(ll(unnum(x), unnum(z)), unnum(zm) / 100); } }
  switchTab(RENDER[h] || h === 'map' ? h : 'map');
}
showMap('1');
route();
zoomCls();
window.addEventListener('hashchange', route);
