// Budget de poids : échoue si un fichier ou une page dépasse la limite fixée (le site ne doit pas s'alourdir sans que personne ne s'en aperçoive).
//   node tools/check-budget.mjs
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';
import { PUBLIC, pagesHtml } from './lib/pages.mjs';

const KB = 1024;
const LIMITS = { 'assets/style.css': [32 * KB, 8 * KB], 'assets/app.js': [6 * KB, 2.5 * KB] }; // [octets bruts, octets gzip]
const IMAGE_MAX = 90 * KB, FONT_MAX = 30 * KB, HTML_MAX = [64 * KB, 14 * KB], PAGE_BUDGET_GZ = 50 * KB; // HTML + CSS + JS d'une page, compressés
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
// Modules des outils (assets/js) : poids total limité, et ajouté au budget des pages qui les chargent.
const jsFichiers = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? jsFichiers(join(d, f)) : f.endsWith('.js') ? [join(d, f)] : []));
const modules = existsSync(join(PUBLIC, 'assets/js')) ? jsFichiers(join(PUBLIC, 'assets/js')) : [];
const modulesBruts = modules.reduce((a, f) => a + statSync(f).size, 0);
if (modulesBruts > 160 * KB) fail(`assets/js : ${fmt(modulesBruts)} au total (limite 160 Ko)`);
// Poids des modules chargés par une page : le module d'entrée et tout ce qu'il importe (transitivement).
const graphe = (entree, vus = new Set()) => { const f = join(PUBLIC, entree.replace(/^\//, '').replace(/\?.*$/, '')); if (vus.has(f)) return vus; vus.add(f); for (const m of readFileSync(f, 'utf8').matchAll(/from\s+['"](\.{1,2}\/[^'"?]+\.js)/g)) graphe('/' + join(f.slice(PUBLIC.length + 1), '..', m[1]).replace(/\\/g, '/'), vus); return vus; };
const poidsModules = (html) => { const vus = new Set(); for (const m of html.matchAll(/<script type="module" src="([^"]+)"/g)) graphe(m[1], vus); const fichiers = [...vus]; return { gz: fichiers.reduce((a, f) => a + gz(f), 0), brut: fichiers.reduce((a, f) => a + statSync(f).size, 0) }; };
let heaviest = ['', 0];
for (const p of pagesHtml()) {
  const source = readFileSync(p, 'utf8'), mod = poidsModules(source);
  const size = statSync(p).size, z = gz(p), total = z + shared + mod.gz;
  if (mod.gz > 22 * KB) fail(`${relative(PUBLIC, p)} : modules ${fmt(mod.gz)} compressé (limite 22 Ko)`);
  if (size > HTML_MAX[0] || z > HTML_MAX[1]) fail(`${relative(PUBLIC, p)} : HTML ${fmt(size)} / ${fmt(z)} compressé`);
  if (total > PAGE_BUDGET_GZ) fail(`${relative(PUBLIC, p)} : ${fmt(total)} compressé (limite ${fmt(PAGE_BUDGET_GZ)})`);
  if (total > heaviest[1]) heaviest = [relative(PUBLIC, p), total];
}
console.log(`page la plus lourde : ${heaviest[0]} (${fmt(heaviest[1])} compressé, budget ${fmt(PAGE_BUDGET_GZ)}) · ${errors} dépassement(s)`);
process.exit(errors ? 1 : 0);
