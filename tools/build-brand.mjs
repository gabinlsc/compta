// Génère l'image de partage (1200×630) et l'icône tactile (180×180) dans src/assets/, à relancer si la marque change.
//   node tools/build-brand.mjs   (puis node tools/build.mjs)
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import CFG from './site.config.json' with { type: 'json' };
import { ROOT } from './lib/regles.mjs';

const A = join(ROOT, 'src/assets');
const svg = readFileSync(join(A, 'favicon.svg'), 'utf8');
const font = (f) => `data:font/woff2;base64,${readFileSync(join(A, 'fonts', f)).toString('base64')}`;
const og = `<style>@font-face{font-family:I;font-weight:700;src:url(${font('inter-display-700.woff2')})}@font-face{font-family:J;font-weight:500;src:url(${font('inter-500.woff2')})}
body{margin:0;width:1200px;height:630px;background:#2447d6;color:#fff;display:flex;flex-direction:column;justify-content:center;padding:0 90px;box-sizing:border-box}
.m{width:120px;height:120px}.t{font:700 84px/1.05 I;margin:36px 0 18px}.s{font:500 38px/1.3 J;opacity:.92;max-width:900px}</style>
<div class="m">${svg.replace('fill="#2447D6"', 'fill="#fff"').replace(/stroke="#fff"/g, 'stroke="#2447D6"')}</div><div class="t">${CFG.nom}</div><div class="s">${CFG.slogan}. Sans compte, sans cookie.</div>`;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const shot = async (html, w, h, file) => { const p = await browser.newPage({ viewport: { width: w, height: h } }); await p.setContent(html); await p.evaluate(() => document.fonts.ready); writeFileSync(join(A, file), await p.screenshot()); await p.close(); };
await shot(og, 1200, 630, 'og.png');
await shot(`<body style="margin:0">${svg.replace('<svg ', '<svg width="180" height="180" ')}</body>`, 180, 180, 'apple-touch-icon.png');
await browser.close();
console.log('og.png et apple-touch-icon.png générés');
