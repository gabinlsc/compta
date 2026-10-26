// Données réglementaires : lecture, validation (garde-fous) et jetons {{id}} utilisés dans les textes.
// Le fichier data/regles.schema.json décrit le format ; ce module applique en plus les règles métier (source officielle, fraîcheur).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const SOURCES_OFFICIELLES = ['urssaf.fr', 'autoentrepreneur.urssaf.fr', 'service-public.fr', 'service-public.gouv.fr', 'entreprendre.service-public.fr', 'entreprendre.service-public.gouv.fr', 'impots.gouv.fr', 'bofip.impots.gouv.fr', 'legifrance.gouv.fr', 'cnil.fr'];
export const MOIS_MAX = 6;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function chargerRegles(file = join(ROOT, 'data/regles.json')) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

export const aujourdhui = () => process.env.COMPTA_TODAY || new Date().toISOString().slice(0, 10);

const ajouterMois = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCMonth(d.getUTCMonth() + n); return d.toISOString().slice(0, 10); };

/** Renvoie { erreurs, perimees } : erreurs = format ou règle violée ; perimees = entrées vérifiées mais trop anciennes ou hors période. */
export function validerRegles(data, today = aujourdhui()) {
  const erreurs = [], perimees = [], ids = new Set();
  const derniere = new Map(); // série → plus grande date de fin
  for (const e of data.entrees ?? []) if (e.serie && (!derniere.has(e.serie) || e.valable_au > derniere.get(e.serie))) derniere.set(e.serie, e.valable_au);
  if (data.version !== 1 || !Array.isArray(data.entrees)) return { erreurs: ['format : version 1 et tableau « entrees » attendus'], perimees };
  for (const e of data.entrees) {
    const err = (m) => erreurs.push(`${e.id ?? '?'} : ${m}`);
    if (!/^[a-z][a-z0-9_]*$/.test(e.id ?? '')) err('identifiant invalide');
    if (ids.has(e.id)) err('identifiant en double'); ids.add(e.id);
    if (!['pourcent', 'euro', 'date', 'texte', 'jours', 'points', 'ans'].includes(e.unite)) err('unité inconnue');
    if (!['verifie', 'a_verifier'].includes(e.statut)) err('statut inconnu');
    for (const k of ['valable_du', 'valable_au']) if (!DATE.test(e[k] ?? '')) err(`${k} invalide`);
    if (DATE.test(e.valable_du ?? '') && DATE.test(e.valable_au ?? '') && e.valable_du > e.valable_au) err('valable_du postérieur à valable_au');
    if (e.statut === 'a_verifier') {
      if (e.valeur !== null) err('une entrée « a_verifier » ne doit pas avoir de valeur (rien n’est publié sans vérification)');
      continue;
    }
    if (e.valeur === null || e.valeur === undefined) err('valeur absente');
    if (['pourcent', 'euro', 'jours', 'points', 'ans'].includes(e.unite)) { if (typeof e.valeur !== 'number' || e.valeur < 0) err('nombre positif attendu'); }
    let host = '';
    try { host = new URL(e.source_url).hostname.replace(/^www\./, ''); } catch { err('source_url absente ou invalide'); }
    if (host && !SOURCES_OFFICIELLES.some((s) => host === s || host.endsWith('.' + s))) err(`source non officielle : ${host}`);
    if (!DATE.test(e.verifie_le ?? '')) err('verifie_le absent'); else {
      if (e.verifie_le > today) err('verifie_le dans le futur');
      if (ajouterMois(e.verifie_le, MOIS_MAX) < today) perimees.push(`${e.id} : vérifié le ${e.verifie_le}, plus de ${MOIS_MAX} mois`);
    }
    const archive = e.serie && e.valable_au < derniere.get(e.serie); // une entrée remplacée par une plus récente de sa série n'est plus à surveiller
    if (DATE.test(e.valable_au ?? '') && today > e.valable_au && !archive) perimees.push(`${e.id} : valable jusqu’au ${e.valable_au}, période terminée`);
    if (DATE.test(e.valable_du ?? '') && today < e.valable_du && !e.serie) err('pas encore en vigueur');
  }
  return { erreurs, perimees };
}

export const formaterValeur = (e) => {
  if (e.valeur === null) return 'en cours de vérification';
  if (e.unite === 'pourcent') return e.valeur.toLocaleString('fr-FR', { maximumFractionDigits: 2 }).replace(/ /g, ' ') + ' %';
  if (e.unite === 'jours') return `${e.valeur}\u00a0jours`;
  if (e.unite === 'ans') return `${e.valeur}\u00a0ans`;
  if (e.unite === 'points') return `${e.valeur}\u00a0points`;
  if (e.unite === 'euro') return e.valeur.toLocaleString('fr-FR', { maximumFractionDigits: 2 }).replace(/ /g, ' ') + ' €';
  return String(e.valeur);
};

/** Jetons {{id}} → valeur formatée, ou « en cours de vérification » (jamais un chiffre non vérifié). */
export function remplirJetons(texte, data) {
  const par = new Map(data.entrees.map((e) => [e.id, e]));
  return texte.replace(/\{\{(\w+)\}\}/g, (m, id) => { if (!par.has(id)) throw new Error(`Jeton inconnu : ${m}`); return formaterValeur(par.get(id)); });
}
