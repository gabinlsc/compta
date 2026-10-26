// Charge chaque page avec la CSP de production, en clair et en sombre : aucune violation, aucune erreur de script.
import { launch, serve, PAGES, ok } from './helpers.mjs';
import assert from 'node:assert/strict';

const { base, close } = await serve({ csp: true });
const browser = await launch();
let total = 0;
for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext({ colorScheme: theme });
  for (const path of PAGES) {
    const page = await ctx.newPage();
    const issues = [];
    page.on('console', (m) => { if (m.type() === 'error') issues.push(m.text()); });
    page.on('pageerror', (e) => issues.push(e.message));
    await page.addInitScript(() => document.addEventListener('securitypolicyviolation', (e) => console.error('CSP ' + e.violatedDirective + ' ' + e.blockedURI)));
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.click('#theme-toggle');
    assert.deepEqual(issues.filter((i) => !/404 \(Not Found\)/.test(i) || path !== '/introuvable-test'), [], `${path} (${theme}) : ${issues.join(' | ')}`);
    await page.close(); total++;
  }
  await ctx.close();
}
ok(`CSP de production : ${total} chargements sans violation ni erreur`);
await browser.close(); close();
