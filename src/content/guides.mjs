import { GUIDE_MENTIONS } from './guide-mentions.mjs';

// Guides du site (même convention que outils.mjs). Un guide prêt vient de son propre fichier (src/content/guide-*.mjs).
export const GUIDES = [
  { slug: 'creer-sa-micro-entreprise', titre: 'Créer sa micro-entreprise pas à pas', resume: 'Les démarches, dans l’ordre, pour se lancer en toute sérénité.', pret: false },
  { ...GUIDE_MENTIONS, pret: true },
  { slug: 'facturation-electronique', titre: 'Facturation électronique : ce qui change', resume: 'Le calendrier et ce que cela implique pour un micro-entrepreneur.', pret: false },
  { slug: 'declarer-son-chiffre-d-affaires', titre: 'Déclarer son chiffre d’affaires', resume: 'Mensuel ou trimestriel : dates, démarches et erreurs à éviter.', pret: false },
  { slug: 'plafonds-et-seuils-de-tva', titre: 'Plafonds et seuils de TVA', resume: 'Jusqu’où rester en micro-entreprise et en franchise de TVA.', pret: false },
  { slug: 'livre-des-recettes-a-quoi-ca-sert', titre: 'Le livre des recettes : à quoi ça sert', resume: 'Une obligation simple à comprendre et à tenir.', pret: false },
  { slug: 'cfe-qui-la-paie', titre: 'CFE : qui la paie ?', resume: 'La cotisation foncière des entreprises, exonérations comprises.', pret: false },
  { slug: 'checklist-premiere-facture', titre: 'Checklist avant votre première facture', resume: 'Dix vérifications avant d’envoyer votre première facture.', pret: false },
];
