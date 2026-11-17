// Safe parser for JS object/array literals found in minified bundles (no eval).
// Unknown identifiers / expressions become null.
function parseAt(src, pos, resolve) {
  let i = pos;
  const ws = () => {
    for (;;) {
      while (i < src.length && /\s/.test(src[i])) i++;
      if (src[i] === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; }
      else if (src[i] === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i + 2) + 2; }
      else return;
    }
  };
  function str() {
    const q = src[i++]; let out = '';
    while (i < src.length && src[i] !== q) {
      if (src[i] === '\\') {
        const c = src[++i];
        if (c === 'n') out += '\n'; else if (c === 't') out += '\t';
        else if (c === 'u') { out += String.fromCharCode(parseInt(src.substr(i + 1, 4), 16)); i += 4; }
        else out += c;
        i++;
      } else if (q === '`' && src[i] === '$' && src[i + 1] === '{') { // template expr: skip
        let d = 0; while (i < src.length) { if (src[i] === '{') d++; if (src[i] === '}' && --d === 0) { i++; break; } i++; }
      } else out += src[i++];
    }
    i++; return out;
  }
  function val() {
    ws(); const c = src[i];
    if (c === '{') {
      i++; const o = {};
      for (;;) {
        ws(); if (src[i] === '}') { i++; return o; }
        if (src[i] === '.' && src[i + 1] === '.') { i += 3; val(); } // spread: skip
        else {
          let k;
          if (src[i] === '"' || src[i] === "'" || src[i] === '`') k = str();
          else { const m = /^[^\s:,}]+/.exec(src.slice(i, i + 200)); k = m[0]; i += k.length; }
          ws();
          if (src[i] === ':') { i++; o[k] = val(); } else o[k] = null; // shorthand
        }
        ws(); if (src[i] === ',') i++;
      }
    }
    if (c === '[') {
      i++; const a = [];
      for (;;) { ws(); if (src[i] === ']') { i++; return a; } a.push(val()); ws(); if (src[i] === ',') i++; }
    }
    if (c === '"' || c === "'" || c === '`') return str();
    if (src.startsWith('!0', i)) { i += 2; return true; }
    if (src.startsWith('!1', i)) { i += 2; return false; }
    const m = /^-?[\d.]+(e[-+]?\d+)?/.exec(src.slice(i, i + 40));
    if (m && m[0] !== '.') { i += m[0].length; return Number(m[0]); }
    // call like Q("a",1,[..]) -> {__call, args}; e("Texto") -> "Texto"
    const cm = /^([\w$]+)\(/.exec(src.slice(i, i + 60));
    if (cm) {
      const save = i; i += cm[0].length; const args = [];
      try {
        for (;;) { ws(); if (src[i] === ')') { i++; break; } args.push(val()); ws(); if (src[i] === ',') i++; else if (src[i] !== ')') throw 0; }
        ws();
        if (src[i] === ',' || src[i] === '}' || src[i] === ']' || src[i] === ';' || src[i] === ')') {
          return args.length === 1 && typeof args[0] === 'string' ? args[0] : { __call: cm[1], args };
        }
      } catch (e) { }
      i = save;
    }
    // identifier / expression: skip to next , } ] at depth 0
    let d = 0; const start = i;
    while (i < src.length) {
      const ch = src[i];
      if (ch === '"' || ch === "'" || ch === '`') { str(); continue; }
      if ('([{'.includes(ch)) d++;
      else if (')]}'.includes(ch)) { if (d === 0) break; d--; }
      else if (ch === ',' && d === 0) break;
      i++;
    }
    const id = src.slice(start, i).trim();
    if (id === 'true' || id === 'false') return id === 'true';
    // translate-call like e("Texto") -> keep the string key
    const call = /^[\w$]+\(\s*(["'`])/.exec(id);
    if (call) { const r = parseAt(id, id.indexOf(call[1])); if (typeof r.value === 'string') return r.value; }
    if (resolve && /^[\w$]+$/.test(id)) return resolve(id);
    return null;
  }
  const v = val();
  return { value: v, end: i };
}
module.exports = { parseAt };
