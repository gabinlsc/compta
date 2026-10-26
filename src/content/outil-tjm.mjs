// Page de l'outil « Tarif journalier (TJM) et horaire ». Les hypothèses de temps de travail sont modifiables : ce ne sont pas des règles.
import { champ, coche, choisir } from './formulaires.mjs';

export function pageTjm() {
  return `<p class="eyebrow">Outil gratuit · sans compte</p>
<h1>Calculateur de tarif journalier (TJM) et horaire</h1>
<p class="lead">Quel tarif facturer pour vous verser le revenu que vous visez, une fois les cotisations, les frais, les congés et le temps non facturé pris en compte ? Modifiez chaque hypothèse : tout est visible et rien n’est envoyé.</p>
<p class="notice info"><strong>Estimation indicative.</strong> Le calcul part de votre revenu net visé et remonte jusqu’au tarif, avec les taux de cotisations publiés (voir <a href="/sources/">les sources</a>). Il ne remplace pas l’avis d’un comptable.</p>
<noscript><p class="notice">Cet outil demande JavaScript pour calculer dans votre navigateur. Aucune donnée n’est envoyée.</p></noscript>

<div class="outil outil-simu" id="outil-tjm" hidden>
<form class="outil-form" id="formulaire" novalidate autocomplete="off" aria-label="Paramètres du calcul">
  <div class="bloc plein">
    <h2 class="titre-form">Votre objectif</h2>
    <div class="grille">
    ${champ({ nom: 'net', label: 'Revenu net visé par mois (€) *', attrs: 'inputmode="decimal" maxlength="12" required', aide: 'Ce qu’il vous reste à la fin du mois, après cotisations et frais, avant impôt sur le revenu.' })}
    ${champ({ nom: 'fraisMensuels', label: 'Frais professionnels par mois (€)', attrs: 'inputmode="decimal" maxlength="12"', aide: 'Logiciels, matériel, assurance, comptabilité, déplacements…' })}
    ${choisir({ nom: 'activite', label: 'Votre activité *', options: [['bic_services', 'Prestations de services commerciales ou artisanales (BIC)'], ['bnc_ssi', 'Profession libérale non réglementée (BNC, SSI)'], ['bnc_cipav', 'Profession libérale réglementée (BNC, Cipav)'], ['vente', 'Vente de marchandises (BIC)']] })}
    </div>
    ${coche({ nom: 'acre', label: 'Je bénéficie de l’Acre', aide: 'Taux minoré pour les créations à partir du {{acre_debut_regime}} : il ne dure qu’un temps, pensez à votre tarif une fois l’Acre terminée.' })}
    ${champ({ nom: 'debutActivite', label: 'Date de début d’activité (facultatif)', type: 'date', classe: 'si-acre' })}
    ${coche({ nom: 'vl', label: 'J’ai opté pour le versement forfaitaire libératoire de l’impôt' })}
    <h2 class="titre-form">Votre temps de travail</h2>
    <p class="aide">Ces valeurs sont des hypothèses de départ, à adapter à votre façon de travailler.</p>
    <div class="grille">
    ${champ({ nom: 'joursSemaine', label: 'Jours travaillés par semaine', attrs: 'inputmode="numeric" maxlength="1"' })}
    ${champ({ nom: 'semainesConges', label: 'Semaines de congés par an', attrs: 'inputmode="numeric" maxlength="2"' })}
    ${champ({ nom: 'joursFeries', label: 'Jours fériés non travaillés par an', attrs: 'inputmode="numeric" maxlength="2"', aide: 'Ceux qui tombent un jour où vous auriez travaillé.' })}
    ${champ({ nom: 'pourcentNonFacture', label: 'Temps non facturé (%)', attrs: 'inputmode="numeric" maxlength="2"', aide: 'Prospection, administratif, formation, projets sans facture.' })}
    ${champ({ nom: 'heuresJour', label: 'Heures facturées par jour', attrs: 'inputmode="decimal" maxlength="5"', aide: 'Pour passer du tarif journalier au tarif horaire.' })}
    </div>
  </div>
</form>

<section class="resultat" aria-labelledby="titre-resultat">
  <h2 id="titre-resultat">Votre tarif</h2>
  <div id="bilan" role="status" aria-live="polite"></div>
  <div id="resultat-zone"></div>
</section>
</div>

<div class="prose aide-page">
<h2>Comment le tarif est calculé</h2>
<ol>
<li>On additionne le revenu net visé sur l’année et vos frais.</li>
<li>Les cotisations étant un pourcentage du chiffre d’affaires, on en déduit le chiffre d’affaires nécessaire : <em>(net + frais) ÷ (1 − taux)</em>.</li>
<li>On compte vos jours disponibles (semaines travaillées × jours par semaine − jours fériés), puis la part facturée.</li>
<li>Le tarif journalier est le chiffre d’affaires divisé par les jours facturés, arrondi à l’euro supérieur ; le tarif horaire en découle.</li>
</ol>
<h2>Questions fréquentes</h2>
<h3>Pourquoi ne pas facturer simplement 5 jours par semaine toute l’année ?</h3>
<p>Parce qu’une partie de votre temps ne se facture pas : prospection, devis, comptabilité, formation, jours sans mission. Le calcul vous montre l’effet de chaque hypothèse sur le tarif nécessaire.</p>
<h3>Le tarif tient-il compte de l’impôt sur le revenu ?</h3>
<p>Non, sauf si vous avez choisi le versement libératoire, dont l’impôt est alors inclus dans le taux. Sinon, le revenu net visé est avant impôt sur le revenu.</p>
<h3>Et si mon tarif me fait dépasser le plafond ?</h3>
<p>Le calculateur vous prévient quand le chiffre d’affaires nécessaire dépasse le plafond de la micro-entreprise ({{plafond_ca_services}} en services) ou les seuils de franchise de TVA. Voir le guide <a href="/guides/plafonds-et-seuils-de-tva/">Plafonds et seuils de TVA</a>.</p>
</div>`;
}

export const FAQ_TJM = [
  ['Pourquoi ne pas facturer 5 jours par semaine toute l’année ?', 'Une partie de votre temps ne se facture pas : prospection, devis, comptabilité, formation. Le calcul montre l’effet de chaque hypothèse sur le tarif nécessaire.'],
  ['Le tarif tient-il compte de l’impôt sur le revenu ?', 'Non, sauf avec le versement libératoire, dont l’impôt est inclus dans le taux. Sinon, le revenu net visé est avant impôt sur le revenu.'],
  ['Comment le tarif journalier est-il calculé ?', 'Chiffre d’affaires nécessaire = (revenu net + frais) ÷ (1 − taux de cotisations), divisé par le nombre de jours facturés, arrondi à l’euro supérieur.'],
];
