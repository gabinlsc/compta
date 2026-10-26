// Parcours du livre des recettes : ajout, totaux, correction par écriture inverse, plafond, CSV, stockage explicite, import/export, injection de HTML.
import { launch, serve, ok } from './helpers.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const { base, close } = await serve({ csp: true });
const browser = await launch();
const externes = [], erreurs = [];
const attendre = async (p, fn, delai = 5000) => { const fin = Date.now() + delai; while (Date.now() < fin) { if (await p.evaluate(fn)) return; await new Promise((r) => setTimeout(r, 50)); } throw new Error('Condition non remplie : ' + fn); };
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 }, acceptDownloads: true });
const page = await ctx.newPage();
page.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) externes.push(r.url()); });
page.on('pageerror', (e) => erreurs.push(e.message)); page.on('console', (m) => m.type() === 'error' && erreurs.push(m.text()));
page.on('dialog', (d) => d.accept());
const norm = (t) => t.replace(/[  ]/g, ' ');
const annee = new Date().getFullYear();
const ajouter = async (date, origine, montant, extra = {}) => {
  await page.fill('[name="date"]', date); await page.fill('[name="origine"]', origine); await page.fill('[name="montant"]', montant);
  if (extra.nature) await page.fill('[name="nature"]', extra.nature); if (extra.mode) await page.selectOption('[name="mode"]', extra.mode); if (extra.piece) await page.fill('[name="piece"]', extra.piece);
  await page.click('#ajouter');
};

await page.goto(base + '/outils/livre-des-recettes/'); await page.waitForSelector('#outil-livre:not([hidden])');
assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length + document.cookie.length), 0); assert.match(await page.textContent('.vide'), /Aucune recette/); ok('au chargement : livre vide, aucun stockage');
await page.click('#ajouter'); assert.match(await page.textContent('#erreur-saisie'), /date d’encaissement|origine|montant/); assert.equal(await page.evaluate(() => document.activeElement.name), 'origine'); ok('saisie incomplète : erreur claire et focus sur le champ');
await ajouter(`${annee}-01-15`, 'Boulangerie Le Fournil', '450', { nature: 'Site vitrine', piece: 'F-001' });
await ajouter(`${annee}-03-31`, '<img src=x onerror="window.__xss=1">', '1 200,50', { mode: 'especes', nature: '=2+2' });
await ajouter(`${annee}-04-02`, 'Cabinet Martin', '300', { mode: 'cheque' });
assert.equal(await page.locator('table.ecritures tbody tr').count(), 3); assert.match(norm(await page.textContent('.carte-net .grand')), /1 950,50 €/); ok('3 recettes : total 1 950,50 €');
assert.equal(await page.evaluate(() => window.__xss), undefined); assert.equal(await page.locator('table.ecritures img').count(), 0); ok('sécurité : le HTML saisi reste du texte');
await page.selectOption('[name="periodicite"]', 'trimestre');
const lignes = (await page.locator('table.periodes tbody tr').allTextContents()).map(norm);
assert.match(lignes[0], /1er trimestre.*1 650,50 €.*30 avril/); assert.match(lignes[1], /2e trimestre.*300,00 €.*31 juillet/); ok('périodes trimestrielles : totaux et échéances (30 avril, 31 juillet)');

// correction : écriture inverse, pas de modification
await page.click('button[data-corriger]:near(:text("Cabinet Martin")) >> nth=0').catch(() => {});
const avant = await page.locator('table.ecritures tbody tr').count();
await page.locator('table.ecritures tr', { hasText: 'Cabinet Martin' }).locator('button[data-corriger]').click();
assert.equal(await page.locator('table.ecritures tbody tr').count(), avant + 1); assert.match(norm(await page.textContent('.carte-net .grand')), /1 650,50 €/); assert.match(await page.textContent('table.ecritures'), /Correction de l’écriture n° 3/); ok('correction : une écriture inverse est ajoutée, l’écriture d’origine reste visible');
assert.equal(await page.locator('table.ecritures tr', { hasText: 'Cabinet Martin' }).locator('button[data-corriger]').count(), 0); ok('une écriture corrigée ne peut plus l’être');

// plafond et jauge
await ajouter(`${annee}-05-10`, 'Gros client', '90000');
assert.match(await page.textContent('.alerte.danger'), /Plafond de chiffre d’affaires dépassé/); assert.equal(await page.getAttribute('.jauge progress', 'aria-label'), 'Part du plafond de chiffre d’affaires utilisée'); ok('plafond dépassé : alerte et jauge');
await page.selectOption('[name="activite"]', 'vente'); assert.equal(await page.locator('.alerte.danger').count(), 0); ok('le plafond dépend de l’activité');

// CSV
const [csv] = await Promise.all([page.waitForEvent('download'), page.click('#csv')]);
const texte = readFileSync(await csv.path(), 'utf8');
assert.ok(texte.startsWith('﻿"N°";')); assert.ok(texte.includes('"1200,50"')); assert.ok(texte.includes(`"'=2+2"`)); assert.ok(texte.includes(`"'<img`) === false); assert.ok(!/[^\r]\n/.test(texte)); ok('CSV : BOM, point-virgule, virgule décimale, formule neutralisée');

// stockage explicite
assert.equal(await page.evaluate(() => localStorage.length), 0);
await page.click('#enregistrer'); assert.ok(await page.evaluate(() => localStorage.getItem('compta:livre:v1')?.includes('Cabinet Martin'))); ok('« Enregistrer » : localStorage seulement après le clic');
await page.reload(); await page.waitForSelector('#outil-livre:not([hidden])'); assert.ok((await page.locator('table.ecritures tbody tr').count()) >= 5); ok('rechargement : livre retrouvé');
await page.check('[name="auto"]'); await ajouter(`${annee}-06-01`, 'Nouveau client', '10');
assert.ok(await page.evaluate(() => JSON.parse(localStorage.getItem('compta:livre:v1')).entrees.some((e) => e.origine === 'Nouveau client'))); ok('enregistrement automatique : opt-in explicite, écriture sauvegardée');
const [json] = await Promise.all([page.waitForEvent('download'), page.click('#exporter-json')]);
const chemin = await json.path(); assert.equal(JSON.parse(readFileSync(chemin, 'utf8')).format, 'compta-by-glsc-livre-1');
await page.click('#effacer'); assert.equal(await page.evaluate(() => localStorage.getItem('compta:livre:v1')), null); assert.match(await page.textContent('.vide'), /Aucune recette/); ok('« Tout effacer » : stockage et livre vidés');
await page.setInputFiles('#importer', chemin); await attendre(page, () => document.querySelectorAll('table.ecritures tbody tr').length >= 5); ok('import JSON');
await page.setInputFiles('#importer', { name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"format":"autre"}') });
await attendre(page, () => /ne vient pas de Compta/.test(document.getElementById('etat-stockage').textContent)); ok('mauvais fichier refusé');

// impression
await page.emulateMedia({ media: 'print' }); assert.equal(await page.locator('.colonne-livre').isVisible(), false); assert.equal(await page.locator('table.ecritures').isVisible(), true);
assert.equal((await page.pdf({ format: 'A4' })).subarray(0, 4).toString(), '%PDF'); ok('impression : formulaire masqué, livre imprimé en PDF'); await page.emulateMedia({ media: 'screen' });

const mob = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true }); const m = await mob.newPage();
await m.goto(base + '/outils/livre-des-recettes/'); await m.waitForSelector('#outil-livre:not([hidden])');
assert.ok(await m.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)); ok('mobile 360 px : aucun défilement horizontal'); await mob.close();
assert.deepEqual(externes, [], externes.join(', ')); assert.deepEqual(erreurs, [], erreurs.join(' | ')); ok('aucune requête externe, aucune erreur console (CSP de production)');
await browser.close(); close();
