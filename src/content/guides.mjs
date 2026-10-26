import { GUIDE_MENTIONS } from './guide-mentions.mjs';
import { GUIDE_PLAFONDS } from './guide-plafonds.mjs';
import { GUIDE_DECLARER } from './guide-declarer.mjs';
import { GUIDE_LIVRE } from './guide-livre.mjs';
import { GUIDE_FE } from './guide-facturation-electronique.mjs';
import { GUIDE_CFE } from './guide-cfe.mjs';
import { GUIDE_CHECKLIST } from './guide-checklist.mjs';
import { GUIDE_CREER } from './guide-creer.mjs';

// Guides du site (même convention que outils.mjs). Un guide prêt vient de son propre fichier (src/content/guide-*.mjs).
export const GUIDES = [
  { ...GUIDE_CREER, pret: true },
  { ...GUIDE_MENTIONS, pret: true },
  { ...GUIDE_FE, pret: true },
  { ...GUIDE_DECLARER, pret: true },
  { ...GUIDE_PLAFONDS, pret: true },
  { ...GUIDE_LIVRE, pret: true },
  { ...GUIDE_CFE, pret: true },
  { ...GUIDE_CHECKLIST, pret: true },
];
