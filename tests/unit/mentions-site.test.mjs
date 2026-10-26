import test from 'node:test';
import assert from 'node:assert/strict';
import { docVide, analyser, mentionsLegales, confidentialite, enHtml, enTexte } from '../../src/assets/js/lib/mentions-site.js';

const ok = () => {
  const d = docVide();
  Object.assign(d.editeur, { nom: 'Gabin Lescoat', adresse: '1 rue Test, 35000 Rennes', email: 'pro@glsc.fr', tel: '+33 7 00 00 00 00', siren: '732 829 320', activite: 'liberale', droits: true });
  Object.assign(d.hebergeur, { nom: 'IONOS SE', adresse: 'Elgendorfer Straße 57, 56410 Montabaur, Allemagne', tel: '+49 0000' });
  d.site.nom = 'Mon site'; d.contact.duree = '3 ans après le dernier échange'; d.logs.duree = '35 jours';
  return d;
};
const champs = (d) => analyser(d).erreurs.map((e) => e.champ);

test('mentions légales d’un entrepreneur individuel : contenu exigé par service-public.gouv.fr', () => {
  const d = ok(); assert.deepEqual(analyser(d).erreurs, []);
  const t = enTexte(mentionsLegales(d));
  for (const x of ['Gabin Lescoat, entrepreneur individuel (EI)', 'Adresse de domiciliation : 1 rue Test', 'E-mail : pro@glsc.fr', 'Téléphone : +33 7 00 00 00 00', 'Activité libérale : immatriculée au registre national unique des entreprises (RNE), numéro SIREN 732 829 320', 'Directeur de la publication', 'Nom ou dénomination sociale : IONOS SE', 'Adresse : Elgendorfer', 'Téléphone : +49', 'Propriété intellectuelle']) assert.ok(t.includes(x), x);
});

test('activité commerciale : RCS avec la ville du greffe ; TVA seulement si renseignée ; en cours d’immatriculation', () => {
  const d = ok(); d.editeur.activite = 'commerciale'; d.editeur.greffe = 'Rennes'; d.editeur.tvaIntra = 'FR12345678901';
  const t = enTexte(mentionsLegales(d)); assert.match(t, /RCS\) de Rennes, numéro 732 829 320/); assert.match(t, /TVA intracommunautaire : FR12345678901/);
  assert.doesNotMatch(enTexte(mentionsLegales(ok())), /TVA/);
  const c = ok(); c.editeur.enCours = true; c.editeur.siren = '';
  assert.deepEqual(analyser(c).erreurs, []); assert.match(enTexte(mentionsLegales(c)), /en cours d’attribution/);
});

test('champs obligatoires : téléphone, hébergeur, SIREN valide, durées de conservation', () => {
  const d = ok(); d.editeur.tel = ''; d.hebergeur.tel = ''; d.editeur.siren = '732829321'; d.contact.duree = ''; d.logs.duree = '';
  assert.deepEqual(champs(d).sort(), ['contact.duree', 'editeur.siren', 'editeur.tel', 'hebergeur.tel', 'logs.duree']);
  assert.deepEqual(champs(docVide()).includes('editeur.nom'), true);
});

test('propriété intellectuelle : phrase ajoutée seulement si les droits sont confirmés', () => {
  const d = ok(); d.editeur.droits = false;
  assert.doesNotMatch(enTexte(mentionsLegales(d)), /Propriété intellectuelle/); assert.match(analyser(d).avertissements.join(' '), /droits sur les textes/);
});

test('politique de confidentialité : éléments de la CNIL pour chaque traitement, droits, réclamation', () => {
  const d = ok(); d.newsletter = { actif: true, prestataire: 'Brevo', duree: 'Jusqu’à votre désabonnement, puis suppression.' };
  assert.deepEqual(analyser(d).erreurs, []);
  const t = enTexte(confidentialite(d));
  for (const x of ['Gabin Lescoat, entrepreneur individuel (EI)', 'Contact pour toute question sur vos données personnelles : pro@glsc.fr', 'À quoi elles servent : répondre à votre message', 'Pourquoi nous pouvons les utiliser : l’intérêt légitime de l’éditeur', 'Les informations demandées dans le formulaire sont nécessaires', 'Qui les reçoit : l’éditeur et Brevo', 'Durée de conservation : 3 ans après le dernier échange.', 'Durée de conservation : 35 jours.', 'accéder à vos données', 'les faire rectifier', 'les faire effacer', 'en demander la limitation', 'vous opposer à leur utilisation', 'retirer votre consentement à tout moment', 'recevoir vos données dans un format structuré', 'réclamation auprès de la CNIL', 'ne sont pas transférées hors de l’Union européenne', 'n’utilise aucun cookie']) assert.ok(t.includes(x), x);
});

test('droits selon la base légale : pas de retrait du consentement sans traitement fondé sur le consentement', () => {
  const t = enTexte(confidentialite(ok()));
  assert.doesNotMatch(t, /retirer votre consentement/); assert.doesNotMatch(t, /portabilité/); assert.match(t, /vous opposer/);
});

test('mesure d’audience et transferts : textes selon les choix, précisions obligatoires', () => {
  const d = ok(); d.audience = { actif: true, outil: 'Matomo', regime: 'consentement', duree: '13 mois' }; d.transferts = { actif: true, precision: 'États-Unis, clauses contractuelles types' };
  assert.deepEqual(analyser(d).erreurs, []);
  const t = enTexte(confidentialite(d)); assert.match(t, /Matomo pour mesurer sa fréquentation\. Des cookies ou traceurs ne sont déposés qu’avec votre accord/); assert.match(t, /transférées hors de l’Union européenne : États-Unis/);
  d.audience.outil = ''; d.transferts.precision = ''; assert.deepEqual(champs(d).sort(), ['audience.outil', 'transferts.precision']);
});

test('aucune donnée collectée : phrase dédiée', () => {
  const d = ok(); d.contact.actif = false; d.logs.actif = false;
  assert.match(enTexte(confidentialite(d)), /ne collecte aucune donnée personnelle/);
});

test('sécurité : tout est échappé en HTML, jamais de balise issue de la saisie', () => {
  const d = ok(); d.editeur.nom = '<img src=x onerror=alert(1)> & "Dupont"'; d.site.nom = '<script>x</script>';
  const html = enHtml(mentionsLegales(d)) + enHtml(confidentialite(d));
  assert.doesNotMatch(html, /<img|<script/); assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt; &amp; &quot;Dupont&quot;/);
  assert.match(enHtml(mentionsLegales(ok())), /^<h1>Mentions légales de Mon site<\/h1>\n<h2>Éditeur du site<\/h2>\n<ul>/);
});
