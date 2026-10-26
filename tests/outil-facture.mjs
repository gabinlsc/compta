// Parcours complet de l'outil devis et factures : saisie, aperçu, impression bloquée puis permise, PDF, stockage explicite, export/import, sécurité.
import { launch, serve, ok } from './helpers.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const { base, close } = await serve({ csp: true });
// waitForFunction évalue du texte : la CSP de production l'interdit dans la page. On interroge donc la page avec evaluate().
const attendre = async (p, fn, delai = 5000) => { const fin = Date.now() + delai; while (Date.now() < fin) { if (await p.evaluate(fn)) return; await new Promise((r) => setTimeout(r, 50)); } throw new Error('Condition non remplie : ' + fn); };
const browser = await launch();
const externes = [], erreurs = [];
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
page.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) externes.push(r.url()); });
page.on('pageerror', (e) => erreurs.push(e.message));
page.on('console', (m) => m.type() === 'error' && erreurs.push(m.text()));
page.on('dialog', (d) => d.accept());

await page.goto(base + '/outils/facture-auto-entrepreneur/');
await page.waitForSelector('#outil-facture:not([hidden])');
assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length + document.cookie.length), 0); ok('au chargement : aucun cookie, aucun stockage');
assert.match(await page.inputValue('#f-numero'), /^F-\d{4}-001$/); ok('numéro proposé');
assert.equal(await page.getAttribute('#imprimer', 'aria-disabled'), 'true'); ok('impression bloquée tant que le document est incomplet');

// impression refusée : les erreurs apparaissent et le focus va sur le premier champ en erreur
await page.click('#imprimer', { force: true }); // aria-disabled : le bouton reste cliquable pour afficher les erreurs
assert.ok(await page.locator('#bilan li').count() >= 4); assert.equal(await page.evaluate(() => document.activeElement.name), 'emetteur.nom'); ok('tentative d’impression : erreurs listées, focus sur le premier champ');

// saisie d'une facture complète à un professionnel
const remplir = async (nom, v) => page.fill(`[name="${nom}"]`, v);
await remplir('emetteur.nom', 'Gabin Lescoat'); await remplir('emetteur.adresse', '1 rue Test'); await remplir('emetteur.cp', '35000'); await remplir('emetteur.ville', 'Rennes');
await remplir('emetteur.siren', '732 829 320'); await remplir('emetteur.iban', 'FR14 2004 1010 0505 0001 3M02 606'); await remplir('emetteur.bic', 'BNPAFRPP');
await remplir('client.nom', '<img src=x onerror="window.__xss=1">Boulangerie'); await remplir('client.adresse', '2 rue du Pain'); await remplir('client.cp', '56100'); await remplir('client.ville', 'Lorient'); await remplir('client.siren', '732829320');
await remplir('datePrestation', '2026-10-20');
await remplir('lignes.0.desc', 'Site vitrine'); await remplir('lignes.0.prix', '590');
await page.click('#ajouter-ligne'); await remplir('lignes.1.desc', 'Conseil'); await remplir('lignes.1.qty', '2,5'); await remplir('lignes.1.unite', 'h'); await remplir('lignes.1.prix', '75');
assert.equal((await page.textContent('#total-live')).replace(/\s/g, ' '), 'Total : 777,50 €'); ok('total en direct : 590 + 2,5 × 75 = 777,50 €');
await attendre(page, () => document.querySelector('#bilan .bilan-titre')?.classList.contains('ok')); ok('document complet : impression permise');
const feuille = await page.textContent('.feuille');
for (const t of ['FACTURE', 'Gabin Lescoat, Entrepreneur individuel (EI)', 'SIREN 732 829 320', 'art. L. 223 et s. du code des impositions sur les biens et services (CIBS)', 'Escompte pour paiement anticipé : néant', 'Indemnité forfaitaire pour frais de recouvrement en cas de retard de paiement : 40 €', 'Nature de l’opération : prestation de services', 'FR14 2004 1010 0505 0001 3M02 606']) assert.ok(feuille.replace(/[  ]/g, ' ').includes(t), 'manque : ' + t);
ok('mentions légales présentes dans l’aperçu');
assert.equal(await page.evaluate(() => window.__xss), undefined); assert.ok(feuille.includes('<img src=x onerror='), 'le texte saisi doit rester du texte'); assert.equal(await page.locator('.feuille img').count(), 0); ok('sécurité : le HTML saisi est affiché comme texte, jamais exécuté');

// type : devis, acompte, solde, avoir
await page.check('input[name="type"][value="devis"]');
assert.match(await page.inputValue('#f-numero'), /^D-\d{4}-001$/); assert.ok(await page.locator('.feuille-signature').isVisible()); assert.doesNotMatch(await page.textContent('.feuille-mentions'), /Pénalités|Indemnité/); ok('devis : numéro D-…, « Bon pour accord », pas de pénalités');
await page.check('input[name="type"][value="acompte"]'); await remplir('reference', 'D-2026-001'); await remplir('acomptePct', '30');
assert.match((await page.textContent('.feuille-total')).replace(/[  ]/g, ' '), /233,25 €/); ok('acompte de 30 % de 777,50 € = 233,25 €');
await page.check('input[name="type"][value="solde"]'); await remplir('acomptes.0.numero', 'F-2026-001'); await remplir('acomptes.0.montant', '233,25');
assert.match((await page.textContent('.feuille-total')).replace(/[  ]/g, ' '), /544,25 €/); ok('solde : 777,50 − 233,25 = 544,25 €');
await page.check('input[name="type"][value="avoir"]'); await remplir('reference', 'F-2026-001');
assert.match((await page.textContent('.feuille-total')).replace(/[  ]/g, ' '), /−777,50 €/); ok('avoir : total négatif');
await page.check('input[name="type"][value="facture"]');

// particulier : plus d'indemnité de 40 €
await page.check('input[name="client.type"][value="particulier"]');
assert.doesNotMatch(await page.textContent('.feuille-mentions'), /Indemnité forfaitaire/); await page.check('input[name="client.type"][value="pro"]'); ok('client particulier : pas d’indemnité de 40 €');

// délai > 60 jours entre professionnels
await page.click('#bloc-reglement > summary'); await remplir('reglement.delai', '90');
await attendre(page, () => document.querySelector('#bilan .bilan-titre')?.classList.contains('erreur')); await remplir('reglement.delai', '30'); ok('délai de paiement limité à 60 jours entre professionnels');

// impression : la feuille seule est imprimée (média print), PDF généré, fond blanc même en thème sombre
await page.click('#theme-toggle'); await page.click('#theme-toggle');
await page.emulateMedia({ media: 'print' });
assert.equal(await page.locator('.outil-form').isVisible(), false); assert.equal(await page.locator('.nav').isVisible(), false); assert.equal(await page.locator('.feuille').isVisible(), true); ok('média print : formulaire et navigation masqués, feuille visible');
const pdf = await page.pdf({ format: 'A4', printBackground: true });
assert.ok(pdf.length > 5000 && pdf.subarray(0, 4).toString() === '%PDF'); ok(`PDF généré (${Math.round(pdf.length / 1024)} Ko)`);
await page.emulateMedia({ media: 'screen' });

// stockage explicite
const ouvrirSauvegarde = () => page.click('summary:has-text("Enregistrer, exporter")');
await ouvrirSauvegarde();
await page.click('#enregistrer');
assert.ok(await page.evaluate(() => localStorage.getItem('compta:facture:v1')?.includes('Gabin Lescoat'))); assert.equal(await page.evaluate(() => document.cookie), ''); ok('« Enregistrer » : données dans localStorage uniquement après le clic');
await page.reload(); await page.waitForSelector('#outil-facture:not([hidden])');
assert.equal(await page.inputValue('[name="emetteur.nom"]'), 'Gabin Lescoat'); assert.equal(await page.locator('#liste-documents li').count(), 1); ok('rechargement : identité et document retrouvés');

// export / import
await ouvrirSauvegarde();
const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#exporter')]);
const chemin = await dl.path(); const json = JSON.parse(readFileSync(chemin, 'utf8')); assert.equal(json.format, 'compta-by-glsc-facture-1'); assert.equal(json.documents.length, 1); ok('export JSON');
await page.click('#effacer');
assert.equal(await page.evaluate(() => localStorage.getItem('compta:facture:v1')), null); assert.equal(await page.inputValue('[name="emetteur.nom"]'), ''); ok('« Tout effacer » : stockage vidé et formulaire remis à zéro');
await page.setInputFiles('#importer', chemin);
await attendre(page, () => document.querySelector('[name="emetteur.nom"]').value === 'Gabin Lescoat'); ok('import JSON');
await page.setInputFiles('#importer', { name: 'mauvais.json', mimeType: 'application/json', buffer: Buffer.from('{"format":"autre"}') });
await attendre(page, () => /ne vient pas de Compta/.test(document.getElementById('etat-stockage').textContent)); ok('import d’un mauvais fichier refusé avec un message clair');

// clavier : parcours sans souris jusqu'à l'impression
await page.goto(base + '/outils/facture-auto-entrepreneur/'); await page.waitForSelector('#outil-facture:not([hidden])');
await page.focus('[name="emetteur.nom"]'); for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
assert.ok(await page.evaluate(() => document.activeElement.matches('input,select,textarea,button,summary'))); ok('clavier : focus visible sur les champs');

// mobile 360 px
const mob = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true }); const m = await mob.newPage();
await m.goto(base + '/outils/facture-auto-entrepreneur/'); await m.waitForSelector('#outil-facture:not([hidden])');
assert.ok(await m.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)); ok('mobile 360 px : aucun défilement horizontal'); await mob.close();

assert.deepEqual(externes, [], 'requêtes externes : ' + externes.join(', ')); assert.deepEqual(erreurs, [], erreurs.join(' | ')); ok('aucune requête externe, aucune erreur console (CSP de production)');
await browser.close(); close();
