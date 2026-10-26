// Budget de poids : échoue si un fichier ou une page dépasse la limite fixée (le site ne doit pas s'alourdir sans que personne ne s'en aperçoive).
//   node tools/check-budget.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';
import { PUBLIC, pagesHtml } from './lib/pages.mjs';

const KB = 1024;
const LIMITS = { 'assets/style.css': [24 * KB, 6 * KB], 'assets/app.js': [6 * KB, 2.5 * KB] }; // [octets bruts, octets gzip]
const IMAGE_MAX = 90 * KB, FONT_MAX = 30 * KB, HTML_MAX = [40 * KB, 12 * KB], PAGE_BUDGET_GZ = 30 * KB; // HTML + CSS + JS d'une page, compressés
let errors = 0;
const fail = (m) => { errors++; console.error('✗ ' + m); };
const gz = (f) => gzipSync(readFileSync(f), { level: 9 }).length;
const fmt = (n) => (n / KB).toFixed(1) + ' Ko';
for (const [rel, [raw, zipped]] of Object.entries(LIMITS)) {
  const f = join(PUBLIC, rel);
  if (statSync(f).size > raw) fail(`${rel} : ${fmt(statSync(f).size)} (limite ${fmt(raw)})`);
  if (gz(f) > zipped) fail(`${rel} : ${fmt(gz(f))} compressé (limite ${fmt(zipped)})`);
}
for (const f of readdirSync(join(PUBLIC, 'assets/fonts'))) if (statSync(join(PUBLIC, 'assets/fonts', f)).size > FONT_MAX) fail(`assets/fonts/${f} trop lourde`);
for (const f of readdirSync(join(PUBLIC, 'assets'))) if (/\.(png|webp|jpg)$/.test(f) && statSync(join(PUBLIC, 'assets', f)).size > IMAGE_MAX) fail(`assets/${f} : ${fmt(statSync(join(PUBLIC, 'assets', f)).size)} (limite ${fmt(IMAGE_MAX)})`);
const shared = gz(join(PUBLIC, 'assets/style.css')) + gz(join(PUBLIC, 'assets/app.js'));
let heaviest = ['', 0];
for (const p of pagesHtml()) {
  const size = statSync(p).size, z = gz(p), total = z + shared;
  if (size > HTML_MAX[0] || z > HTML_MAX[1]) fail(`${relative(PUBLIC, p)} : HTML ${fmt(size)} / ${fmt(z)} compressé`);
  if (total > PAGE_BUDGET_GZ) fail(`${relative(PUBLIC, p)} : ${fmt(total)} compressé (limite ${fmt(PAGE_BUDGET_GZ)})`);
  if (total > heaviest[1]) heaviest = [relative(PUBLIC, p), total];
}
console.log(`page la plus lourde : ${heaviest[0]} (${fmt(heaviest[1])} compressé, budget ${fmt(PAGE_BUDGET_GZ)}) · ${errors} dépassement(s)`);
process.exit(errors ? 1 : 0);
