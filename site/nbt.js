/* Minimal uncompressed NBT read/write for JourneyMap 6 WaypointData.dat (big-endian).
   Values: compound -> {__t:10, v:{name: tag}}, list -> {__t:9, et, v:[...]}, scalars -> {__t, v}. */
(function (g) {
  const te = new TextEncoder(), td = new TextDecoder();
  function read(buf) {
    const dv = new DataView(buf.buffer || buf, buf.byteOffset || 0, buf.byteLength); let o = 0;
    const str = () => { const n = dv.getUint16(o); o += 2; const s = td.decode(new Uint8Array(dv.buffer, dv.byteOffset + o, n)); o += n; return s; };
    function pay(t) {
      switch (t) {
        case 1: return dv.getInt8(o++);
        case 2: o += 2; return dv.getInt16(o - 2);
        case 3: o += 4; return dv.getInt32(o - 4);
        case 4: o += 8; return dv.getBigInt64(o - 8);
        case 5: o += 4; return dv.getFloat32(o - 4);
        case 6: o += 8; return dv.getFloat64(o - 8);
        case 7: case 11: case 12: { const n = dv.getInt32(o); o += 4; const sz = t === 7 ? 1 : t === 11 ? 4 : 8; const a = []; for (let i = 0; i < n; i++) a.push(t === 7 ? dv.getInt8(o + i) : t === 11 ? dv.getInt32(o + i * 4) : dv.getBigInt64(o + i * 8)); o += n * sz; return a; }
        case 8: return str();
        case 9: { const et = dv.getInt8(o++), n = dv.getInt32(o); o += 4; const v = []; for (let i = 0; i < n; i++) v.push({ __t: et, v: pay(et) }); return { et, v }; }
        case 10: { const v = {}; for (;;) { const ct = dv.getInt8(o++); if (ct === 0) return v; const k = str(); v[k] = { __t: ct, v: pay(ct) }; } }
        default: throw new Error('NBT tag ' + t);
      }
    }
    const t = dv.getInt8(o++); if (t !== 10) throw new Error('不是 NBT 檔案');
    str(); return { __t: 10, v: pay(10) };
  }
  function write(root) {
    const out = []; let len = 0;
    const push = b => { out.push(b); len += b.length; };
    const num = (t, v) => { const b = new Uint8Array([0, 1, 2, 4, 8, 4, 8][t]); const dv = new DataView(b.buffer); [, (x) => dv.setInt8(0, x), (x) => dv.setInt16(0, x), (x) => dv.setInt32(0, x), (x) => dv.setBigInt64(0, BigInt(x)), (x) => dv.setFloat32(0, x), (x) => dv.setFloat64(0, x)][t](v); push(b); };
    const str = s => { const b = te.encode(s); num(2, b.length); push(b); };
    function pay(t, v) {
      if (t >= 1 && t <= 6) return num(t, v);
      if (t === 8) return str(v);
      if (t === 9) { num(1, v.et); num(3, v.v.length); v.v.forEach(x => pay(v.et, x.v)); return; }
      if (t === 10) { for (const [k, c] of Object.entries(v)) { num(1, c.__t); str(k); pay(c.__t, c.v); } num(1, 0); return; }
      if (t === 7 || t === 11 || t === 12) { num(3, v.length); v.forEach(x => num(t === 7 ? 1 : t === 11 ? 3 : 4, x)); return; }
      throw new Error('NBT tag ' + t);
    }
    num(1, 10); str(''); pay(10, root.v);
    const r = new Uint8Array(len); let o = 0; for (const b of out) { r.set(b, o); o += b.length; } return r;
  }
  g.NBT = { read, write };
  if (typeof module !== 'undefined') module.exports = g.NBT;
})(typeof window !== 'undefined' ? window : globalThis);
