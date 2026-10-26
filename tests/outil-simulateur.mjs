// Parcours de l'outil « combien me reste-t-il ? » : saisie, activités, Acre, versement libératoire, alertes, graphique accessible, aucun stockage.
import { launch, serve, ok } from './helpers.mjs';
import assert from 'node:assert/strict';

const { base, close } = await serve({ csp: true });
const browser = await launch();
const externes = [], erreurs = [];
const attendre = async (p, fn, delai = 5000) => { const fin = Date.now() + delai; while (Date.now() < fin) { if (await p.evaluate(fn)) return; await new Promise((r) => setTimeout(r, 50)); } throw new Error('Condition non remplie : ' + fn); };
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:')) externes.push(r.url()); });
page.on('pageerror', (e) => erreurs.push(e.message)); page.on('console', (m) => m.type() === 'error' && erreurs.push(m.text()));
const norm = (t) => t.replace(/[  ]/g, ' ');

await page.goto(base + '/outils/simulateur-revenu-net/');
await page.waitForSelector('#outil-simulateur:not([hidden])');
assert.match(await page.textContent('.vide'), /Saisissez votre chiffre d’affaires/); ok('au chargement : invitation à saisir, aucune erreur affichée');
assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length + document.cookie.length), 0);

await page.fill('[name="ca"]', '10000'); await page.selectOption('[name="periode"]', 'annee'); await page.selectOption('[name="activite"]', 'bic_services');
assert.match(norm(await page.textContent('.carte-net .grand')), /7\s?880,00 €/); ok('10 000 € en prestations BIC : 21,2 % de cotisations, il reste 7 880 €');
assert.match(norm(await page.textContent('.resume')), /2\s?120,00 €/);
await page.check('[name="vl"]'); assert.match(norm(await page.textContent('.carte-net .grand')), /7\s?710,00 €/); ok('versement libératoire : taux global 22,9 % → 7 710 €');
await page.uncheck('[name="vl"]');
await page.check('[name="acre"]'); await page.fill('[name="debutActivite"]', '2026-09-03');
assert.match(norm(await page.textContent('.carte-net .grand')), /8\s?410,00 €/); assert.match(await page.textContent('.note-acre'), /30 juin 2027/); ok('Acre : 15,9 % au lieu de 21,2 %, fin au 30 juin 2027 (exemple officiel)');
await page.fill('[name="debutActivite"]', '2026-03-01'); await page.focus('[name="ca"]'); await page.focus('[name="debutActivite"]'); await page.focus('[name="ca"]');
assert.match(await page.textContent('#bilan'), /à partir du 1 juillet 2026|1er juillet 2026/); ok('Acre d’une création antérieure : message clair, pas de calcul');
await page.uncheck('[name="acre"]');

await page.fill('[name="ca"]', '4000'); await page.selectOption('[name="periode"]', 'mois');
assert.match(await page.textContent('.alertes'), /Seuil majoré de franchise de TVA dépassé/); assert.match(norm(await page.textContent('.alertes')), /48 000/); ok('4 000 € par mois : alerte TVA sur l’estimation annuelle (48 000 €)');
await page.fill('[name="ca"]', '90000'); await page.selectOption('[name="periode"]', 'annee');
assert.match(await page.textContent('.alerte.danger'), /Plafond de chiffre d’affaires dépassé/); ok('90 000 € par an : plafond dépassé');

// graphique accessible et équivalent texte
await page.fill('[name="ca"]', '3000'); await page.fill('[name="depenses"]', '200'); await page.check('[name="vl"]');
const svgLabel = await page.getAttribute('svg.barre', 'aria-labelledby'); assert.equal(svgLabel, 'graph-titre graph-desc');
assert.match(norm(await page.textContent('#graph-desc')), /Cotisations sociales : 636,00 €/); assert.ok((await page.locator('.legende li').count()) === 4); ok('graphique SVG : titre, description et légende textuelle');
assert.match(await page.textContent('.explication'), /Voici comment on calcule/); assert.ok((await page.locator('.explication li').count()) >= 5); ok('explication pas à pas');

// saisie invalide
await page.fill('[name="ca"]', 'abc'); await page.focus('[name="depenses"]');
assert.match(await page.textContent('#bilan'), /chiffre d’affaires en euros/); assert.equal(await page.getAttribute('[name="ca"]', 'aria-invalid'), 'true'); ok('saisie invalide : erreur claire, champ marqué');
assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length + document.cookie.length), 0); ok('aucun cookie, aucun stockage');

// mobile
const mob = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true }); const m = await mob.newPage();
await m.goto(base + '/outils/simulateur-revenu-net/'); await m.waitForSelector('#outil-simulateur:not([hidden])'); await m.fill('[name="ca"]', '2500');
assert.ok(await m.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)); ok('mobile 360 px : aucun défilement horizontal'); await mob.close();

assert.deepEqual(externes, [], externes.join(', ')); assert.deepEqual(erreurs, [], erreurs.join(' | ')); ok('aucune requête externe, aucune erreur console (CSP de production)');
await browser.close(); close();
