// Guide « CFE : qui la paie ? ». Règles lues sur service-public.gouv.fr (F23999, F23547). Chiffres en jetons {{id}}.
export const GUIDE_CFE = {
  slug: 'cfe-qui-la-paie',
  titre: 'CFE : qui la paie ?',
  titreLong: 'CFE : qui la paie et quand ?',
  description: 'Cotisation foncière des entreprises du micro-entrepreneur : exonération la première année, seuil de chiffre d’affaires, date de paiement et déclaration initiale.',
  resume: 'La cotisation foncière des entreprises, exonérations comprises.',
  publie: '2026-10-26', miseAJour: '2026-10-26',
  corps: `<p class="lead">La cotisation foncière des entreprises (CFE) est un impôt local que les micro-entrepreneurs paient comme les autres entreprises, sauf exonération. La première année, vous ne payez rien, mais il y a une déclaration à faire. Voici qui est concerné, quand payer, et ce qu’il faut déposer.</p>
<p class="notice info"><strong>Les dates dans votre agenda.</strong> Le <a href="/outils/calendrier-echeances/">calendrier des échéances</a> ajoute la déclaration de la première année puis le paiement chaque 15 décembre.</p>

<h2>En bref</h2>
<ul>
<li>Le micro-entrepreneur est soumis à la CFE <strong>dans les mêmes conditions que toute autre entreprise</strong>.</li>
<li><strong>Première année d’activité : exonération</strong>, quelle que soit la date de création. Il faut tout de même déposer une déclaration initiale avant le {{cfe_declaration_creation}} de l’année de création.</li>
<li>L’année suivante, la base d’imposition est <strong>réduite de {{cfe_reduction_deuxieme_annee}}</strong>.</li>
<li>Exonération aussi si votre chiffre d’affaires de l’année N-2 n’a pas dépassé <strong>{{cfe_exoneration_ca_max}}</strong>.</li>
<li>Paiement en général au plus tard le <strong>{{cfe_paiement}}</strong>.</li>
</ul>

<h2>Qui doit la payer ?</h2>
<p>L’activité doit être exercée en France, à titre professionnel, de manière habituelle et indépendante. Pour la location ou sous-location d’immeubles, des conditions supplémentaires de chiffre d’affaires s’ajoutent : au moins {{cfe_location_nue_ca_min}} pour les immeubles nus (hors habitation), plus de {{cfe_location_meublee_ca_min}} pour les immeubles meublés, sauf logement inclus dans la résidence principale du propriétaire.</p>

<h2>Les exonérations</h2>
<ul>
<li><strong>La première année d’activité</strong>, quelle que soit la date de création. Vous n’avez rien à payer.</li>
<li><strong>Un chiffre d’affaires faible</strong> : vous êtes exonéré de CFE l’année N lorsque votre chiffre d’affaires de l’année N-2 n’a pas dépassé {{cfe_exoneration_ca_max}}.</li>
<li><strong>Certaines activités</strong> : par exemple un artisan travaillant seul (ou avec une main-d’œuvre très réduite : famille, apprenti), un artiste-auteur (hors auteurs de logiciels), un sportif, un exploitant agricole ou, sous conditions, un chauffeur de taxi ou d’ambulance. La liste complète figure sur la fiche officielle de la CFE.</li>
</ul>
<p>La première année d’imposition, c’est-à-dire l’année qui suit celle de la création, la base d’imposition est réduite de {{cfe_reduction_deuxieme_annee}}.</p>

<h2>La déclaration initiale de la première année</h2>
<p>Pour bénéficier de l’exonération de la première année, déposez la <strong>déclaration initiale 1447-C-SD</strong> (cerfa n° 14187*16) <strong>au plus tard le {{cfe_declaration_creation}} de l’année de création</strong>. Elle s’envoie par voie postale au service des impôts des entreprises dont vous dépendez. Même si vous ne payez rien, ne l’oubliez pas.</p>

<h2>Comment la CFE est-elle calculée ?</h2>
<p>La CFE dépend de la valeur locative des biens immobiliers affectés à l’activité si vous disposez d’un local ou d’un terrain, avec un taux qui varie selon la commune. Si vous travaillez chez vous ou chez vos clients, la CFE est calculée sur une <strong>base minimum</strong>, elle aussi variable selon la commune, qui dépend du chiffre d’affaires réalisé en N-2 : en 2026, entre {{cfe_base_minimum_basse_min}} et {{cfe_base_minimum_basse_max}} si ce chiffre d’affaires est inférieur ou égal à {{cfe_base_minimum_basse_ca}}, entre {{cfe_base_minimum_basse_min}} et {{cfe_base_minimum_moyenne_max}} jusqu’à {{cfe_base_minimum_moyenne_ca}}. À la CFE s’ajoutent une taxe additionnelle de {{cfe_taxe_additionnelle}} de la base d’imposition et des frais de gestion de {{cfe_frais_gestion}} du total de la CFE et de la taxe additionnelle.</p>

<h2>Quand et comment payer ?</h2>
<p>L’avis d’imposition est dématérialisé : vous le trouvez dans votre compte fiscal en ligne sur impots.gouv.fr, avec le montant et la date limite. Pour une CFE inférieure ou égale à {{cfe_seuil_paiement_simple}}, le paiement se fait en général <strong>au plus tard le {{cfe_paiement}}</strong>. Si cette date tombe un samedi, un dimanche ou un jour férié, elle est reportée au premier jour ouvrable suivant. Vous pouvez payer en ligne, ou opter pour le prélèvement mensuel (le 15 de janvier à octobre, option jusqu’au {{cfe_option_prelevement_mensuel}}) ou le prélèvement à l’échéance (option jusqu’au {{cfe_option_prelevement_echeance}}).</p>
<p>Attention : la <strong>taxe additionnelle à la CFE</strong> (taxe pour frais de chambre consulaire) se paie, pour un micro-entrepreneur, sur le site de l’Urssaf, et non avec la CFE.</p>

<h2>Questions fréquentes</h2>
<h3>Je viens de créer mon activité : dois-je payer la CFE cette année ?</h3>
<p>Non, vous êtes exonéré la première année. Déposez simplement la déclaration initiale 1447-C-SD avant le {{cfe_declaration_creation}}.</p>
<h3>Mon avis d’imposition ne ressemble pas à mes calculs.</h3>
<p>Le montant dépend de votre commune et, selon le cas, de la valeur locative de votre local ou de la base minimum. C’est l’avis d’imposition qui fait foi.</p>
<h3>Je ne reçois pas d’avis papier.</h3>
<p>C’est normal : les avis sont dématérialisés et consultables dans l’espace professionnel de impots.gouv.fr.</p>`,
  faq: [
    ['Dois-je payer la CFE la première année ?', 'Non : le micro-entrepreneur est exonéré la première année d’activité, mais doit déposer la déclaration initiale 1447-C-SD avant le {{cfe_declaration_creation}} de l’année de création.'],
    ['Quand payer la CFE ?', 'En général au plus tard le {{cfe_paiement}} (si le montant est inférieur ou égal à {{cfe_seuil_paiement_simple}}) ; la date est reportée au premier jour ouvrable suivant si elle tombe un week-end ou un jour férié.'],
    ['Qui est exonéré de CFE ?', 'Notamment les entreprises la première année, celles dont le chiffre d’affaires de l’année N-2 n’a pas dépassé {{cfe_exoneration_ca_max}}, et certaines activités (artisan travaillant seul, artiste-auteur, sportif, exploitant agricole…).'],
  ],
  sources: [
    ['Le micro-entrepreneur doit-il payer la CFE ?, service-public.gouv.fr (page vérifiée par la DILA le 26 mars 2026)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F23999'],
    ['Cotisation foncière des entreprises (CFE), service-public.gouv.fr (page vérifiée par la DILA le 2 avril 2026)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F23547'],
  ],
  outil: ['/outils/calendrier-echeances/', 'Calendrier des échéances'],
};
