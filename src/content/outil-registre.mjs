// Page de l'outil « Registre RGPD simplifié » (formulaire statique ; les fiches de traitement sont dessinées par le script).
import { champ } from './formulaires.mjs';

export function pageRegistre() {
  return `<p class="eyebrow">Outil gratuit · sans compte</p>
<h1>Registre RGPD simplifié pour micro-entrepreneur</h1>
<p class="lead">Vos fiches de traitement à partir de modèles, prêtes à imprimer.</p>
<p class="notice info"><strong>Ne remplace pas un conseil juridique.</strong> Contenu minimal décrit par la <a href="https://www.cnil.fr/fr/RGPD-le-registre-des-activites-de-traitement" rel="noopener">CNIL</a>. Rien n’est envoyé.</p>
<noscript><p class="notice">Cet outil demande JavaScript pour fonctionner dans votre navigateur. Aucune donnée n’est envoyée.</p></noscript>

<div class="outil outil-registre" id="outil-registre" hidden>
<form class="outil-form" id="formulaire" novalidate autocomplete="off" aria-label="Registre des traitements">
  <div class="bloc plein">
    <h2 class="titre-form">Votre organisme</h2>
    <div class="grille">
    ${champ({ nom: 'org.nom', label: 'Nom *', aide: 'Vous, avec la mention « entrepreneur individuel », et votre nom commercial s’il y en a un.', attrs: 'maxlength="160" required', classe: 'large' })}
    ${champ({ nom: 'org.adresse', label: 'Adresse *', attrs: 'maxlength="300" required', classe: 'large' })}
    ${champ({ nom: 'org.email', label: 'E-mail de contact *', type: 'email', attrs: 'maxlength="120" required' })}
    ${champ({ nom: 'org.tel', label: 'Téléphone', type: 'tel', attrs: 'maxlength="30"' })}
    ${champ({ nom: 'org.dpo', label: 'Délégué à la protection des données (facultatif)', attrs: 'maxlength="300"', aide: 'Si vous n’en avez pas désigné, indiquez un point de contact pour les questions de protection des données.', classe: 'large' })}
    </div>
  </div>
  <div class="bloc plein">
    <h2 class="titre-form">Vos activités de traitement</h2>
    <p class="aide">Une fiche par activité qui utilise des données personnelles : clients, contacts, abonnés, prospects… Partez d’un modèle puis adaptez-le à votre situation réelle : le registre doit refléter ce que vous faites vraiment.</p>
    <div class="actions modeles-actions">
      <label class="sr-only" for="modele-choix">Choisir un modèle de traitement</label>
      <select id="modele-choix"><option value="facturation">Facturation et suivi des paiements</option><option value="contact">Réponse aux demandes de contact</option><option value="newsletter">Lettre d’information</option><option value="prospection">Prospection commerciale</option><option value="vierge">Une fiche vierge</option></select>
      <button type="button" class="btn ghost petit" id="ajouter-traitement">Ajouter cette fiche</button>
    </div>
    <div id="traitements"></div>
  </div>
  <div class="bloc plein">
    <h2 class="titre-form">Enregistrer, exporter</h2>
    <p class="aide">Par défaut, rien n’est conservé : si vous fermez la page, tout disparaît.</p>
    <div class="actions">
      <button type="button" class="btn ghost petit" id="enregistrer">Enregistrer dans ce navigateur</button>
      <button type="button" class="btn ghost petit" id="exporter">Exporter (JSON)</button>
      <label class="btn ghost petit" for="importer">Importer (JSON)</label><input type="file" id="importer" accept="application/json,.json" class="sr-only">
      <button type="button" class="btn ghost petit danger" id="effacer">Tout effacer</button>
    </div>
    <p class="aide" id="etat-stockage" role="status"></p>
  </div>
</form>

<section class="apercu" aria-labelledby="titre-apercu">
  <div class="apercu-tete"><h2 id="titre-apercu">Votre registre</h2><button type="button" class="btn" id="imprimer">Imprimer ou enregistrer en PDF</button></div>
  <div id="bilan" class="bilan" role="status" aria-live="polite"></div>
  <div id="feuille-zone"></div>
</section>
</div>

<div class="prose aide-page">
<h2>Ce que contient un registre</h2>
<p>Le registre se présente sous une forme écrite, papier ou électronique. Il porte le nom et les coordonnées de votre organisme, et, pour chaque activité de traitement : les finalités, les catégories de personnes concernées, les catégories de données, les destinataires (sous-traitants compris), les éventuels transferts hors de l’Union européenne, les délais prévus pour l’effacement des données et, dans la mesure du possible, une description générale des mesures de sécurité.</p>
<h2>Questions fréquentes</h2>
<h3>Suis-je vraiment concerné, étant seul ?</h3>
<p>Oui : l’obligation de tenir un registre concerne tous les organismes, publics comme privés et quelle que soit leur taille, dès lors qu’ils traitent des données personnelles. Les entreprises de moins de 250 salariés ne doivent inscrire que les traitements non occasionnels (gestion des clients, des prospects, des fournisseurs, par exemple), ceux qui comportent un risque pour les personnes et ceux qui portent sur des données sensibles. La CNIL recommande, en cas de doute, d’intégrer le traitement au registre.</p>
<h3>À quelle fréquence le mettre à jour ?</h3>
<p>Régulièrement : toute modification des conditions d’un traitement (nouvelle donnée collectée, durée de conservation allongée, nouveau destinataire) doit y être portée.</p>
<h3>Et si je traite des données pour le compte de mes clients ?</h3>
<p>Les sous-traitants (par exemple un prestataire informatique ou une agence de communication) doivent tenir un registre distinct de leurs activités de sous-traitance. Cet outil ne couvre que votre registre de responsable de traitement.</p>
<h3>Mes données sont-elles envoyées ?</h3>
<p>Non. Le registre se remplit dans votre navigateur ; rien n’est conservé sans votre action.</p>
</div>`;
}

export const FAQ_REGISTRE = [
  ['Suis-je concerné par le registre RGPD si je travaille seul ?', 'Oui : l’obligation concerne tous les organismes, quelle que soit leur taille, dès lors qu’ils traitent des données personnelles. Les entreprises de moins de 250 salariés n’inscrivent que les traitements non occasionnels, à risque ou portant sur des données sensibles.'],
  ['Que contient un registre des traitements ?', 'Les coordonnées de l’organisme et, pour chaque activité : finalités, catégories de personnes et de données, destinataires, transferts hors Union européenne, durées de conservation et mesures de sécurité.'],
  ['Mes données sont-elles envoyées ?', 'Non. Le registre se remplit dans votre navigateur ; rien n’est conservé sans votre action.'],
];
