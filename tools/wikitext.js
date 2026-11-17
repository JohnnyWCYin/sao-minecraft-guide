// rough wikitext -> plain text for reading (tables become " | " rows)
module.exports = s => s
  .replace(/<!--[\s\S]*?-->/g, '').replace(/\[\[(?:Category|File|Fichier|Image):[^\]]*\]\]/gi, '')
  .replace(/\{\{[^{}]*\}\}/g, '').replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, '$1').replace(/\[https?:\S+ ([^\]]*)\]/g, '$1')
  .replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/'''?/g, '')
  .replace(/^\{\|.*$/gm, '').replace(/^\|\}.*$/gm, '').replace(/^\|\+.*$/gm, '').replace(/^\|-.*$/gm, '\n')
  .replace(/^[!|]\s*(?:[^|\n]*?=\s*"[^"]*"[^|\n]*\|)?/gm, ' | ').replace(/\|\||!!/g, ' | ')
  .replace(/[ \t]*\n\s*\|/g, ' |').replace(/\n{3,}/g, '\n\n').trim();
