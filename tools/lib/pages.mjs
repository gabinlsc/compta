// Parcours des pages HTML générées (public/), partagé par les contrôles.
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './regles.mjs';

export const PUBLIC = join(ROOT, 'public');
export function pagesHtml(dir = PUBLIC) {
  const out = [];
  for (const f of readdirSync(dir)) { const p = join(dir, f); if (statSync(p).isDirectory()) out.push(...pagesHtml(p)); else if (f.endsWith('.html')) out.push(p); }
  return out;
}
