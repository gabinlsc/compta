// Page de l'outil « Mentions légales et confidentialité de site » (formulaire statique ; le texte généré est dessiné par le script).
import { champ, coche, choisir } from './formulaires.mjs';

export function pageMentionsSite() {
  return `<p class="eyebrow">Outil gratuit · sans compte</p>
<h1>Mentions légales et politique de confidentialité de votre site</h1>
<p class="lead">Un site professionnel doit afficher des mentions légales et, dès qu’il recueille des données personnelles (formulaire de contact, lettre d’information, mesure d’audience), expliquer ce qu’il en fait. Répondez aux questions : les deux textes se composent à partir de vos réponses, prêts à copier dans votre site.</p>
<p class="notice info"><strong>Ne remplace pas un conseil juridique.</strong> Les mentions suivent la liste de <a href="https://www.service-public.gouv.fr/particuliers/vosdroits/F37351" rel="noopener">service-public.gouv.fr</a> ; la politique de confidentialité reprend les informations à donner selon la <a href="https://www.cnil.fr/fr/conformite-rgpd-information-des-personnes-et-transparence" rel="noopener">CNIL</a>. Le texte doit refléter ce que fait réellement votre site. Rien n’est envoyé : tout se compose dans votre navigateur.</p>
<noscript><p class="notice">Cet outil demande JavaScript pour fonctionner dans votre navigateur. Aucune donnée n’est envoyée.</p></noscript>

<div class="outil outil-mentions" id="outil-mentions" hidden>
<form class="outil-form" id="formulaire" novalidate autocomplete="off" aria-label="Informations sur votre site">
  <div class="bloc plein"><h2 class="titre-form">Vous, l’éditeur du site</h2><div class="grille">
    ${champ({ nom: 'editeur.nom', label: 'Nom et prénom *', attrs: 'maxlength="120" required', auto: 'name' })}
    ${champ({ nom: 'editeur.nomCommercial', label: 'Nom commercial (facultatif)', attrs: 'maxlength="120"' })}
    ${champ({ nom: 'editeur.adresse', label: 'Adresse de domiciliation *', aide: 'L’adresse de votre entreprise, pas forcément celle de votre domicile si vous êtes domicilié ailleurs.', attrs: 'maxlength="300" required', classe: 'large' })}
    ${champ({ nom: 'editeur.email', label: 'E-mail *', type: 'email', attrs: 'maxlength="120" required' })}
    ${champ({ nom: 'editeur.tel', label: 'Téléphone *', type: 'tel', attrs: 'maxlength="30" required' })}
    ${choisir({ nom: 'editeur.activite', label: 'Votre activité', options: [['liberale', 'Libérale'], ['commerciale', 'Commerciale'], ['artisanale', 'Artisanale'], ['agricole', 'Agricole']] })}
    ${champ({ nom: 'editeur.siren', label: 'SIREN', attrs: 'maxlength="14" inputmode="numeric"', aide: 'Neuf chiffres, sur votre avis de situation Insee.' })}
    ${coche({ nom: 'editeur.enCours', label: 'Mon entreprise est en cours d’immatriculation (pas encore de SIREN)' })}
    ${champ({ nom: 'editeur.greffe', label: 'Ville du greffe (activité commerciale)', attrs: 'maxlength="80"', aide: 'Pour mentionner l’inscription au registre du commerce et des sociétés.' })}
    ${champ({ nom: 'editeur.tvaIntra', label: 'N° de TVA intracommunautaire (si vous en avez un)', attrs: 'maxlength="20"' })}
    ${champ({ nom: 'editeur.profession', label: 'Profession réglementée (le cas échéant)', attrs: 'maxlength="300"', aide: 'Titre professionnel, État où il a été octroyé, ordre ou organisme d’inscription.', classe: 'large' })}
    ${champ({ nom: 'editeur.autorite', label: 'Autorité d’autorisation (le cas échéant)', attrs: 'maxlength="300"', classe: 'large' })}
    ${coche({ nom: 'editeur.directeur', label: 'Je suis le directeur de la publication' })}
    ${coche({ nom: 'editeur.droits', label: 'J’ai les droits sur les textes, images et logos de mon site', aide: 'À cocher seulement si c’est vrai : cela ajoute la phrase sur la propriété intellectuelle.' })}
  </div></div>
  <div class="bloc plein"><h2 class="titre-form">Votre site et son hébergeur</h2><div class="grille">
    ${champ({ nom: 'site.nom', label: 'Nom du site *', attrs: 'maxlength="120" required' })}
    ${champ({ nom: 'hebergeur.nom', label: 'Hébergeur : nom ou dénomination sociale *', attrs: 'maxlength="160" required' })}
    ${champ({ nom: 'hebergeur.adresse', label: 'Hébergeur : adresse *', attrs: 'maxlength="300" required', classe: 'large' })}
    ${champ({ nom: 'hebergeur.tel', label: 'Hébergeur : téléphone *', type: 'tel', attrs: 'maxlength="30" required' })}
  </div></div>
  <div class="bloc plein"><h2 class="titre-form">Les données que votre site collecte</h2>
    <p class="aide">Cochez ce que fait réellement votre site.</p><div class="grille">
    ${coche({ nom: 'contact.actif', label: 'Un formulaire ou une adresse de contact' })}
    ${choisir({ nom: 'contact.base', label: 'Pourquoi utilisez-vous ces messages ?', options: [['interet', 'Répondre aux demandes (intérêt légitime)'], ['contrat', 'Préparer ou exécuter un contrat'], ['consentement', 'Consentement de la personne']] })}
    ${champ({ nom: 'contact.duree', label: 'Durée de conservation des messages *', attrs: 'maxlength="200"', aide: 'Par exemple « jusqu’à la fin de nos échanges, puis une durée que vous précisez ».' })}
    ${coche({ nom: 'newsletter.actif', label: 'Une lettre d’information' })}
    ${champ({ nom: 'newsletter.prestataire', label: 'Prestataire d’envoi *', attrs: 'maxlength="120"' })}
    ${champ({ nom: 'newsletter.duree', label: 'Durée de conservation des adresses *', attrs: 'maxlength="200"' })}
    ${coche({ nom: 'audience.actif', label: 'Une mesure d’audience' })}
    ${champ({ nom: 'audience.outil', label: 'Outil de mesure *', attrs: 'maxlength="120"' })}
    ${choisir({ nom: 'audience.regime', label: 'Régime', options: [['consentement', 'Avec recueil du consentement'], ['exempte', 'Configuré en exemption (conditions CNIL)']] })}
    ${champ({ nom: 'audience.duree', label: 'Durée de conservation des données de mesure *', attrs: 'maxlength="200"' })}
    ${coche({ nom: 'logs.actif', label: 'Journaux de connexion du serveur' })}
    ${champ({ nom: 'logs.duree', label: 'Durée de conservation des journaux *', attrs: 'maxlength="200"', aide: 'Demandez-la à votre hébergeur.' })}
    ${coche({ nom: 'transferts.actif', label: 'Des données sont transférées hors de l’Union européenne' })}
    ${champ({ nom: 'transferts.precision', label: 'Pays ou organisations, et garanties *', attrs: 'maxlength="300"', classe: 'large' })}
    ${champ({ nom: 'pointContact', label: 'Contact pour les droits (si différent de votre e-mail)', attrs: 'maxlength="160"', classe: 'large' })}
  </div></div>
</form>

<section class="apercu" aria-labelledby="titre-apercu">
  <div class="apercu-tete"><h2 id="titre-apercu">Vos textes</h2></div>
  <div id="bilan" class="bilan" role="status" aria-live="polite"></div>
  <div class="actions"><button type="button" class="btn" id="copier-html">Copier en HTML</button><button type="button" class="btn ghost" id="copier-texte">Copier en texte</button></div>
  <p class="aide" id="etat-copie" role="status"></p>
  <div id="textes-zone" class="prose"></div>
</section>
</div>

<div class="prose aide-page">
<h2>Ce que doivent contenir les mentions légales</h2>
<p>Pour un entrepreneur individuel, il s’agit de votre nom, de l’adresse de votre entreprise, de votre e-mail et de votre téléphone, du numéro d’identification (SIREN), du directeur de la publication, de l’hébergeur (nom, adresse, téléphone) et, selon votre situation, de la profession réglementée ou de l’autorisation d’exercer.</p>
<h2>Questions fréquentes</h2>
<h3>Mon site doit-il avoir une politique de confidentialité ?</h3>
<p>Dès qu’il recueille des données personnelles, vous devez informer les personnes de ce que vous en faites : qui est responsable, pourquoi, sur quelle base, pour combien de temps, qui les reçoit et quels sont leurs droits.</p>
<h3>Où afficher ces textes ?</h3>
<p>Dans deux pages accessibles depuis le pied de page de chaque page de votre site.</p>
<h3>Mes réponses sont-elles envoyées ?</h3>
<p>Non. Les textes sont composés dans votre navigateur ; rien n’est conservé ni transmis.</p>
</div>`;
}

export const FAQ_MENTIONS = [
  ['Quelles mentions légales pour le site d’un entrepreneur individuel ?', 'Votre nom, l’adresse de votre entreprise, votre e-mail et votre téléphone, votre numéro SIREN, le directeur de la publication, l’hébergeur du site (nom, adresse, téléphone) et, le cas échéant, la profession réglementée ou l’autorisation d’exercer.'],
  ['Mon site doit-il avoir une politique de confidentialité ?', 'Oui, dès qu’il recueille des données personnelles : vous devez informer les personnes du responsable, des finalités, de la base légale, des durées de conservation, des destinataires et de leurs droits.'],
  ['Mes réponses sont-elles envoyées ?', 'Non. Les textes sont composés dans votre navigateur ; rien n’est envoyé ni conservé.'],
];
