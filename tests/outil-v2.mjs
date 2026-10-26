// Parcours des outils v2 : registre RGPD, mentions légales et confidentialité de site, comparateur de statuts.
import { launch, serve, ok } from './helpers.mjs';
import assert from 'node:assert/strict';

const { base, close } = await serve({ csp: true });
const browser = await launch();
const externes = [], erreurs = [];
const attendre = async (p, fn, delai = 5000) => { const fin = Date.now() + delai; while (Date.now() < fin) { if (await p.evaluate(fn)) return; await new Promise((r) => setTimeout(r, 50)); } throw new Error('Condition non remplie : ' + fn); };
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 }, acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await ctx.newPage();
page.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) externes.push(r.url()); });
page.on('pageerror', (e) => erreurs.push(e.message)); page.on('console', (m) => m.type() === 'error' && erreurs.push(m.text()));
page.on('dialog', (d) => d.accept());
const aucunStockage = () => page.evaluate(() => localStorage.length + sessionStorage.length + document.cookie.length);

// ---- Registre RGPD
await page.goto(base + '/outils/registre-rgpd/'); await page.waitForSelector('#outil-registre:not([hidden])');
assert.equal(await aucunStockage(), 0); ok('registre : aucun stockage au chargement');
await page.click('#imprimer', { force: true });
assert.match(await page.textContent('#bilan'), /à compléter/); ok('registre : impression bloquée tant que le registre est incomplet');
await page.fill('[name="org.nom"]', '<img src=x onerror="window.__xss=1"> Gabin'); await page.fill('[name="org.adresse"]', '1 rue Test, 35000 Rennes'); await page.fill('[name="org.email"]', 'pro@glsc.fr');
await page.selectOption('#modele-choix', 'facturation'); await page.click('#ajouter-traitement');
await page.selectOption('#modele-choix', 'contact'); await page.click('#ajouter-traitement');
assert.equal(await page.locator('fieldset.traitement').count(), 2);
assert.match(await page.textContent('#feuille-zone'), /Facturation/); assert.equal(await page.evaluate(() => window.__xss), undefined); assert.equal(await page.locator('#feuille-zone img').count(), 0); ok('registre : modèles ajoutés, HTML saisi reste du texte');
await page.click('#enregistrer'); assert.match(await page.textContent('#etat-stockage'), /Enregistré/);
assert.ok(await page.evaluate(() => localStorage.length) === 1); ok('registre : stockage seulement après action explicite');
await page.reload(); await page.waitForSelector('#outil-registre:not([hidden])');
assert.equal(await page.locator('fieldset.traitement').count(), 2); ok('registre : rechargé depuis le navigateur');
await page.click('#effacer'); assert.equal(await page.evaluate(() => localStorage.length), 0); assert.equal(await page.locator('fieldset.traitement').count(), 0); ok('registre : tout effacer');

// ---- Mentions légales et confidentialité
await page.goto(base + '/outils/mentions-legales-site/'); await page.waitForSelector('#outil-mentions:not([hidden])');
assert.equal(await aucunStockage(), 0);
await page.click('#copier-html', { force: true }); assert.match(await page.textContent('#bilan'), /à compléter/); ok('mentions : copie bloquée tant que le formulaire est incomplet');
const remplir = { 'editeur.nom': 'Gabin Lescoat', 'editeur.adresse': '1 rue Test, 35000 Rennes', 'editeur.email': 'pro@glsc.fr', 'editeur.tel': '+33 7 00 00 00 00', 'editeur.siren': '732829320', 'hebergeur.nom': 'IONOS SE', 'hebergeur.adresse': 'Montabaur, Allemagne', 'hebergeur.tel': '+49 0000', 'site.nom': '<script>x</script>', 'contact.duree': '3 ans après le dernier échange', 'logs.duree': '35 jours' };
for (const [n, v] of Object.entries(remplir)) await page.fill(`[name="${n}"]`, v);
assert.match(await page.textContent('#bilan'), /contiennent les éléments/);
const texte = await page.textContent('#textes-zone');
assert.match(texte, /entrepreneur individuel \(EI\)/); assert.match(texte, /732 829 320/); assert.match(texte, /Vos droits/); assert.equal(await page.locator('#textes-zone script').count(), 0); ok('mentions : textes composés, saisie échappée');
await page.click('#copier-html'); await attendre(page, () => /copié/.test(document.querySelector('#etat-copie').textContent));
const presse = await page.evaluate(() => navigator.clipboard.readText());
assert.match(presse, /<h1>Mentions légales de &lt;script&gt;x&lt;\/script&gt;<\/h1>/); assert.doesNotMatch(presse, /<script>/); ok('mentions : HTML copié, échappé');
await page.fill('[name="editeur.siren"]', '732829321'); assert.match(await page.textContent('#bilan'), /à compléter/); ok('mentions : SIREN invalide bloque');
assert.equal(await aucunStockage(), 0);

// ---- Comparateur
await page.goto(base + '/outils/comparateur-statuts/');
const tableau = await page.textContent('table'); assert.match(tableau, /Micro-entreprise/); assert.match(tableau, /EURL/); assert.match(tableau, /SASU/); assert.doesNotMatch(await page.content(), /\{\{/); ok('comparateur : trois statuts, aucun jeton restant');

assert.deepEqual(externes, [], 'requêtes externes : ' + externes.join(', ')); assert.deepEqual(erreurs, [], 'erreurs : ' + erreurs.join(' | '));
ok('aucune requête externe, aucune erreur de console');
await browser.close(); close();
