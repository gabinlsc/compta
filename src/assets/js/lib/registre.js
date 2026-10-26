// Registre des activités de traitement (RGPD, article 30), version simplifiée pour un micro-entrepreneur responsable de traitement.
// Contenu minimal exigé par la CNIL pour chaque activité : finalité, catégories de personnes, catégories de données, destinataires, transferts hors Union européenne, durée de conservation, mesures de sécurité.
// Les durées proposées dans les modèles qui viennent d'une règle (conservation comptable) sont lues dans data/regles.json ; les autres sont laissées à compléter.
export const FORMAT = 'compta-by-glsc-registre-1';
export const CLE = 'compta:registre:v1';
export const MESURES = [
  'Appareils protégés par mot de passe et verrouillage automatique',
  'Mises à jour et antivirus à jour',
  'Disque de l’ordinateur chiffré',
  'Sauvegardes régulières',
  'Accès limité aux personnes qui en ont besoin',
  'Authentification renforcée (double facteur) sur les comptes en ligne',
  'Documents papier rangés sous clé',
];
export const BASES = ['', 'Consentement', 'Exécution d’un contrat ou de mesures précontractuelles', 'Obligation légale', 'Intérêt légitime', 'Mission d’intérêt public', 'Sauvegarde des intérêts vitaux'];
const txt = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');

export const traitementVide = () => ({ nom: '', finalite: '', personnes: '', donnees: '', destinataires: '', base: '', transferts: 'non', transfertsPrecision: '', duree: '', mesures: [], securiteAutre: '' });
export const registreVide = () => ({ format: FORMAT, org: { nom: '', adresse: '', email: '', tel: '', dpo: '' }, traitements: [] });

/** Modèles de traitements courants. `regles` : creerRegles(...) pour les durées qui sont des règles (sinon laissées vides). */
export function modele(id, regles) {
  const t = traitementVide();
  const conserv = regles.entree('conservation_documents_commerciaux')?.valeur, ans = regles.entree('livre_conservation_ans')?.valeur;
  switch (id) {
    case 'facturation':
      return { ...t, nom: 'Facturation et suivi des paiements', finalite: 'Établir et envoyer les devis et les factures, suivre les paiements, tenir le livre des recettes et la comptabilité.', personnes: 'Clients, particuliers et professionnels.',
        donnees: 'Identité ou nom de l’entreprise, adresse, e-mail, téléphone, détail des prestations et des montants, mode de règlement, SIREN du client professionnel.', destinataires: 'Moi-même ; mon expert-comptable, si j’en ai un ; mon prestataire de facturation ou de stockage de fichiers, si j’en utilise un.',
        base: 'Exécution d’un contrat ou de mesures précontractuelles', duree: [conserv && `Documents commerciaux : ${conserv}`, ans && `livre des recettes et pièces justificatives : ${ans} ans à partir de la clôture de l’exercice comptable`].filter(Boolean).join(' ; ') };
    case 'contact':
      return { ...t, nom: 'Réponse aux demandes de contact', finalite: 'Répondre aux messages envoyés par e-mail ou par le formulaire de contact du site.', personnes: 'Visiteurs du site, prospects.', donnees: 'Nom, adresse e-mail, contenu du message.',
        destinataires: 'Moi-même ; l’hébergeur du site ; mon fournisseur de messagerie.', base: 'Intérêt légitime' };
    case 'newsletter':
      return { ...t, nom: 'Lettre d’information', finalite: 'Envoyer une lettre d’information aux personnes qui le demandent.', personnes: 'Abonnés.', donnees: 'Adresse e-mail, prénom (facultatif), date d’inscription et preuve du consentement.',
        destinataires: 'Moi-même ; le prestataire d’envoi de la lettre.', base: 'Consentement', duree: 'Jusqu’au désabonnement, puis suppression.' };
    case 'prospection':
      return { ...t, nom: 'Prospection commerciale', finalite: 'Présenter mes services à des clients potentiels et assurer le suivi des échanges.', personnes: 'Prospects, particuliers ou professionnels.', donnees: 'Identité, fonction, coordonnées, historique des échanges.', destinataires: 'Moi-même.' };
    default:
      return t;
  }
}

/** Contrôle d'un registre : erreurs bloquantes (éléments minimaux de la CNIL) et conseils. */
export function analyser(r) {
  const erreurs = [], conseils = [];
  const e = (champ, message) => erreurs.push({ champ, message });
  if (!r.org.nom.trim()) e('org.nom', 'Indiquez le nom de votre organisme (vous, entrepreneur individuel).');
  if (!r.org.adresse.trim()) e('org.adresse', 'Indiquez votre adresse.');
  if (!r.org.email.trim()) e('org.email', 'Indiquez une adresse e-mail de contact.');
  if (!r.traitements.length) e('traitements', 'Ajoutez au moins une activité de traitement (par exemple la facturation).');
  r.traitements.forEach((t, i) => {
    const n = `Traitement ${i + 1}`, c = (k) => `traitements.${i}.${k}`;
    if (!t.nom.trim()) e(c('nom'), `${n} : donnez-lui un nom.`);
    for (const [k, l] of [['finalite', 'la finalité (à quoi servent ces données)'], ['personnes', 'les catégories de personnes concernées'], ['donnees', 'les catégories de données'], ['destinataires', 'les destinataires, y compris les prestataires'], ['duree', 'la durée de conservation ou les critères pour la fixer']]) if (!t[k].trim()) e(c(k), `${n} (${t.nom.trim() || 'sans nom'}) : indiquez ${l}.`);
    if (t.transferts === 'oui' && !t.transfertsPrecision.trim()) e(c('transfertsPrecision'), `${n} : précisez le pays ou l’organisation et les garanties prévues pour le transfert hors de l’Union européenne.`);
    if (!t.mesures.length && !t.securiteAutre.trim()) e(c('mesures'), `${n} : indiquez au moins une mesure de sécurité.`);
    if (!t.base) conseils.push(`${n} : la base légale n’est pas exigée dans le registre, mais la CNIL recommande de l’y indiquer.`);
    if (/tant que (nécessaire|besoin)|durée nécessaire/i.test(t.duree)) conseils.push(`${n} : une durée de conservation précise vaut mieux qu’une formule générale (« tant que nécessaire »).`);
  });
  return { erreurs, conseils, bloque: erreurs.length > 0 };
}

export function nettoyer(brut) {
  const r = brut && typeof brut === 'object' ? brut : {}, o = r.org ?? {}, base = registreVide();
  const org = { nom: txt(o.nom, 160), adresse: txt(o.adresse, 300), email: txt(o.email, 120), tel: txt(o.tel, 30), dpo: txt(o.dpo, 300) };
  const traitements = (Array.isArray(r.traitements) ? r.traitements : []).slice(0, 40).map((x) => {
    const t = traitementVide(), y = x && typeof x === 'object' ? x : {};
    for (const k of ['nom', 'finalite', 'personnes', 'donnees', 'destinataires', 'transfertsPrecision', 'duree', 'securiteAutre']) t[k] = txt(y[k], k === 'nom' ? 120 : 600);
    t.base = BASES.includes(y.base) ? y.base : ''; t.transferts = y.transferts === 'oui' ? 'oui' : 'non';
    t.mesures = (Array.isArray(y.mesures) ? y.mesures : []).filter((m) => MESURES.includes(m));
    return t;
  });
  return { ...base, org, traitements };
}
export const exporter = (r) => JSON.stringify({ ...r, format: FORMAT }, null, 2);
export function importer(texte) {
  if (typeof texte !== 'string' || texte.length > 2_000_000) throw new Error('Fichier trop volumineux.');
  let brut; try { brut = JSON.parse(texte); } catch { throw new Error('Ce fichier n’est pas un JSON valide.'); }
  if (!brut || brut.format !== FORMAT) throw new Error('Ce fichier ne vient pas de Compta by glsc (registre RGPD).');
  return nettoyer(brut);
}
