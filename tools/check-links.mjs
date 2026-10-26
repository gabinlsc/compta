// Vérifie les liens internes, les ancres et les ressources de toutes les pages générées. Code de sortie 1 s'il y a une erreur.
//   node tools/check-links.mjs
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import CFG from './site.config.json' with { type: 'json' };
import { PUBLIC, pagesHtml } from './lib/pages.mjs';

const pages = pagesHtml();
const cache = new Map();
const html = (f) => { if (!cache.has(f)) cache.set(f, readFileSync(f, 'utf8')); return cache.get(f); };
const urlToFile = (path) => {
  const clean = decodeURIComponent(path.replace(/[?#].*$/, ''));
  for (const c of [clean, join(clean, 'index.html')]) { const f = join(PUBLIC, c); if (existsSync(f) && statSync(f).isFile()) return f; }
  return null;
};
let errors = 0, checked = 0;
const fail = (page, msg) => { errors++; console.error(`✗ ${relative(PUBLIC, page)} : ${msg}`); };
for (const page of pages) {
  const src = html(page);
  const ids = new Set([...src.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of src.matchAll(/<(?:a|link|script|img|source)\b[^>]*?\s(?:href|src)="([^"]*)"/g)) {
    let u = m[1];
    if (!u || /^(mailto:|tel:|data:|https?:\/\/(?!compta\.glsc\.fr))/.test(u)) continue;
    checked++;
    u = u.replace(CFG.origin, '');
    if (u.startsWith('#')) { if (u.length > 1 && !ids.has(u.slice(1))) fail(page, `ancre introuvable ${u}`); continue; }
    if (!u.startsWith('/')) { fail(page, `lien relatif non autorisé ${u}`); continue; }
    const file = urlToFile(u);
    if (!file) { fail(page, `lien cassé ${u}`); continue; }
    const hash = (u.match(/#(.+)$/) || [])[1];
    if (hash && file.endsWith('.html') && !new RegExp(`\\sid="${hash}"`).test(html(file))) fail(page, `ancre ${u} absente de ${relative(PUBLIC, file)}`);
  }
  for (const m of src.matchAll(/<a\b[^>]*href="https?:\/\/(?!compta\.glsc\.fr)[^"]*"[^>]*>/g)) if (!/rel="[^"]*noopener/.test(m[0])) fail(page, `lien externe sans rel="noopener" : ${m[0].slice(0, 80)}`);
}
console.log(`${pages.length} pages, ${checked} liens vérifiés, ${errors} erreur(s)`);
process.exit(errors ? 1 : 0);
