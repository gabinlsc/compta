// Parcours de l'outil TJM : valeurs de départ, calcul, effets des hypothèses, plafond, saisie invalide, aucun stockage ni requête externe.
import { launch, serve, ok } from './helpers.mjs';
import assert from 'node:assert/strict';

const { base, close } = await serve({ csp: true });
const browser = await launch();
const externes = [], erreurs = [];
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:')) externes.push(r.url()); });
page.on('pageerror', (e) => erreurs.push(e.message)); page.on('console', (m) => m.type() === 'error' && erreurs.push(m.text()));
const norm = (t) => t.replace(/[  ]/g, ' ');
const tjm = async () => Number(norm(await page.textContent('.carte-net .grand')).replace(/[^\d]/g, ''));

await page.goto(base + '/outils/tarif-journalier/'); await page.waitForSelector('#outil-tjm:not([hidden])');
assert.match(await page.textContent('.vide'), /Indiquez le revenu net mensuel/); assert.equal(await page.inputValue('[name="semainesConges"]'), '5'); ok('au chargement : invitation et hypothèses de départ visibles');
await page.fill('[name="net"]', '2000');
const base0 = await tjm(); assert.ok(base0 >= 190 && base0 <= 200, `TJM ${base0}`); ok(`2 000 € net par mois en prestations BIC : tarif journalier de ${base0} €`);
assert.match(norm(await page.textContent('.resume')), /30 456,86 €/); assert.match(norm(await page.textContent('.resume')), /21,2 %/); ok('chiffre d’affaires nécessaire 30 456,86 € (24 000 € ÷ (1 − 21,2 %), arrondi au centime supérieur)');
await page.fill('[name="pourcentNonFacture"]', '50'); assert.ok((await tjm()) > base0); ok('plus de temps non facturé : tarif plus élevé');
await page.fill('[name="pourcentNonFacture"]', '30'); await page.check('[name="acre"]'); assert.ok((await tjm()) < base0); await page.uncheck('[name="acre"]'); ok('Acre : tarif plus bas');
await page.fill('[name="net"]', '6000'); assert.match(await page.textContent('.alerte.danger'), /Plafond/); ok('objectif élevé : alerte de dépassement du plafond');
assert.match(await page.textContent('.explication'), /Contrôle : avec ce chiffre d’affaires/); ok('explication pas à pas avec contrôle');
await page.fill('[name="net"]', '2000'); await page.fill('[name="joursSemaine"]', '0'); await page.focus('[name="net"]'); await page.focus('[name="joursSemaine"]'); await page.focus('[name="net"]');
assert.match(await page.textContent('#bilan'), /Jours travaillés par semaine/); assert.equal(await page.getAttribute('[name="joursSemaine"]', 'aria-invalid'), 'true'); ok('saisie invalide : message clair, champ marqué');
assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length + document.cookie.length), 0); ok('aucun cookie, aucun stockage');
const mob = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true }); const m = await mob.newPage();
await m.goto(base + '/outils/tarif-journalier/'); await m.waitForSelector('#outil-tjm:not([hidden])'); await m.fill('[name="net"]', '2500');
assert.ok(await m.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)); ok('mobile 360 px : aucun défilement horizontal'); await mob.close();
assert.deepEqual(externes, [], externes.join(', ')); assert.deepEqual(erreurs, [], erreurs.join(' | ')); ok('aucune requête externe, aucune erreur console (CSP de production)');
await browser.close(); close();
