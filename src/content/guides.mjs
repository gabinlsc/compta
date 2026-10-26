import { GUIDE_MENTIONS } from './guide-mentions.mjs';
import { GUIDE_PLAFONDS } from './guide-plafonds.mjs';
import { GUIDE_DECLARER } from './guide-declarer.mjs';

// Guides du site (même convention que outils.mjs). Un guide prêt vient de son propre fichier (src/content/guide-*.mjs).
export const GUIDES = [
  { slug: 'creer-sa-micro-entreprise', titre: 'Créer sa micro-entreprise pas à pas', resume: 'Les démarches, dans l’ordre, pour se lancer en toute sérénité.', pret: false },
  { ...GUIDE_MENTIONS, pret: true },
  { slug: 'facturation-electronique', titre: 'Facturation électronique : ce qui change', resume: 'Le calendrier et ce que cela implique pour un micro-entrepreneur.', pret: false },
  { ...GUIDE_DECLARER, pret: true },
  { ...GUIDE_PLAFONDS, pret: true },
  { slug: 'livre-des-recettes-a-quoi-ca-sert', titre: 'Le livre des recettes : à quoi ça sert', resume: 'Une obligation simple à comprendre et à tenir.', pret: false },
  { slug: 'cfe-qui-la-paie', titre: 'CFE : qui la paie ?', resume: 'La cotisation foncière des entreprises, exonérations comprises.', pret: false },
  { slug: 'checklist-premiere-facture', titre: 'Checklist avant votre première facture', resume: 'Dix vérifications avant d’envoyer votre première facture.', pret: false },
];
