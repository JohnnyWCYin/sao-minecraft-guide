// Make a stand-alone copy of site/ for GitHub Pages in docs/ (the artifact page has no <head>; add one).
// Run: node tools/build-pages.js
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), SRC = path.join(ROOT, 'site'), OUT = path.join(ROOT, 'docs');
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(SRC, OUT, { recursive: true });
const body = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
fs.writeFileSync(path.join(OUT, 'index.html'),
  '<!doctype html>\n<html lang="zh-Hant">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n</head>\n<body>\n' + body + '\n</body>\n</html>\n');
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
console.log('docs/ ready:', fs.readdirSync(OUT).join(' '));
