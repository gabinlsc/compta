// Outils communs aux tests : serveur statique de public/ qui applique les en-têtes de production (lus dans deploy/compta-security.conf) et lancement de Chromium.
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const PUBLIC = join(ROOT, 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain', '.ics': 'text/calendar' };

// La politique CSP de production : première ligne « add_header Content-Security-Policy » du fichier nginx.
export const CSP = /add_header Content-Security-Policy "([^"]+)"/.exec(readFileSync(join(ROOT, 'deploy/compta-security.conf'), 'utf8'))[1];

export function serve({ csp = true } = {}) {
  const requetes = [];
  const server = createServer((req, res) => {
    requetes.push(req.url);
    const url = decodeURIComponent(req.url.split('?')[0]);
    let file = join(PUBLIC, url);
    if (!file.startsWith(PUBLIC)) { res.statusCode = 403; return res.end(); }
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    let status = 200;
    if (!existsSync(file)) { file = join(PUBLIC, '404.html'); status = 404; }
    res.statusCode = status;
    res.setHeader('content-type', TYPES[extname(file)] || 'application/octet-stream');
    if (csp && file.endsWith('.html')) res.setHeader('content-security-policy', CSP);
    res.end(readFileSync(file));
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, requetes, base: `http://127.0.0.1:${server.address().port}`, close: () => server.close() })));
}

export const launch = () => chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
export const PAGES = ['/', '/outils/', '/outils/facture-auto-entrepreneur/', '/outils/simulateur-revenu-net/', '/outils/calendrier-echeances/', '/guides/', '/guides/mentions-obligatoires-facture/', '/guides/plafonds-et-seuils-de-tva/', '/guides/declarer-son-chiffre-d-affaires/', '/sources/', '/recherche/?q=facture', '/a-propos/', '/contact/', '/mentions-legales/', '/confidentialite/', '/cgu/', '/introuvable-test'];
export const ok = (m) => console.log('✓', m);
