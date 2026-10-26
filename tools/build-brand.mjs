// Génère l'image de partage (1200×630) dans src/assets/ à partir du monogramme du kit de marque StudioGLSC, à relancer si le nom ou le slogan change.
//   node tools/build-brand.mjs   (puis node tools/build.mjs)
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import CFG from './site.config.json' with { type: 'json' };
import { ROOT } from './lib/regles.mjs';

const A = join(ROOT, 'src/assets');
const mono = readFileSync(join(A, 'favicon.svg'), 'utf8').replace(/ width="64" height="64"/, ' width="144" height="144"'); // monogramme du kit de marque, tel quel
const font = (f) => `data:font/woff2;base64,${readFileSync(join(A, 'fonts', f)).toString('base64')}`;
// Image de partage 1200×630 : monogramme sur fond clair (Inter Display 700 pour le titre, Inter 500 pour le texte), comme le kit de marque.
const og = `<style>@font-face{font-family:D;font-weight:700;src:url(${font('inter-display-700.woff2')})}@font-face{font-family:T;font-weight:500;src:url(${font('inter-500.woff2')})}
body{margin:0;width:1200px;height:630px;background:#f6f7f9;color:#0b1220;display:flex;flex-direction:column;justify-content:center;padding:0 96px;box-sizing:border-box}
.t{font:700 88px/1.05 D;margin:44px 0 20px;letter-spacing:-.02em}.s{font:500 38px/1.35 T;color:#566074;max-width:900px}.b{position:absolute;left:0;right:0;bottom:0;height:14px;background:#2447d6}</style>
${mono}<div class="t">${CFG.nom}</div><div class="s">${CFG.slogan}. Sans compte, sans cookie.</div><div class="b"></div>`;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const p = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(og); await p.evaluate(() => document.fonts.ready);
writeFileSync(join(A, 'og.png'), await p.screenshot());
await browser.close();
console.log('og.png généré (l\'icône tactile est le monogramme 180 px du kit de marque)');
