// Génère le site dans public/ : pages, plan du site, index de recherche, fichiers avec empreinte.
//   node tools/build.mjs
// Sources : src/ (contenu et fichiers statiques) · data/regles.json (chiffres réglementaires) · tools/site.config.json (réglages).
// Garde-fou : le build échoue si une donnée vérifiée est périmée (COMPTA_ALLOW_STALE=1 pour publier malgré tout, avec bandeau).
import { cpSync, existsSync, readdirSync, statSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash as hash } from 'node:crypto';
import { cssIcones } from './lib/icones-css.mjs';
import CFG from './site.config.json' with { type: 'json' };
import { ROOT, chargerRegles, validerRegles, aujourdhui, remplirJetons } from './lib/regles.mjs';
import { page } from './lib/layout.mjs';
import { pages, page404 } from '../src/content/pages.mjs';
import { genererFlux } from '../src/content/ics-flux.mjs';

const OUT = join(ROOT, 'public');
const regles = chargerRegles();
const { erreurs, perimees } = validerRegles(regles, aujourdhui());
if (erreurs.length) { console.error('✗ data/regles.json :\n  ' + erreurs.join('\n  ')); process.exit(1); }
const bandeau = perimees.length > 0;
if (bandeau && !process.env.COMPTA_ALLOW_STALE) {
  console.error('✗ Données réglementaires périmées (voir docs/mise-a-jour-annuelle.md) :\n  ' + perimees.join('\n  ') + '\n  (COMPTA_ALLOW_STALE=1 pour publier quand même, avec un bandeau d’avertissement)');
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'assets'), { recursive: true });
cpSync(join(ROOT, 'src/assets'), join(OUT, 'assets'), { recursive: true });
{ const f = join(OUT, 'assets/style.css'); writeFileSync(f, readFileSync(f, 'utf8').replace('/* ICONES */', cssIcones())); }
const empreinte = (f) => hash('sha1').update(readFileSync(join(OUT, 'assets', f))).digest('hex').slice(0, 8);
// Modules ES (assets/js) : une seule empreinte pour tous, ajoutée à chaque import, pour que le navigateur ne mélange jamais deux versions.
const fichiersJs = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? fichiersJs(join(d, f)) : f.endsWith('.js') ? [join(d, f)] : []));
const jsDir = join(OUT, 'assets/js');
const modulesJs = existsSync(jsDir) ? fichiersJs(jsDir).sort() : [];
const jsv = hash('sha1').update(modulesJs.map((f) => readFileSync(f)).join('\n')).digest('hex').slice(0, 8);
for (const f of modulesJs) writeFileSync(f, readFileSync(f, 'utf8').replace(/(from\s+['"])(\.{1,2}\/[^'"?]+\.js)(['"])/g, `$1$2?v=${jsv}$3`));
const assets = { css: empreinte('style.css'), js: empreinte('app.js'), jsv };

// Données réglementaires embarquées dans les pages d'outils (lues par le script, jamais écrites en dur dans le code).
const donnees = regles.entrees.map(({ id, unite, valeur, statut }) => ({ id, unite, valeur, statut }));
const liste = [...pages(regles), page404].map((p) => ({ ...p, body: remplirJetons(p.body, regles), donnees: p.outil ? donnees : null }));
const index = [];
for (const p of liste) {
  let html = page({ ...p, assets });
  if (bandeau) html = html.replace('<header class="nav">', '<div class="banniere" role="note">Mise à jour annuelle des chiffres en cours : vérifiez-les sur les sites officiels.</div>\n<header class="nav">');
  const file = p.path.endsWith('.html') ? join(OUT, p.path) : join(OUT, p.path, 'index.html');
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, html);
  if (!p.noindex) index.push({ url: p.path, titre: p.title, description: p.description });
}
// Calendriers .ics pré-générés (abonnement)
mkdirSync(join(OUT, 'ics'), { recursive: true });
for (const f of genererFlux(regles)) writeFileSync(join(OUT, 'ics', f.fichier), f.contenu);
writeFileSync(join(OUT, 'assets/search-index.json'), JSON.stringify(index.filter((i) => i.url !== '/')) + '\n');
const urls = index.map((i) => `  <url><loc>${CFG.origin}${i.url}</loc><lastmod>${CFG.miseAJour}</lastmod></url>`).join('\n');
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${CFG.origin}/sitemap.xml\n`);
console.log(`${liste.length} pages générées dans public/ · ${regles.entrees.filter((e) => e.statut === 'verifie').length}/${regles.entrees.length} données réglementaires vérifiées`);
