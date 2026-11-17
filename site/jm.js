/* JourneyMap waypoints: JourneyMap 6 WaypointData.dat (NBT) export/import, JourneyMap 5 .json import.
   Structure copied from a real JourneyMap 6 file (DelayedCode's WaypointDataWorking.dat). Needs nbt.js. */
(function (g) {
  const B = v => ({ __t: 1, v }), I = v => ({ __t: 3, v: v | 0 }), F = v => ({ __t: 5, v }), S = v => ({ __t: 8, v: String(v) }), C = v => ({ __t: 10, v });
  const icon = () => C({ textureWidth: I(16), rotation: I(0), opacity: F(1), resourceLocation: S('journeymap:textures/waypoint/icon/waypoint-icon.png'), textureHeight: I(16) });
  const disp = o => C(Object.fromEntries(Object.entries(o).map(([k, v]) => [k, S(v)])));
  const group = (guid, name, { color, locked = 0, colorOverride = 0, display = { wp_sort: 'name', dimDisplay: 'all', wp_sort_type: 'asc' }, tag } = {}) => C({
    settings: C({ showDeviation: B(0), enable: B(1), display: disp(display), locked: B(locked), colorOverride: B(colorOverride) }),
    ...(color != null ? { color: I(color) } : {}), icon: icon(), name: S(name), guid: S(guid), ...(tag != null ? { tag: S(tag) } : {}), modId: S('journeymap'),
  });
  const argb = hex => (0xff000000 | parseInt(String(hex || '#ffffff').replace('#', '').slice(0, 6), 16)) | 0;
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3) | 8).toString(16); }));
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  function emptyRoot() {
    return C({
      groups: C({
        journeymap_all: group('journeymap_all', 'All', { locked: 1, display: { hide_empty: 'false', sort_type: 'asc', dimDisplay: 'all', sort: 'name', hide_all: 'false', hide_empty_death: 'false', hide_empty_temp: 'false' } }),
        journeymap_death: group('journeymap_death', 'Death', { color: 16711680, locked: 1, colorOverride: 1, display: {} }),
        journeymap_temp: group('journeymap_temp', 'Temp', { locked: 1, display: { dimDisplay: 'all' }, tag: 'Temp' }),
        journeymap_default: group('journeymap_default', 'Default'),
      }),
      waypoints: C({}),
    });
  }
  /* groups: [{name, color, points:[{name, x, y, z, color?, guid?}]}]; base: an imported WaypointData.dat to add to (keeps the player's own waypoints) */
  function exportDat(groups, base) {
    const root = base ? NBT.read(base) : emptyRoot();
    const G = root.v.groups.v, W = root.v.waypoints.v;
    for (const gr of groups) {
      if (!gr.points.length) continue;
      let gid = Object.keys(G).find(k => G[k].v.name.v === gr.name);
      if (!gid) { gid = uuid(); G[gid] = group(gid, gr.name, { tag: '' }); }
      const have = new Set(Object.values(W).filter(w => w.v.groupId.v === gid).map(w => w.v.name.v + '@' + w.v.pos.v.x.v + ',' + w.v.pos.v.z.v));
      for (const p of gr.points) {
        const x = Math.round(p.x), y = Math.round(p.y ?? 70), z = Math.round(p.z);
        if (have.has(p.name + '@' + x + ',' + z)) continue; // already in the file: re-export adds no duplicates
        const id = p.guid && UUID.test(p.guid) && !W[p.guid] ? p.guid : uuid();
        W[id] = C({
          settings: C({ showDeviation: B(0), enable: B(1), persistent: B(1) }), color: I(argb(p.color || gr.color)),
          pos: C({ x: I(x), y: I(y), z: I(z), dimension: S('minecraft:overworld') }), origin: S('journeymap'), groupId: S(gid),
          icon: icon(), name: S(String(p.name).slice(0, 80)), guid: S(id), modId: S('journeymap'), dimensions: { __t: 9, v: { et: 8, v: [S('minecraft:overworld')] } },
        });
      }
    }
    return NBT.write(root);
  }
  // returns [{name, x, y, z, guid, group, color}]
  function importFile(bytes, filename) {
    const u8 = new Uint8Array(bytes);
    if (/\.json$/i.test(filename) || u8[0] === 0x7b) { // JourneyMap 5: one waypoint per .json file
      const j = JSON.parse(new TextDecoder().decode(u8));
      return [].concat(j).filter(w => w && Number.isFinite(+w.x) && Number.isFinite(+w.z)).map(w => ({ name: String(w.name || 'Waypoint'), x: +w.x, y: +w.y, z: +w.z, guid: String(w.id || ''), group: '', color: w.r != null ? '#' + [w.r, w.g, w.b].map(n => (n | 0).toString(16).padStart(2, '0')).join('') : null }));
    }
    if (u8[0] === 0x1f && u8[1] === 0x8b) throw new Error('這個檔案是壓縮過的 NBT，暫時不支援');
    const root = NBT.read(u8), G = root.v.groups?.v || {}, W = root.v.waypoints?.v || {};
    return Object.values(W).map(w => w.v).filter(w => w.pos).map(w => ({
      name: w.name?.v || 'Waypoint', x: w.pos.v.x.v, y: w.pos.v.y.v, z: w.pos.v.z.v, guid: w.guid?.v || '',
      group: G[w.groupId?.v]?.v.name.v || '', color: w.color ? '#' + ((w.color.v >>> 0) & 0xffffff).toString(16).padStart(6, '0') : null,
    }));
  }
  // single-file zip, stored (no compression)
  function zip(name, data) {
    const crcT = zip.t || (zip.t = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; }));
    let crc = -1; for (const b of data) crc = crcT[(crc ^ b) & 255] ^ (crc >>> 8); crc = (crc ^ -1) >>> 0;
    const fn = new TextEncoder().encode(name), out = new Uint8Array(30 + fn.length + data.length + 46 + fn.length + 22), dv = new DataView(out.buffer);
    const hdr = (o, sig, central) => {
      dv.setUint32(o, sig, true); let p = o + 4; if (central) { dv.setUint16(p, 20, true); p += 2; }
      dv.setUint16(p, 20, true); dv.setUint16(p + 2, 0x0800, true); dv.setUint16(p + 4, 0, true); dv.setUint32(p + 6, 0x00210000, true);
      dv.setUint32(p + 10, crc, true); dv.setUint32(p + 14, data.length, true); dv.setUint32(p + 18, data.length, true); dv.setUint16(p + 22, fn.length, true);
      return p + 24;
    };
    let p = hdr(0, 0x04034b50); p += 2; out.set(fn, p); p += fn.length; out.set(data, p); p += data.length;
    const cd = p; p = hdr(p, 0x02014b50, true); p += 2 + 2 + 2 + 2 + 4; dv.setUint32(p, 0, true); p += 4; out.set(fn, p); p += fn.length;
    dv.setUint32(p, 0x06054b50, true); dv.setUint16(p + 8, 1, true); dv.setUint16(p + 10, 1, true); dv.setUint32(p + 12, p - cd, true); dv.setUint32(p + 16, cd, true);
    return out;
  }
  /* Xaero's Minimap: mw$default_1.txt, one "waypoint:name:initials:x:y:z:color:disabled:type:set:rotate_on_tp:tp_yaw:visibility_type:destination" per line.
     ':' inside a name is written as '§§'; color is a Minecraft chat colour index 0-15; y may be '~'. */
  const MC = ['#000000', '#0000aa', '#00aa00', '#00aaaa', '#aa0000', '#aa00aa', '#ffaa00', '#aaaaaa', '#555555', '#5555ff', '#55ff55', '#55ffff', '#ff5555', '#ff55ff', '#ffff55', '#ffffff'];
  const rgb = h => { const n = parseInt(String(h || '#ffffff').replace('#', '').slice(0, 6), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const mcIndex = hex => { const [r, g2, b] = rgb(hex); let best = 15, d0 = Infinity; MC.forEach((c, i) => { const [R, G, Bb] = rgb(c), d = (R - r) ** 2 + (G - g2) ** 2 + (Bb - b) ** 2; if (d < d0) { d0 = d; best = i; } }); return best; };
  const XHEAD = '#\n#waypoint:name:initials:x:y:z:color:disabled:type:set:rotate_on_tp:tp_yaw:visibility_type:destination\n#\n';
  const xName = s => String(s).replace(/:/g, '§§').replace(/[\r\n]/g, ' ').slice(0, 80);
  function exportXaero(groups, baseText) {
    let text = baseText && /waypoint:/.test(baseText) ? baseText.replace(/\s*$/, '\n') : 'sets:gui.xaero_default\n' + XHEAD;
    const have = new Set(importXaero(text).map(w => w.name + '@' + w.x + ',' + w.z));
    for (const gr of groups) for (const p of gr.points) {
      const name = String(p.name), x = Math.round(p.x), z = Math.round(p.z);
      if (have.has(name + '@' + x + ',' + z)) continue; have.add(name + '@' + x + ',' + z);
      const ini = [...name.replace(/[^\p{L}\p{N}]/gu, '')].slice(0, 1).join('').toUpperCase() || 'W';
      text += `waypoint:${xName(name)}:${xName(ini)}:${x}:${p.y != null ? Math.round(p.y) : '~'}:${z}:${mcIndex(p.color || gr.color)}:false:0:gui.xaero_default:false:0:0:false\n`;
    }
    return text;
  }
  function importXaero(text) {
    return String(text).split(/\r?\n/).map(l => l.trim()).filter(l => /^(xaero-)?waypoint:/.test(l)).map(l => {
      const f = l.split(':'); // xaero-waypoint share lines carry the same fields
      const [, name, ini, x, y, z, col] = f;
      return { name: (name || 'Waypoint').replace(/§§/g, ':'), initials: ini, x: +x, y: y === '~' ? null : +y, z: +z, guid: '', group: f[9] || '', color: MC[+col] || null };
    }).filter(w => Number.isFinite(w.x) && Number.isFinite(w.z));
  }
  g.JM = { exportDat, importFile, zip, exportXaero, importXaero };
  if (typeof module !== 'undefined') module.exports = g.JM;
})(typeof window !== 'undefined' ? window : globalThis);
