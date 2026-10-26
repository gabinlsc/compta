// Générateur de mentions légales et de politique de confidentialité pour le site vitrine d'un entrepreneur individuel.
// Contenu des mentions : service-public.gouv.fr F37351 (page vérifiée par la DILA le 13 octobre 2026). Contenu de la politique de confidentialité : informations à donner selon la CNIL.
// Un document est une structure { titre, sections: [{ titre, blocs: [{ p } | { liste: [...] }] }] } ; elle est ensuite rendue en HTML (tout échappé), en texte ou en DOM.
import { sirenValide, chiffres, formaterSiren, emailValide } from './valid.js';

export const ACTIVITES = { commerciale: 'Activité commerciale', artisanale: 'Activité artisanale', liberale: 'Activité libérale', agricole: 'Activité agricole' };
export const BASES = { consentement: 'votre consentement', contrat: 'l’exécution d’un contrat ou de mesures précontractuelles', interet: 'l’intérêt légitime de l’éditeur', obligation: 'une obligation légale' };

export function docVide() {
  return {
    editeur: { nom: '', nomCommercial: '', adresse: '', email: '', tel: '', siren: '', enCours: false, activite: 'liberale', greffe: '', tvaIntra: '', directeur: true, droits: false, profession: '', autorite: '' },
    hebergeur: { nom: '', adresse: '', tel: '' },
    site: { nom: '', url: '' },
    contact: { actif: true, base: 'interet', duree: '' },
    newsletter: { actif: false, prestataire: '', duree: 'Jusqu’à votre désabonnement, puis suppression.' },
    audience: { actif: false, outil: '', regime: 'consentement', duree: '' },
    logs: { actif: true, duree: '' },
    transferts: { actif: false, precision: '' },
    pointContact: '',
  };
}

const er = (champ, message) => ({ champ, message });
const eText = (s) => String(s ?? '').trim();

export function analyser(d) {
  const erreurs = [], avertissements = [], e = d.editeur, h = d.hebergeur;
  if (!eText(e.nom)) erreurs.push(er('editeur.nom', 'Indiquez votre nom et prénom.'));
  if (!eText(e.adresse)) erreurs.push(er('editeur.adresse', 'Indiquez l’adresse de domiciliation de votre entreprise.'));
  if (!emailValide(e.email)) erreurs.push(er('editeur.email', 'Indiquez une adresse e-mail valide pour vous contacter.'));
  if (!eText(e.tel)) erreurs.push(er('editeur.tel', 'Indiquez un numéro de téléphone : il fait partie des mentions obligatoires.'));
  if (!e.enCours) {
    if (!eText(e.siren)) erreurs.push(er('editeur.siren', 'Indiquez votre SIREN, ou cochez « en cours d’immatriculation ».'));
    else if (!sirenValide(e.siren)) erreurs.push(er('editeur.siren', 'Le SIREN n’est pas valide (9 chiffres, clé de contrôle incorrecte).'));
  }
  if (!eText(h.nom)) erreurs.push(er('hebergeur.nom', 'Indiquez le nom ou la dénomination sociale de votre hébergeur.'));
  if (!eText(h.adresse)) erreurs.push(er('hebergeur.adresse', 'Indiquez l’adresse de votre hébergeur.'));
  if (!eText(h.tel)) erreurs.push(er('hebergeur.tel', 'Indiquez le numéro de téléphone de votre hébergeur.'));
  if (!eText(d.site.nom)) erreurs.push(er('site.nom', 'Indiquez le nom de votre site.'));
  if (d.contact.actif && !eText(d.contact.duree)) erreurs.push(er('contact.duree', 'Indiquez combien de temps vous conservez les messages reçus (par exemple « 3 ans après le dernier échange »).'));
  if (d.newsletter.actif) {
    if (!eText(d.newsletter.prestataire)) erreurs.push(er('newsletter.prestataire', 'Indiquez le prestataire qui envoie votre lettre d’information.'));
    if (!eText(d.newsletter.duree)) erreurs.push(er('newsletter.duree', 'Indiquez la durée de conservation des adresses e-mail.'));
  }
  if (d.audience.actif) { if (!eText(d.audience.outil)) erreurs.push(er('audience.outil', 'Indiquez le nom de votre outil de mesure d’audience.')); if (!eText(d.audience.duree)) erreurs.push(er('audience.duree', 'Indiquez la durée de conservation des données de mesure d’audience.')); }
  if (d.logs.actif && !eText(d.logs.duree)) erreurs.push(er('logs.duree', 'Indiquez la durée de conservation des journaux de connexion (demandez-la à votre hébergeur).'));
  if (d.transferts.actif && !eText(d.transferts.precision)) erreurs.push(er('transferts.precision', 'Précisez les pays ou organisations destinataires et les garanties prévues.'));
  if (!e.droits) avertissements.push('Vous n’avez pas confirmé disposer des droits sur les textes, images et logos de votre site : la phrase sur la propriété intellectuelle ne sera pas ajoutée.');
  if (e.activite === 'commerciale' && !eText(e.greffe)) avertissements.push('Pour une activité commerciale, vous pouvez aussi indiquer votre numéro d’inscription au RCS : précisez la ville du greffe.');
  return { erreurs, avertissements, bloque: erreurs.length > 0 };
}

const p = (t) => ({ p: t }), liste = (l) => ({ liste: l });
const point = (s) => (/[.!?]$/.test(s.trim()) ? s.trim() : s.trim() + '.');

export function mentionsLegales(d) {
  const e = d.editeur, h = d.hebergeur, s = [];
  const identite = [`${eText(e.nom)}, entrepreneur individuel (EI)`];
  if (eText(e.nomCommercial)) identite.push(`Nom commercial : ${eText(e.nomCommercial)}`);
  identite.push(`Adresse de domiciliation : ${eText(e.adresse)}`, `E-mail : ${eText(e.email)}`, `Téléphone : ${eText(e.tel)}`);
  s.push({ titre: 'Éditeur du site', blocs: [liste(identite)] });
  const ident = [e.enCours ? 'Numéro SIREN : en cours d’attribution (immatriculation en cours)' : `${ACTIVITES[e.activite] ?? ''} : immatriculée au registre national unique des entreprises (RNE), numéro SIREN ${formaterSiren(e.siren)}`];
  if (e.activite === 'commerciale' && eText(e.greffe) && !e.enCours) ident.push(`Inscrite au registre du commerce et des sociétés (RCS) de ${eText(e.greffe)}, numéro ${formaterSiren(e.siren)}`);
  if (eText(e.tvaIntra)) ident.push(`Numéro de TVA intracommunautaire : ${eText(e.tvaIntra)}`);
  s.push({ titre: 'Identification de l’entreprise', blocs: [liste(ident)] });
  if (e.directeur) s.push({ titre: 'Directeur de la publication', blocs: [p(`${eText(e.nom)}.`)] });
  s.push({ titre: 'Hébergeur', blocs: [liste([`Nom ou dénomination sociale : ${eText(h.nom)}`, `Adresse : ${eText(h.adresse)}`, `Téléphone : ${eText(h.tel)}`])] });
  if (eText(e.profession)) s.push({ titre: 'Profession réglementée', blocs: [p(point(eText(e.profession)))] });
  if (eText(e.autorite)) s.push({ titre: 'Autorisation d’exercer', blocs: [p(point(`Autorité ayant délivré l’autorisation : ${eText(e.autorite)}`))] });
  if (e.droits) s.push({ titre: 'Propriété intellectuelle', blocs: [p('Les textes, photographies, illustrations, vidéos, logos et autres contenus de ce site appartiennent à l’éditeur ou sont utilisés avec l’autorisation de leurs auteurs ou dans le cadre d’une licence qui le permet. Toute reproduction sans autorisation est interdite.')] });
  return { titre: `Mentions légales de ${eText(d.site.nom) || 'ce site'}`, sections: s };
}

export function confidentialite(d) {
  const e = d.editeur, s = [], contact = eText(d.pointContact) || eText(e.email);
  s.push({ titre: 'Qui est responsable de vos données ?', blocs: [p(`${eText(e.nom)}, entrepreneur individuel (EI), ${eText(e.adresse)}. Contact pour toute question sur vos données personnelles : ${contact}.`)] });
  const traitements = [];
  if (d.contact.actif) traitements.push({ titre: 'Quand vous nous écrivez', finalite: 'répondre à votre message', donnees: 'votre nom, votre adresse e-mail et le contenu de votre message', base: d.contact.base, obligatoire: 'Les informations demandées dans le formulaire sont nécessaires pour vous répondre ; sans elles, nous ne pouvons pas traiter votre demande.', destinataires: `l’éditeur, l’hébergeur du site (${eText(d.hebergeur.nom)}) et le fournisseur de messagerie`, duree: d.contact.duree });
  if (d.newsletter.actif) traitements.push({ titre: 'Lettre d’information', finalite: 'vous envoyer la lettre d’information', donnees: 'votre adresse e-mail', base: 'consentement', obligatoire: 'L’inscription est facultative ; votre adresse e-mail est nécessaire pour recevoir la lettre.', destinataires: `l’éditeur et ${eText(d.newsletter.prestataire)}, qui envoie la lettre`, duree: d.newsletter.duree });
  if (d.audience.actif) traitements.push({ titre: 'Mesure d’audience', finalite: 'connaître la fréquentation du site', donnees: 'des données de navigation', base: d.audience.regime === 'consentement' ? 'consentement' : 'interet', obligatoire: 'Cette mesure est facultative.', destinataires: `l’éditeur et ${eText(d.audience.outil)}`, duree: d.audience.duree });
  if (d.logs.actif) traitements.push({ titre: 'Journaux de connexion', finalite: 'assurer la sécurité et le bon fonctionnement du site', donnees: 'votre adresse IP, la date et la page demandée', base: 'interet', obligatoire: 'Ces données sont enregistrées automatiquement par le serveur lors de chaque visite.', destinataires: `l’hébergeur du site (${eText(d.hebergeur.nom)})`, duree: d.logs.duree });
  if (traitements.length) s.push({ titre: 'Quelles données, pourquoi, et pendant combien de temps ?', blocs: traitements.flatMap((t) => [p(t.titre), liste([`À quoi elles servent : ${t.finalite}.`, `Données : ${t.donnees}.`, `Pourquoi nous pouvons les utiliser : ${BASES[t.base]}.`, t.obligatoire, `Qui les reçoit : ${t.destinataires}.`, `Durée de conservation : ${point(eText(t.duree))}`])]) });
  else s.push({ titre: 'Quelles données ?', blocs: [p('Ce site ne collecte aucune donnée personnelle.')] });
  s.push({ titre: 'Cookies et traceurs', blocs: [p(d.audience.actif ? (d.audience.regime === 'consentement' ? `Ce site utilise ${eText(d.audience.outil)} pour mesurer sa fréquentation. Des cookies ou traceurs ne sont déposés qu’avec votre accord, que vous pouvez retirer à tout moment.` : `Ce site utilise ${eText(d.audience.outil)} pour mesurer sa fréquentation, configuré selon les conditions de la CNIL qui dispensent de recueillir votre consentement. Vous pouvez vous y opposer en nous contactant.`) : 'Ce site n’utilise aucun cookie ni traceur nécessitant votre consentement.')] });
  s.push({ titre: 'Transferts hors de l’Union européenne', blocs: [p(d.transferts.actif ? `Certaines données sont transférées hors de l’Union européenne : ${point(eText(d.transferts.precision))}` : 'Vos données ne sont pas transférées hors de l’Union européenne.')] });
  const droits = ['accéder à vos données', 'les faire rectifier', 'les faire effacer', 'en demander la limitation'];
  const consent = traitements.some((t) => t.base === 'consentement'), interet = traitements.some((t) => t.base === 'interet'), contrat = traitements.some((t) => t.base === 'contrat');
  if (interet) droits.push('vous opposer à leur utilisation');
  if (consent || contrat) droits.push('recevoir vos données dans un format structuré (portabilité)');
  if (consent) droits.push('retirer votre consentement à tout moment');
  s.push({ titre: 'Vos droits', blocs: [p('Vous pouvez à tout moment :'), liste(droits), p(`Pour les exercer, écrivez à ${contact}. Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL (www.cnil.fr).`)] });
  return { titre: `Politique de confidentialité de ${eText(d.site.nom) || 'ce site'}`, sections: s };
}

// ---------------------------------------------------------------- rendus
export const echapperHtml = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export function enHtml(doc) {
  return `<h1>${echapperHtml(doc.titre)}</h1>\n` + doc.sections.map((s) => `<h2>${echapperHtml(s.titre)}</h2>\n` + s.blocs.map((b) => (b.p !== undefined ? `<p>${echapperHtml(b.p)}</p>` : `<ul>\n${b.liste.map((x) => `  <li>${echapperHtml(x)}</li>`).join('\n')}\n</ul>`)).join('\n')).join('\n');
}
export function enTexte(doc) {
  return `${doc.titre}\n${'='.repeat(doc.titre.length)}\n\n` + doc.sections.map((s) => `${s.titre}\n${'-'.repeat(s.titre.length)}\n` + s.blocs.map((b) => (b.p !== undefined ? b.p : b.liste.map((x) => `- ${x}`).join('\n'))).join('\n\n')).join('\n\n') + '\n';
}
export { chiffres };
