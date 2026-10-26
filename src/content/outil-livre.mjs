// Page de l'outil « Livre des recettes » (formulaire statique ; chiffres en jetons {{id}} de data/regles.json).
import { champ, coche, choisir } from './formulaires.mjs';

export function pageLivre() {
  return `<p class="eyebrow">Outil gratuit · sans compte</p>
<h1>Livre des recettes et suivi du chiffre d’affaires</h1>
<p class="lead">Vos encaissements, vos totaux, le montant à déclarer et l’alerte plafond.</p>
<p class="notice info"><strong>Vos données restent chez vous.</strong> Rien n’est conservé sans votre action : enregistrez dans ce navigateur ou exportez.</p>
<noscript><p class="notice">Cet outil demande JavaScript pour fonctionner dans votre navigateur. Aucune donnée n’est envoyée.</p></noscript>

<div class="outil outil-livre" id="outil-livre" hidden>
<div class="colonne-livre">
  <form class="outil-form" id="formulaire" novalidate autocomplete="off" aria-label="Nouvelle recette">
    <div class="bloc plein">
      <h2 class="titre-form">Nouvelle recette encaissée</h2>
      <div class="grille">
      ${champ({ nom: 'date', label: 'Date d’encaissement *', type: 'date', attrs: 'required' })}
      ${champ({ nom: 'montant', label: 'Montant encaissé (€) *', attrs: 'inputmode="decimal" maxlength="14" required' })}
      ${champ({ nom: 'origine', label: 'Origine : client ou société qui vous a payé *', attrs: 'maxlength="120" required', classe: 'large' })}
      ${champ({ nom: 'nature', label: 'Nature de la prestation ou de la vente', attrs: 'maxlength="160"', classe: 'large' })}
      ${choisir({ nom: 'mode', label: 'Mode de règlement *', options: [['virement', 'Virement'], ['cb', 'Carte bancaire'], ['cheque', 'Chèque'], ['especes', 'Espèces'], ['autre', 'Autre']] })}
      ${champ({ nom: 'piece', label: 'Référence de la pièce justificative', attrs: 'maxlength="60"', aide: 'Par exemple le numéro de facture.' })}
      </div>
      ${coche({ nom: 'global', label: 'Écriture globale de fin de journée', aide: 'Pour des ventes au détail ou des services à des particuliers dont chaque montant est inférieur à {{livre_seuil_global_euros}}.' })}
      <div class="actions"><button type="submit" class="btn" id="ajouter">Ajouter au livre</button></div>
      <p class="aide">Une écriture enregistrée ne se modifie pas : pour la corriger, le livre ajoute une écriture inverse, puis vous saisissez la bonne.</p>
      <p id="erreur-saisie" class="champ-erreur" role="alert"></p>
      <p id="statut-saisie" class="aide" role="status"></p>
    </div>
  </form>

  <div class="bloc plein parametres">
    <h2 class="titre-form">Réglages</h2>
    <div class="grille">
    ${choisir({ nom: 'annee', label: 'Année affichée', options: [['2026', '2026']] })}
    ${choisir({ nom: 'activite', label: 'Votre activité', options: [['bic_services', 'Prestations de services (BIC)'], ['bnc_ssi', 'Profession libérale non réglementée (BNC, SSI)'], ['bnc_cipav', 'Profession libérale réglementée (BNC, Cipav)'], ['vente', 'Vente de marchandises (BIC)']] })}
    ${choisir({ nom: 'periodicite', label: 'Vous déclarez…', options: [['mois', 'Chaque mois'], ['trimestre', 'Chaque trimestre']] })}
    </div>
    ${coche({ nom: 'auto', label: 'Enregistrer automatiquement dans ce navigateur', aide: 'Vos recettes sont gardées sur cet appareil à chaque ajout. Décochez pour que rien ne soit conservé.' })}
    <div class="actions">
      <button type="button" class="btn ghost petit" id="enregistrer">Enregistrer dans ce navigateur</button>
      <button type="button" class="btn ghost petit" id="exporter-json">Exporter (JSON)</button>
      <label class="btn ghost petit" for="importer">Importer (JSON)</label><input type="file" id="importer" accept="application/json,.json" class="sr-only">
      <button type="button" class="btn ghost petit danger" id="effacer">Tout effacer</button>
    </div>
    <p class="aide" id="etat-stockage" role="status"></p>
  </div>
</div>

<section class="resultat" aria-labelledby="titre-resultat">
  <h2 id="titre-resultat">Votre livre</h2>
  <div id="synthese"></div>
  <div class="actions no-print"><button type="button" class="btn" id="csv">Exporter en CSV</button><button type="button" class="btn ghost" id="imprimer">Imprimer le livre</button></div>
  <div id="tableau-zone"></div>
</section>
</div>

<div class="prose aide-page">
<h2>À quoi sert le livre des recettes ?</h2>
<p>Un micro-entrepreneur doit enregistrer chronologiquement le montant et l’origine des recettes qu’il perçoit, en distinguant les règlements en espèces des autres règlements et en indiquant la référence des pièces justificatives. Il fait le total de ses recettes tous les 3 mois. Vous pouvez le tenir sur un cahier, avec un logiciel, ou sous forme électronique comme ici.</p>
<h2>Questions fréquentes</h2>
<h3>Pourquoi ne puis-je pas modifier une écriture ?</h3>
<p>Une fois enregistrées, les écritures du livre ne peuvent pas être modifiées. Pour corriger une erreur, ajoutez une écriture inverse : l’outil le fait pour vous avec le bouton « Corriger », et conserve ainsi une trace claire.</p>
<h3>Combien de temps garder le livre ?</h3>
<p>{{livre_conservation_ans}} à partir de la clôture de l’exercice comptable concerné, ainsi que les pièces justificatives. Le fait de ne pas tenir le livre n’est pas sanctionné, mais un faux ou l’usage d’un faux dans un registre l’est : jusqu’à {{livre_faux_prison_ans}} d’emprisonnement et {{livre_faux_amende_euros}} d’amende.</p>
<h3>Qu’est-ce que le « montant à déclarer » ?</h3>
<p>C’est le chiffre d’affaires encaissé sur la période de déclaration (mois ou trimestre) : c’est la somme que vous déclarez à l’Urssaf avant la date limite indiquée. Voir le guide <a href="/guides/declarer-son-chiffre-d-affaires/">Déclarer son chiffre d’affaires</a>.</p>
<h3>Faut-il aussi un registre des achats ?</h3>
<p>Seulement si votre activité consiste à vendre des marchandises, des objets, des fournitures ou des denrées, ou à fournir un logement. Les prestataires de services en sont dispensés. Cet outil ne tient que le livre des recettes.</p>
</div>`;
}

export const FAQ_LIVRE = [
  ['Pourquoi ne puis-je pas modifier une écriture ?', 'Une fois enregistrées, les écritures du livre ne peuvent pas être modifiées. Pour corriger une erreur, on ajoute une écriture inverse.'],
  ['Combien de temps garder le livre des recettes ?', 'Dix ans à partir de la clôture de l’exercice comptable concerné, ainsi que les pièces justificatives.'],
  ['Mes données sont-elles envoyées ?', 'Non. Elles restent dans votre navigateur ; rien n’est conservé sans votre action.'],
];
