// Parcours de l'outil calendrier : génération dans le navigateur, téléchargement d'un .ics valide, abonnement, aucun stockage ni requête externe.
import { launch, serve, ok } from './helpers.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ICAL from 'ical.js';

const { base, close } = await serve({ csp: true });
const browser = await launch();
const externes = [], erreurs = [];
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
page.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) externes.push(r.url()); });
page.on('pageerror', (e) => erreurs.push(e.message)); page.on('console', (m) => m.type() === 'error' && erreurs.push(m.text()));
await page.goto(base + '/outils/calendrier-echeances/'); await page.waitForSelector('#outil-calendrier:not([hidden])');
assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length + document.cookie.length), 0);
assert.ok((await page.locator('.echeance').count()) >= 10); ok('échéances affichées dès l’ouverture (déclaration mensuelle, CFE, facturation électronique)');

// valeurs connues : début d'activité le 6 mars 2026 en déclaration mensuelle → première déclaration le 31 juillet 2026 (exemple officiel)
await page.fill('[name="depuis"]', '2026-01-01'); await page.fill('[name="debutActivite"]', '2026-03-06');
assert.match(await page.textContent('.echeance'), /Rappel|Première|Déclarer|Facturation|Déclaration/);
const premier = await page.locator('#liste-echeances .echeance').filter({ hasText: 'Première déclaration' }).first();
assert.match((await premier.textContent()).replace(/\s+/g, ' '), /31 juillet 2026/); ok('première déclaration : début le 6 mars 2026 → 31 juillet 2026 (exemple officiel)');
await page.check('input[name="periodicite"][value="trimestre"]'); await page.fill('[name="debutActivite"]', '2026-04-12');
assert.match((await page.locator('#liste-echeances .echeance').filter({ hasText: 'Première déclaration' }).first().textContent()).replace(/\s+/g, ' '), /31 octobre 2026/); ok('trimestriel : début le 12 avril 2026 → 31 octobre 2026 (exemple officiel)');
await page.fill('[name="debutActivite"]', ''); await page.fill('[name="depuis"]', '2026-11-01');
const dates = await page.locator('#liste-echeances time').evaluateAll((els) => els.map((e) => e.getAttribute('datetime')));
assert.deepEqual(dates.slice(0, 3), ['2026-12-15', '2027-01-31', '2027-04-30']); ok('trimestriel depuis le 1er novembre 2026 : CFE le 15 décembre, puis 31 janvier, 30 avril');
await page.selectOption('[name="duree"]', '24'); assert.match(await page.textContent('#note-validite'), /jusqu’au 31 décembre 2027/); ok('période tronquée à la validité des données, avec explication');

// téléchargement
await page.check('[name="ir"]'); await page.check('[name="rappel0"]');
const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#telecharger')]);
assert.match(dl.suggestedFilename(), /^echeances-compta-\d{4}-\d{2}-\d{2}\.ics$/);
const texte = readFileSync(await dl.path(), 'utf8');
const cal = new ICAL.Component(ICAL.parse(texte)); const evs = cal.getAllSubcomponents('vevent');
assert.ok(evs.length >= 8); assert.ok(texte.includes('\r\n') && !/[^\r]\n/.test(texte)); assert.equal(evs[0].getAllSubcomponents('valarm').length, 3);
assert.equal(cal.getFirstSubcomponent('vtimezone').getFirstPropertyValue('tzid'), 'Europe/Paris'); ok(`fichier .ics téléchargé et relu par un parseur indépendant (${evs.length} événements, 3 rappels chacun)`);

// abonnement
assert.equal(await page.locator('table.flux tbody tr').count(), 8); assert.match(await page.getAttribute('table.flux a[href^="webcal://"]', 'href'), /^webcal:\/\/.+\/ics\/echeances-mensuel\.ics$/); ok('8 calendriers d’abonnement proposés (webcal et téléchargement)');
const flux = await page.request.get(base + '/ics/echeances-mensuel.ics'); assert.equal(flux.status(), 200); assert.match(await flux.text(), /^BEGIN:VCALENDAR/); ok('flux statique servi');
await page.evaluate(() => { navigator.clipboard.writeText = async () => {}; }); await page.click('button.copier >> nth=0'); assert.match(await page.textContent('#etat-copie'), /Lien copié/);

const mob = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true }); const m = await mob.newPage();
await m.goto(base + '/outils/calendrier-echeances/'); await m.waitForSelector('#outil-calendrier:not([hidden])');
assert.ok(await m.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)); ok('mobile 360 px : aucun défilement horizontal'); await mob.close();
assert.deepEqual(externes, [], externes.join(', ')); assert.deepEqual(erreurs, [], erreurs.join(' | ')); ok('aucune requête externe, aucune erreur console (CSP de production)');
await browser.close(); close();
