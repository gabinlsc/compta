// Calendriers d'échéances pré-générés (abonnement depuis Google Agenda, Apple Calendrier, Outlook). Un fichier par combinaison, écrits dans public/ics/.
import CFG from '../../tools/site.config.json' with { type: 'json' };
import { creerRegles } from '../assets/js/lib/facture.js';
import { genererEcheances } from '../assets/js/lib/echeances.js';
import { construireIcs } from '../assets/js/lib/ics.js';

export const FIN_FLUX = '2027-12-31'; // les données réglementaires sont valables jusqu'à cette date (voir data/regles.json)
export const FLUX = [];
for (const periodicite of ['mensuel', 'trimestriel']) for (const cfe of [false, true]) for (const fe of [false, true]) {
  const fichier = `echeances-${periodicite}${cfe ? '-cfe' : ''}${fe ? '-fe' : ''}.ics`;
  const plus = [cfe && 'CFE', fe && 'facturation électronique'].filter(Boolean);
  FLUX.push({ fichier, periodicite: periodicite === 'mensuel' ? 'mois' : 'trimestre', cfe, fe, titre: `Déclaration ${periodicite === 'mensuel' ? 'mensuelle' : 'trimestrielle'}${plus.length ? ' + ' + plus.join(' + ') : ''}` });
}

export function genererFlux(regles) {
  const R = creerRegles(regles.entrees);
  const hostname = new URL(CFG.origin).hostname;
  const depuis = CFG.miseAJour.slice(0, 8) + '01';
  return FLUX.map((f) => {
    const { erreurs, evenements } = genererEcheances({ periodicite: f.periodicite, debutActivite: '', depuis, fin: FIN_FLUX, options: { cfe: f.cfe, fe: f.fe, options: false, ir: false } }, R);
    if (erreurs.length) throw new Error(`${f.fichier} : ${erreurs.map((e) => e.message).join(' ; ')}`);
    return { ...f, evenements: evenements.length, contenu: construireIcs({ nom: `Échéances micro-entrepreneur (${f.titre})`, description: `Compta by glsc : ${f.titre}. Dates lues sur service-public.gouv.fr, mises à jour le ${CFG.miseAJour}.`, evenements, dtstamp: CFG.miseAJour.replace(/-/g, '') + 'T000000Z', domaine: hostname, rappels: [7, 1], url: CFG.origin + '/outils/calendrier-echeances/' }) };
  });
}
