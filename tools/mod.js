// load named top-level literals from a JS file (minified bundle or plain script), safely - no eval
const fs = require('fs'), { parseAt } = require('./lit');
module.exports = function (file) {
  const s = fs.readFileSync(file, 'utf8'), cache = {}, busy = new Set();
  function resolve(name) {
    if (name in cache) return cache[name];
    if (busy.has(name)) return null; busy.add(name);
    const esc = name.replace(/\$/g, '\\$');
    const re = new RegExp('(?:const |let |var |,|;)\\s*' + esc + '\\s*=\\s*(?=[\\[{"`\'\\d-])');
    const m = re.exec(s); let v = null;
    if (m) try { v = parseAt(s, m.index + m[0].length, resolve).value; } catch (e) { }
    busy.delete(name); return cache[name] = v;
  }
  return { src: s, get: resolve };
};
