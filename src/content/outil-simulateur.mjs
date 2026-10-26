// Page de l'outil « Combien me reste-t-il ? » (formulaire statique ; chiffres en jetons {{id}} remplis depuis data/regles.json).
import { champ, coche, choisir, radios } from './formulaires.mjs';

export function pageSimulateur() {
  return `<p class="eyebrow">Outil gratuit · sans compte</p>
<h1>Simulateur : combien me reste-t-il après cotisations ?</h1>
<p class="lead">Votre chiffre d’affaires, vos cotisations, ce qu’il vous reste.</p>
<p class="notice info"><strong>Estimation indicative.</strong> Taux issus de <a href="/sources/">sources officielles</a> ; seule votre déclaration fait foi.</p>
<noscript><p class="notice">Cet outil demande JavaScript pour calculer dans votre navigateur. Aucune donnée n’est envoyée.</p></noscript>

<div class="outil outil-simu" id="outil-simulateur" hidden>
<form class="outil-form" id="formulaire" novalidate autocomplete="off" aria-label="Paramètres de la simulation">
  <div class="bloc plein">
    <div class="grille">
    ${champ({ nom: 'ca', label: 'Chiffre d’affaires hors taxes encaissé (€) *', attrs: 'inputmode="decimal" maxlength="14" required', aide: 'Le montant encaissé sur la période, sans TVA : vous êtes en franchise.' })}
    ${choisir({ nom: 'periode', label: 'Pour quelle période ?', options: [['mois', 'Un mois'], ['trimestre', 'Un trimestre'], ['annee', 'Une année']] })}
    ${choisir({ nom: 'activite', label: 'Votre activité *', options: [['vente', 'Vente de marchandises, fourniture de logement (BIC)'], ['bic_services', 'Prestations de services commerciales ou artisanales (BIC)'], ['bnc_ssi', 'Profession libérale non réglementée (BNC, SSI)'], ['bnc_cipav', 'Profession libérale réglementée (BNC, Cipav)']], aide: 'Le taux de cotisations dépend de la nature de l’activité.' })}
    ${champ({ nom: 'depenses', label: 'Vos dépenses professionnelles sur la période (€, facultatif)', attrs: 'inputmode="decimal" maxlength="14"', aide: 'Elles ne réduisent pas vos cotisations (calculées sur le chiffre d’affaires) mais votre revenu réel.' })}
    </div>
    ${coche({ nom: 'acre', label: 'Je bénéficie de l’Acre', aide: 'Taux minoré à 75 % du taux normal (exonération de {{acre_exoneration_micro}}) pour les micro-entreprises créées ou reprises à partir du {{acre_debut_regime}}, jusqu’à la fin du {{acre_trimestres_suivants}} suivant le début d’activité. Demande à faire dans les {{acre_delai_demande_jours}} suivant l’ouverture de l’activité.' })}
    ${champ({ nom: 'debutActivite', label: 'Date de début d’activité (facultatif)', type: 'date', classe: 'si-acre', aide: 'Pour calculer la date de fin de votre Acre.' })}
    ${coche({ nom: 'vl', label: 'J’ai opté pour le versement forfaitaire libératoire de l’impôt', aide: 'Vous payez l’impôt avec vos cotisations, en pourcentage du chiffre d’affaires. Possible si le revenu fiscal de référence du foyer (année N-2) ne dépasse pas {{vfl_rfr_seul}} pour une personne seule, {{vfl_rfr_couple}} pour un couple, {{vfl_rfr_couple_1_enfant}} avec 1 enfant, {{vfl_rfr_couple_2_enfants}} avec 2 enfants. Option avant le 30 septembre de l’année précédente.' })}
  </div>
</form>

<section class="resultat" aria-labelledby="titre-resultat">
  <h2 id="titre-resultat">Votre résultat</h2>
  <div id="bilan" role="status" aria-live="polite"></div>
  <div id="resultat-zone"></div>
</section>
</div>

<div class="prose aide-page">
<h2>Comment ça marche</h2>
<p>Les cotisations d’un micro-entrepreneur sont un pourcentage fixe du chiffre d’affaires encaissé. Ce pourcentage inclut toutes les cotisations et contributions sociales : maladie, retraite, allocations familiales, formation professionnelle, CSG et CRDS. Le simulateur applique le taux de votre activité, déduit votre Acre si vous en bénéficiez, ajoute l’impôt libératoire si vous l’avez choisi, puis soustrait vos dépenses.</p>
<p>Il ne calcule pas : la cotisation foncière des entreprises (CFE), les éventuels frais de chambre consulaire, ni l’impôt sur le revenu au barème (voir plus bas).</p>
<h2>Questions fréquentes</h2>
<h3>Que devient mon revenu pour l’impôt sur le revenu ?</h3>
<p>Sans versement libératoire, l’administration fiscale applique un abattement forfaitaire à votre chiffre d’affaires : {{abattement_vente}} pour la vente, {{abattement_bic_services}} pour les prestations de services BIC, {{abattement_bnc}} pour les activités libérales (minimum {{abattement_minimum}}). Le reste est ajouté aux autres revenus de votre foyer et soumis au barème. Le simulateur affiche ce revenu imposable estimé, pas le montant de l’impôt, qui dépend de toute votre situation.</p>
<h3>Mon chiffre d’affaires dépasse le plafond, que se passe-t-il ?</h3>
<p>Le plafond est de {{plafond_ca_vente}} pour la vente et de {{plafond_ca_services}} pour les prestations de services. Le régime de la micro-entreprise ne s’applique plus si vous le dépassez deux années consécutives. Voir le guide <a href="/guides/plafonds-et-seuils-de-tva/">Plafonds et seuils de TVA</a>.</p>
<h3>L’Acre est-elle toujours à {{acre_exoneration_avant_juillet_2026}} ?</h3>
<p>Non. Pour les micro-entreprises créées ou reprises à partir du {{acre_debut_regime}}, l’exonération est de {{acre_exoneration_micro}} (décret du 6 février 2026). Pour une création antérieure, l’exonération était de {{acre_exoneration_avant_juillet_2026}} : le simulateur ne calcule pas ce cas, utilisez le simulateur de l’Urssaf.</p>
<h3>Mes données sont-elles enregistrées ?</h3>
<p>Non : les calculs se font dans votre navigateur et rien n’est conservé. Si vous fermez la page, la saisie disparaît.</p>
</div>`;
}

export const FAQ_SIMULATEUR = [
  ['Que contient le taux de cotisations d’un micro-entrepreneur ?', 'Un pourcentage fixe du chiffre d’affaires qui inclut toutes les cotisations et contributions sociales : maladie, retraite, allocations familiales, formation professionnelle, CSG et CRDS.'],
  ['L’Acre est-elle toujours à {{acre_exoneration_avant_juillet_2026}} ?', 'Non. Pour les micro-entreprises créées ou reprises à partir du {{acre_debut_regime}}, l’exonération est de {{acre_exoneration_micro}} (taux minoré à 75 % du taux normal). Pour une création antérieure, elle était de {{acre_exoneration_avant_juillet_2026}}.'],
  ['Mes données sont-elles enregistrées ?', 'Non : les calculs se font dans votre navigateur et rien n’est conservé.'],
];
