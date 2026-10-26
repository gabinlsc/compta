// Comparateur de statuts : QUALITATIF (EI/micro-entreprise, EURL, SASU). Aucune comparaison de revenu net chiffrée : elle dépend de trop de paramètres pour être garantie.
// Source : service-public.gouv.fr F23844 (page vérifiée par la DILA le 10 avril 2026). Chiffres en jetons {{id}} de data/regles.json.
const LIGNES = [
  ['Pour qui ?', 'Exercer seul, démarrer vite et simplement, avec un chiffre d’affaires qui reste sous les plafonds.', 'Exercer seul en société, avec un associé unique, et séparer clairement l’entreprise de soi.', 'Exercer seul en société, avec un statut de dirigeant assimilé salarié.'],
  ['Création', 'La plus rapide : pas de statuts, pas de capital, pas d’annonce légale. Immatriculation gratuite en micro-entreprise ; {{ei_commerciale_cout}} pour une entreprise individuelle commerciale hors micro-entreprise.', 'Statuts à rédiger, capital, immatriculation ({{societe_immatriculation_cout}}), déclaration des bénéficiaires effectifs ({{beneficiaires_effectifs_cout}}) et annonce légale.', 'Statuts à rédiger, capital, immatriculation ({{societe_immatriculation_cout}}), déclaration des bénéficiaires effectifs ({{beneficiaires_effectifs_cout}}) et annonce légale.'],
  ['Capital', 'Non concerné.', 'Libre. Au moins {{eurl_liberation_numeraire}} des apports en numéraire à verser à la création, le solde dans les {{capital_liberation_delai_ans}} suivant l’immatriculation.', 'Libre. {{sas_liberation_numeraire}} de l’apport en numéraire versé à la création, le reste dans les {{capital_liberation_delai_ans}} suivant l’immatriculation.'],
  ['Protection du patrimoine', 'Patrimoine professionnel séparé du patrimoine personnel. En cas de fraude ou de manquements graves, l’administration fiscale et les organismes de sécurité sociale peuvent réclamer leurs dettes sur les deux patrimoines.', 'Responsabilité limitée au montant des apports. La responsabilité personnelle du dirigeant peut être engagée en cas de faute de gestion ou de caution personnelle.', 'Responsabilité limitée au montant des apports. La responsabilité personnelle du dirigeant peut être engagée en cas de faute de gestion ou de caution personnelle.'],
  ['Impôt sur les bénéfices', 'Impôt sur le revenu : régime de la micro-entreprise ou régime réel ; option possible pour l’impôt sur les sociétés.', 'Impôt sur le revenu (micro-entreprise ou régime réel) ou option pour l’impôt sur les sociétés.', 'Impôt sur les sociétés ; option possible pour l’impôt sur le revenu.'],
  ['Protection sociale du dirigeant', 'Régime micro-social : cotisations en pourcentage du chiffre d’affaires, aucune si le chiffre d’affaires est nul ; ou sécurité sociale des indépendants hors micro-entreprise.', 'Gérant affilié à la sécurité sociale des indépendants (travailleur non salarié).', 'Président affilié au régime général en tant que dirigeant assimilé salarié quand il est rémunéré ; charges sociales d’environ {{sasu_charges_sociales_approx}} de la rémunération brute, sans cotisation s’il n’est pas rémunéré.'],
  ['Comptabilité', 'Allégée en micro-entreprise : déclaration du chiffre d’affaires et livre des recettes. Pas de dépôt de comptes au greffe.', 'Comptes annuels (bilan, compte de résultat, annexe) à approuver dans les 6 mois de la clôture, puis à déposer au greffe du tribunal de commerce.', 'Comptes annuels (bilan, compte de résultat, annexe) à approuver dans les 6 mois de la clôture, puis à déposer au greffe du tribunal de commerce.'],
  ['Limites de chiffre d’affaires', 'Plafonds de la micro-entreprise : {{plafond_ca_vente}} pour la vente, {{plafond_ca_services}} pour les services et activités libérales (deux années de suite).', 'Aucun plafond propre à la forme juridique ; le régime de la micro-entreprise ne s’applique que dans les limites ci-contre.', 'Aucun plafond propre à la forme juridique.'],
];

export function pageStatuts() {
  const ligne = ([critere, a, b, c]) => `<tr><th scope="row">${critere}</th><td>${a}</td><td>${b}</td><td>${c}</td></tr>`;
  return `<p class="eyebrow">Comparatif · sans compte</p>
<h1>Micro-entreprise, EURL ou SASU : le comparatif</h1>
<p class="lead">Un tableau clair pour comparer les trois formes les plus courantes quand on se lance seul : démarches, capital, protection du patrimoine, impôt, protection sociale et comptabilité. Pas de chiffres de revenu net : ils dépendent de trop de paramètres pour être comparés honnêtement.</p>
<p class="notice info"><strong>À lire avant de choisir.</strong> Ce comparatif est qualitatif et ne remplace ni l’avis d’un expert-comptable ni les simulateurs officiels (notamment celui de l’Urssaf pour comparer les cotisations). Source unique : <a href="https://entreprendre.service-public.gouv.fr/vosdroits/F23844" rel="noopener">service-public.gouv.fr</a>, page vérifiée par la DILA le 10 avril 2026.</p>

<div class="table-wrap"><table class="statuts">
<caption class="sr-only">Comparatif de la micro-entreprise, de l’EURL et de la SASU</caption>
<thead><tr><th scope="col">Critère</th><th scope="col">Micro-entreprise (EI)</th><th scope="col">EURL</th><th scope="col">SASU</th></tr></thead>
<tbody>
${LIGNES.map(ligne).join('\n')}
</tbody></table></div>

<div class="prose">
<h2>Comment choisir ?</h2>
<p>Quelques questions aident à orienter la réflexion, sans remplacer un conseil personnalisé :</p>
<ul>
<li><strong>Combien comptez-vous facturer ?</strong> En micro-entreprise, le chiffre d’affaires est plafonné ; au-delà, il faut changer de régime ou de forme. Le <a href="/outils/simulateur-revenu-net/">simulateur de revenu net</a> montre où vous en êtes.</li>
<li><strong>Avez-vous des charges importantes ?</strong> En micro-entreprise, les cotisations sont un pourcentage du chiffre d’affaires, quelles que soient vos charges. Les formes soumises au régime réel tiennent compte des dépenses.</li>
<li><strong>Voulez-vous séparer l’entreprise de vous-même ?</strong> Une société limite la responsabilité aux apports, mais impose plus de formalités et de coûts.</li>
<li><strong>Quelle protection sociale visez-vous ?</strong> Le statut du dirigeant (indépendant ou assimilé salarié) change la nature de la protection et son coût.</li>
</ul>
<p>La forme juridique peut être modifiée en cours de vie de l’entreprise, mais ce choix a des conséquences importantes sur les obligations fiscales et sociales.</p>
<h2>Questions fréquentes</h2>
<h3>Pourquoi ne pas comparer le revenu net de chaque statut ?</h3>
<p>Parce que le résultat dépend de votre chiffre d’affaires, de vos charges, de votre rémunération, de votre situation familiale et fiscale. Une comparaison chiffrée générale serait trompeuse : pour comparer vos cotisations, utilisez le simulateur officiel de l’Urssaf ou demandez à un expert-comptable.</p>
<h3>La micro-entreprise est-elle une forme juridique ?</h3>
<p>Non : c’est un régime fiscal et social simplifié de l’entreprise individuelle (EI). Vous exercez en nom propre.</p>
<h3>Et pour une profession libérale réglementée ?</h3>
<p>Des règles propres à la profession s’ajoutent (ordre professionnel, structures d’exercice spécifiques). Ce comparatif ne couvre pas ce cas : consultez la fiche officielle sur la forme juridique.</p>
</div>`;
}

export const FAQ_STATUTS = [
  ['Pourquoi ne pas comparer le revenu net de chaque statut ?', 'Le résultat dépend du chiffre d’affaires, des charges, de la rémunération et de la situation fiscale : une comparaison chiffrée générale serait trompeuse. Pour comparer vos cotisations, utilisez le simulateur officiel de l’Urssaf ou demandez à un expert-comptable.'],
  ['La micro-entreprise est-elle une forme juridique ?', 'Non : c’est un régime fiscal et social simplifié de l’entreprise individuelle (EI). Vous exercez en nom propre.'],
  ['Peut-on changer de forme juridique ?', 'Oui, la forme juridique peut être modifiée en cours de vie de l’entreprise, mais le choix initial a des conséquences importantes sur les obligations fiscales et sociales.'],
];
