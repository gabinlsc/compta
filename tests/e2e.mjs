// Parcours de base : navigation, thème, recherche, mobile 360 px, mouvement réduit, aucune requête externe, aucun stockage.
import { launch, serve, ok } from './helpers.mjs';
import assert from 'node:assert/strict';

const { base, close, requetes } = await serve({ csp: true });
const browser = await launch();
const externes = [];
const surveiller = (page) => page.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:')) externes.push(r.url()); });

// Bureau : navigation, thème, recherche
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage(); surveiller(page);
const erreurs = []; page.on('pageerror', (e) => erreurs.push(e.message)); page.on('console', (m) => m.type() === 'error' && !/404 \(Not Found\)/.test(m.text()) && erreurs.push(m.text()));
await page.goto(base + '/');
assert.match(await page.title(), /Compta by glsc/); ok('accueil chargé');
await page.click('.menu a[href="/outils/"]');
await page.waitForURL('**/outils/'); assert.equal(await page.locator('h1').innerText(), 'Outils pour micro-entrepreneur'); ok('navigation vers les outils');
const avant = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
await page.click('#theme-toggle');
assert.notEqual(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), avant); ok('bascule de thème');
await page.fill('#q', 'échéances'); await page.press('#q', 'Enter');
await page.waitForURL('**/recherche/?q=*'); await page.waitForSelector('#resultats li');
assert.ok((await page.locator('#resultats li').count()) >= 1); ok('recherche locale (accents ignorés)');
await page.goto(base + '/recherche/?q=zzzintrouvable'); await page.waitForFunction(() => /Aucun résultat/.test(document.getElementById('resultats-etat').textContent)); ok('recherche sans résultat');
await page.goto(base + '/page-qui-nexiste-pas'); assert.match(await page.locator('h1').innerText(), /introuvable/i); ok('404 utile');
await page.goto(base + '/sources/'); assert.ok((await page.locator('tbody tr').count()) >= 10); ok('page Sources : tableau des données');
// Clavier : le lien d'évitement est atteignable en premier
await page.goto(base + '/'); await page.keyboard.press('Tab'); assert.equal(await page.evaluate(() => document.activeElement.className), 'skip'); ok('clavier : lien « Aller au contenu » en premier');
assert.equal(await page.evaluate(() => document.cookie), ''); assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0); ok('aucun cookie, aucun stockage local');
await ctx.close();

// Mobile 360 px : pas de défilement horizontal
const mob = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true });
const m = await mob.newPage(); surveiller(m);
for (const p of ['/', '/outils/', '/sources/', '/confidentialite/']) {
  await m.goto(base + p);
  assert.ok(await m.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `défilement horizontal sur ${p}`);
}
ok('mobile 360 px : aucun défilement horizontal'); await mob.close();

// Mouvement réduit
const rm = await browser.newContext({ reducedMotion: 'reduce' }); const r = await rm.newPage(); await r.goto(base + '/');
assert.equal(await r.evaluate(() => getComputedStyle(document.querySelector('.btn')).transitionDuration), '0s'); ok('mouvement réduit respecté'); await rm.close();

assert.deepEqual(erreurs, [], erreurs.join(' | '));
assert.deepEqual(externes, [], 'requêtes externes : ' + externes.join(', ')); ok('aucune requête externe, aucune erreur console');
await browser.close(); close();
