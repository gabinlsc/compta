// Contrôles de référencement de base : titre, description, canonique, un seul h1, JSON-LD valide, images avec alt, identifiants uniques, plan du site.
//   node tools/check-seo.mjs
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import CFG from './site.config.json' with { type: 'json' };
import { PUBLIC, pagesHtml } from './lib/pages.mjs';

let errors = 0, count = 0;
const titles = new Map(), descs = new Map(), canoniques = [];
const fail = (page, msg) => { errors++; console.error(`✗ ${relative(PUBLIC, page)} : ${msg}`); };
for (const page of pagesHtml()) {
  const src = readFileSync(page, 'utf8');
  const rel = '/' + relative(PUBLIC, page).replace(/index\.html$/, '');
  if (!/<html lang="fr"/.test(src)) fail(page, 'attribut lang="fr" absent');
  if (/<meta name="robots" content="noindex/.test(src)) continue;
  count++;
  const title = (/<title>([^<]*)<\/title>/.exec(src) || [])[1];
  const desc = (/<meta name="description" content="([^"]*)"/.exec(src) || [])[1];
  const canon = (/<link rel="canonical" href="([^"]*)"/.exec(src) || [])[1];
  if (!title) fail(page, 'balise <title> absente'); else {
    if (title.length > 70) fail(page, `titre trop long (${title.length}) : ${title}`);
    if (titles.has(title)) fail(page, `titre déjà utilisé par ${titles.get(title)}`); else titles.set(title, rel);
  }
  if (!desc) fail(page, 'meta description absente'); else {
    if (desc.length < 70 || desc.length > 175) fail(page, `description de ${desc.length} caractères (70 à 175 attendus)`);
    if (descs.has(desc)) fail(page, `description déjà utilisée par ${descs.get(desc)}`); else descs.set(desc, rel);
  }
  if (canon !== CFG.origin + rel) fail(page, `canonique « ${canon} », attendue « ${CFG.origin + rel} »`);
  canoniques.push(canon);
  if ((src.match(/<h1[\s>]/g) || []).length !== 1) fail(page, 'une seule balise <h1> attendue');
  if (!/property="og:image"/.test(src)) fail(page, 'og:image absente');
  for (const m of src.matchAll(/<img\b[^>]*>/g)) if (!/\salt="/.test(m[0])) fail(page, `image sans alt : ${m[0].slice(0, 60)}`);
  for (const m of src.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch (e) { fail(page, `JSON-LD invalide : ${e.message}`); } }
  if (/\{\{\w+\}\}/.test(src)) fail(page, 'jeton {{…}} non remplacé');
  if (/^\/guides\/[^/]+\/$/.test(rel)) { // un guide fait entre 700 et 1 400 mots et cite ses sources
    const mots = (/<article[\s\S]*<\/article>/.exec(src)?.[0] ?? '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    if (mots < 700 || mots > 1400) fail(page, `guide de ${mots} mots (700 à 1 400 attendus)`);
    if (!/<ul class="sources">/.test(src) || !/application\/ld\+json[^<]*Article/.test(src.replace(/\s+/g, ' ') ) && !/"@type":"Article"/.test(src)) fail(page, 'sources ou données structurées Article absentes');
  }
  if (/^\/(outils|guides)\/[^/]+\/$/.test(rel) && (src.match(/<article class="card"><a class="card-lien"/g) || []).length < 3) fail(page, 'maillage interne : moins de 3 pages liées en bas de page');
  const ids = [...src.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) fail(page, `identifiants en double : ${[...new Set(dup)].join(', ')}`);
  if (/\sstyle="|<style[\s>]|\son\w+="|<script(?![^>]*\bsrc=)(?![^>]*ld\+json)(?![^>]*application\/json)/.test(src)) fail(page, 'style ou script en ligne (interdit par la CSP)');
}
const plan = [...readFileSync(join(PUBLIC, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const c of canoniques) if (!plan.includes(c)) { errors++; console.error(`✗ sitemap.xml : ${c} absente`); }
console.log(`${count} pages indexables contrôlées, ${errors} erreur(s)`);
process.exit(errors ? 1 : 0);
