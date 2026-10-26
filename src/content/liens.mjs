// Maillage interne : à chaque page d'outil ou de guide, les pages liées (outils et guides) en bas de page.
import { esc } from '../../tools/lib/layout.mjs';
import { OUTILS } from './outils.mjs';
import { GUIDES } from './guides.mjs';
import { bulleDe, svg } from './icones.mjs';
import { COURT } from './courts.mjs';

const o = (slug) => `/outils/${slug}/`, g = (slug) => `/guides/${slug}/`;
export const LIENS = {
  [o('facture-auto-entrepreneur')]: [g('mentions-obligatoires-facture'), g('checklist-premiere-facture'), g('facturation-electronique'), o('livre-des-recettes')],
  [o('simulateur-revenu-net')]: [g('plafonds-et-seuils-de-tva'), g('declarer-son-chiffre-d-affaires'), g('creer-sa-micro-entreprise'), o('tarif-journalier')],
  [o('calendrier-echeances')]: [g('declarer-son-chiffre-d-affaires'), g('cfe-qui-la-paie'), g('facturation-electronique'), o('livre-des-recettes')],
  [o('tarif-journalier')]: [g('plafonds-et-seuils-de-tva'), g('creer-sa-micro-entreprise'), o('simulateur-revenu-net'), o('facture-auto-entrepreneur')],
  [o('livre-des-recettes')]: [g('livre-des-recettes-a-quoi-ca-sert'), g('declarer-son-chiffre-d-affaires'), o('calendrier-echeances'), o('simulateur-revenu-net')],
  [g('creer-sa-micro-entreprise')]: [g('checklist-premiere-facture'), g('declarer-son-chiffre-d-affaires'), g('cfe-qui-la-paie'), o('simulateur-revenu-net')],
  [g('mentions-obligatoires-facture')]: [g('checklist-premiere-facture'), g('facturation-electronique'), o('facture-auto-entrepreneur'), g('creer-sa-micro-entreprise')],
  [g('checklist-premiere-facture')]: [g('mentions-obligatoires-facture'), g('livre-des-recettes-a-quoi-ca-sert'), o('facture-auto-entrepreneur'), g('declarer-son-chiffre-d-affaires')],
  [g('facturation-electronique')]: [g('mentions-obligatoires-facture'), o('facture-auto-entrepreneur'), o('calendrier-echeances'), g('checklist-premiere-facture')],
  [g('declarer-son-chiffre-d-affaires')]: [o('calendrier-echeances'), o('livre-des-recettes'), g('plafonds-et-seuils-de-tva'), g('cfe-qui-la-paie')],
  [g('plafonds-et-seuils-de-tva')]: [o('simulateur-revenu-net'), g('declarer-son-chiffre-d-affaires'), o('livre-des-recettes'), g('creer-sa-micro-entreprise')],
  [g('livre-des-recettes-a-quoi-ca-sert')]: [o('livre-des-recettes'), g('declarer-son-chiffre-d-affaires'), g('checklist-premiere-facture'), g('plafonds-et-seuils-de-tva')],
  [g('cfe-qui-la-paie')]: [o('calendrier-echeances'), g('creer-sa-micro-entreprise'), g('declarer-son-chiffre-d-affaires'), o('simulateur-revenu-net')],
  [o('registre-rgpd')]: [o('mentions-legales-site'), g('creer-sa-micro-entreprise'), g('checklist-premiere-facture'), o('comparateur-statuts')],
  [o('mentions-legales-site')]: [o('registre-rgpd'), g('creer-sa-micro-entreprise'), g('mentions-obligatoires-facture'), o('comparateur-statuts')],
  [o('comparateur-statuts')]: [g('creer-sa-micro-entreprise'), o('simulateur-revenu-net'), g('plafonds-et-seuils-de-tva'), o('registre-rgpd')],
};

const trouver = (chemin) => {
  const slug = chemin.split('/').filter(Boolean).at(-1);
  const x = (chemin.startsWith('/outils/') ? OUTILS : GUIDES).find((e) => e.slug === slug);
  return x && x.pret ? { chemin, type: chemin.startsWith('/outils/') ? 'Outil' : 'Guide', titre: x.titre, resume: x.resume } : null;
};

/** HTML du bloc « Pour aller plus loin » d'une page, ou chaîne vide. Tout est écrit à la génération (aucune donnée saisie). */
export function blocLiens(chemin) {
  const items = (LIENS[chemin] ?? []).map(trouver).filter(Boolean);
  if (!items.length) return '';
  return `<aside class="liens" aria-labelledby="titre-liens"><h2 id="titre-liens">${svg('arrow', 'ico ico-h2')} Pour aller plus loin</h2><div class="grid">${items.map((i) => `<article class="card"><a class="card-lien" href="${i.chemin}">${bulleDe(i.chemin.split('/').filter(Boolean).at(-1))}<span class="card-k">${i.type}</span><span class="card-t">${esc(i.titre)}</span>${COURT[i.chemin.split('/').filter(Boolean).at(-1)] ? `<span class="card-d">${esc(COURT[i.chemin.split('/').filter(Boolean).at(-1)])}</span>` : ''}<span class="card-go" aria-hidden="true">→</span></a></article>`).join('')}</div></aside>`;
}
