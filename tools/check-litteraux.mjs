// Repère les chiffres réglementaires écrits en dur dans les pages au lieu d'un jeton {{id}} : un chiffre vérifié ne doit exister qu'une fois, dans data/regles.json.
//   node tools/check-litteraux.mjs          (code de sortie 1 s'il en reste)
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, chargerRegles, formaterValeur } from './lib/regles.mjs';

const normaliser = (s) => s.replace(/<[^>]+>/g, ' ').replace(/[  ]/g, ' ').replace(/\s+/g, ' ');
const regles = chargerRegles().entrees.filter((e) => e.statut === 'verifie' && ['euro', 'pourcent', 'date', 'jours', 'ans'].includes(e.unite));
// formes recherchées : « 37 500 € », « 21,2 % », « 1er septembre 2027 », « 60 jours ». Les jour et mois seuls (« 31 juillet ») ne sont pas contrôlés : ils reviennent dans des exemples qui ne sont pas des règles.
const formes = new Map();
for (const e of regles) {
  const f = normaliser(formaterValeur(e));
  if (e.unite === 'pourcent' && e.valeur < 10 && Number.isInteger(e.valeur)) continue;   // « 1 % », « 5 % » : trop courants pour être discriminants
  if (e.unite === 'euro' && e.valeur < 100) continue;                                      // « 40 € », « 76 € » : revus à la main
  const ids = formes.get(f) ?? []; ids.push(e.id); formes.set(f, ids);
}
const fichiers = (d) => readdirSync(d, { withFileTypes: true }).flatMap((x) => (x.isDirectory() ? fichiers(join(d, x.name)) : x.name.endsWith('.mjs') ? [join(d, x.name)] : []));
let trouves = 0;
for (const f of fichiers(join(ROOT, 'src/content'))) {
  const src = readFileSync(f, 'utf8');
  // on ne regarde que le texte : on retire les jetons, les URL et les lignes de sources (titres de pages avec leur date de vérification)
  const texte = normaliser(src.replace(/\{\{\w+\}\}/g, ' ').replace(/https?:\/\/\S+/g, ' ').split('\n').filter((l) => !/vérifiée? (par la DILA )?le|actualité du|^\s*\['.*service-public/.test(l)).join('\n'));
  for (const [forme, ids] of formes) {
    const re = new RegExp(`(?<![\\d,.])${forme.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\d])`, 'g');
    const n = (texte.match(re) || []).length;
    if (n) { trouves += n; console.error(`✗ ${f.replace(ROOT + '/', '')} : « ${forme} » écrit en dur ${n} fois (jeton {{${ids[0]}}})`); }
  }
}
console.log(`${trouves} chiffre(s) réglementaire(s) écrit(s) en dur`);
process.exit(trouves ? 1 : 0);
