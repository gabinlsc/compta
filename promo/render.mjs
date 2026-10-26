// Rendu image par image : node promo/render.mjs <main|teaser> <fps> [t0 t1 pas|--frames t,t,t] — écrit promo/out/<plan>/%05d.jpg
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';

const [plan = 'main', fpsArg = '60', ...rest] = process.argv.slice(2);
const racine = resolve(new URL('..', import.meta.url).pathname);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };
const srv = createServer((q, r) => { const p = join(racine, decodeURIComponent(new URL(q.url, 'http://x').pathname)); try { r.setHeader('content-type', types[extname(p)] ?? 'application/octet-stream'); r.end(readFileSync(p)); } catch { r.statusCode = 404; r.end(); } });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const base = `http://127.0.0.1:${srv.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const mk = async () => { const c = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 }); const p = await c.newPage(); await p.goto(`${base}/promo/index.html?plan=${plan}`); await p.waitForFunction('window.ready === true'); return p; };
const probe = await mk(); const total = await probe.evaluate(() => window.TOTAL); const fps = Number(fpsArg);
let frames;
if (rest[0] === '--frames') frames = rest[1].split(',').map(Number).map((t) => [Math.round(t * fps), t]);
else frames = Array.from({ length: Math.round(total * fps) }, (_, i) => [i, i / fps]);
const dir = join(racine, 'promo/out', rest[0] === '--frames' ? `${plan}-preview` : plan);
if (existsSync(dir)) rmSync(dir, { recursive: true }); mkdirSync(dir, { recursive: true });
const N = rest[0] === '--frames' ? 1 : 4; const pages = [probe, ...(await Promise.all(Array.from({ length: N - 1 }, mk)))];
let fait = 0;
await Promise.all(pages.map(async (p, w) => {
  for (let i = w; i < frames.length; i += N) {
    const [n, t] = frames[i]; await p.evaluate((x) => window.seek(x), t);
    await p.screenshot({ path: join(dir, rest[0] === '--frames' ? `t${t.toFixed(2)}.png` : `${String(n).padStart(5, '0')}.jpg`), ...(rest[0] === '--frames' ? {} : { type: 'jpeg', quality: 96 }) });
    if (++fait % 200 === 0) console.log(`${fait}/${frames.length}`);
  }
}));
console.log(`${frames.length} images, ${total.toFixed(1)} s → ${dir}`);
await browser.close(); srv.close();
