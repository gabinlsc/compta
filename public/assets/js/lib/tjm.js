// Tarif journalier (TJM) et horaire : le chiffre d'affaires à réaliser pour obtenir le revenu net visé, après cotisations (et impôt libératoire), frais et jours non facturés.
// Taux de cotisations, Acre et plafonds viennent de data/regles.json. Les hypothèses de temps de travail (congés, jours non facturés…) sont saisies par l'utilisateur : ce ne sont pas des règles.
import { parseMontant } from './money.js?v=4fe9bb99';
import { ACTIVITES, simuler, formaterBp } from './simulateur.js?v=4fe9bb99';

const entier = (t, min, max) => (/^\d{1,3}$/.test(String(t ?? '').trim()) && Number(t) >= min && Number(t) <= max ? Number(t) : null);
const decimal = (t, min, max) => { const s = String(t ?? '').trim().replace(',', '.'); return /^\d+(\.\d{1,2})?$/.test(s) && Number(s) >= min && Number(s) <= max ? Number(s) : null; };
const bp = (p) => Math.round(p * 100);
const ceilDiv = (n, d) => (n + d - 1n) / d;

export const HYPOTHESES = { joursSemaine: '5', semainesConges: '5', joursFeries: '8', pourcentNonFacture: '30', heuresJour: '7', fraisMensuels: '0' };

/** e : { net (€ par mois), activite, acre, debutActivite, vl, fraisMensuels, joursSemaine, semainesConges, joursFeries, pourcentNonFacture, heuresJour } */
export function calculerTarif(e, regles, aujourdhui) {
  const erreurs = [];
  const act = ACTIVITES[e.activite];
  const net = parseMontant(e.net), frais = e.fraisMensuels.trim() === '' ? 0 : parseMontant(e.fraisMensuels);
  const js = entier(e.joursSemaine, 1, 7), sc = entier(e.semainesConges, 0, 52), jf = entier(e.joursFeries, 0, 30), nf = entier(e.pourcentNonFacture, 0, 95), hj = decimal(e.heuresJour, 1, 24);
  if (!act) erreurs.push({ champ: 'activite', message: 'Choisissez votre activité.' });
  if (net === null || net <= 0) erreurs.push({ champ: 'net', message: 'Indiquez le revenu net mensuel que vous visez, en euros (par exemple 2 000).' });
  if (frais === null || frais < 0) erreurs.push({ champ: 'fraisMensuels', message: 'Frais mensuels invalides : un montant en euros, ou vide.' });
  if (js === null) erreurs.push({ champ: 'joursSemaine', message: 'Jours travaillés par semaine : un nombre entre 1 et 7.' });
  if (sc === null) erreurs.push({ champ: 'semainesConges', message: 'Semaines de congés : un nombre entre 0 et 52.' });
  if (jf === null) erreurs.push({ champ: 'joursFeries', message: 'Jours fériés non travaillés : un nombre entre 0 et 30.' });
  if (nf === null) erreurs.push({ champ: 'pourcentNonFacture', message: 'Part de temps non facturé : un nombre entre 0 et 95.' });
  if (hj === null) erreurs.push({ champ: 'heuresJour', message: 'Heures par jour : un nombre entre 1 et 24.' });
  const joursDispo = js !== null && sc !== null && jf !== null ? js * (52 - sc) - jf : 0;
  if (js !== null && sc !== null && jf !== null && joursDispo <= 0) erreurs.push({ champ: 'semainesConges', message: 'Avec ces congés et jours fériés, il ne reste aucun jour travaillé.' });
  if (erreurs.length) return { erreurs, bloque: true };

  // Taux global prélevé sur le chiffre d'affaires : cotisations (réduites par l'Acre) et, avec le versement libératoire, impôt. On réutilise le simulateur pour garder une seule règle de calcul.
  const sonde = simuler({ ca: '1000', periode: 'annee', activite: e.activite, acre: e.acre, debutActivite: e.debutActivite, vl: e.vl, depenses: '' }, regles, aujourdhui);
  if (sonde.bloque) return { erreurs: sonde.erreurs, bloque: true };
  const tauxExactBp = sonde.tauxEffectifBp + (e.vl ? sonde.vlBp - sonde.tauxBp : 0);
  const netAnnuel = BigInt(net) * 12n, fraisAnnuels = BigInt(frais) * 12n;
  // CA × (1 − taux) = net + frais  →  CA = (net + frais) / (1 − taux) ; arrondi au centime supérieur pour ne jamais être en dessous de l'objectif
  const CA = ceilDiv((netAnnuel + fraisAnnuels) * 10000n, BigInt(10000 - tauxExactBp)), caCent = Number(CA);
  const joursFacturables = Math.max(1, Math.round(joursDispo * (100 - nf) / 100 * 100) / 100);
  const tjm = Math.ceil(caCent / 100 / joursFacturables);                  // € par jour facturé, arrondi à l'euro supérieur
  const heuresFacturables = joursFacturables * hj;
  const tauxHoraire = Math.ceil(caCent / 100 / heuresFacturables);
  // Vérification par le simulateur : avec ce chiffre d'affaires, que reste-t-il ?
  const controle = simuler({ ca: (caCent / 100).toFixed(2), periode: 'annee', activite: e.activite, acre: e.acre, debutActivite: e.debutActivite, vl: e.vl, depenses: ((Number(fraisAnnuels)) / 100).toFixed(2) }, regles, aujourdhui);
  return { erreurs, bloque: false, net, frais, joursDispo, joursFacturables, nf, hj, caAnnuel: caCent, tjm, tauxHoraire, tauxBp: tauxExactBp, controle, alertes: controle.alertes, act, exoBp: sonde.exoBp };
}
export { formaterBp };
