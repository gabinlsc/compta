// Guide « Facturation électronique » : calendrier lu sur service-public.gouv.fr (A15683, A18953, F31808). Dates en jetons {{id}}.
export const GUIDE_FE = {
  slug: 'facturation-electronique',
  titre: 'Facturation électronique : ce qui change',
  titreLong: 'Facturation électronique : ce qui change en 2026-2027',
  description: 'Réception obligatoire pour toutes les entreprises dès 2026, émission pour les micro-entreprises en 2027 : calendrier, plateforme agréée et nouvelles mentions.',
  resume: 'Le calendrier et ce que cela implique pour un micro-entrepreneur.',
  publie: '2026-10-26', miseAJour: '2026-10-26',
  corps: `<p class="lead">La facturation électronique devient la règle entre entreprises. Pour un micro-entrepreneur, deux dates comptent : <strong>{{fe_reception_obligatoire}}</strong> pour pouvoir recevoir des factures électroniques, et <strong>{{fe_emission_micro}}</strong> pour en émettre. Voici ce que cela change et comment s’y préparer.</p>
<p class="notice info"><strong>Dans vos agendas.</strong> Le <a href="/outils/calendrier-echeances/">calendrier des échéances</a> peut inclure ces deux dates, avec des rappels.</p>

<h2>En bref</h2>
<ul>
<li>Depuis le <strong>{{fe_reception_obligatoire}}</strong>, toutes les entreprises doivent être en mesure de <strong>recevoir</strong> des factures électroniques.</li>
<li>L’obligation d’<strong>émettre</strong> est progressive : dès le {{fe_emission_grandes_entreprises}} pour les grandes entreprises et les entreprises de taille intermédiaire, à partir du <strong>{{fe_emission_micro}}</strong> pour les PME et les <strong>micro-entreprises</strong>.</li>
<li>Les factures passent par une <strong>plateforme agréée par l’État</strong>, que chaque entreprise choisit librement.</li>
<li>De <strong>nouvelles mentions</strong> s’ajoutent aux factures.</li>
</ul>

<h2>Qui et quelles opérations sont concernés ?</h2>
<p>La facturation électronique concerne les achats et ventes de biens ou de prestations de services réalisés <strong>entre entreprises établies en France et assujetties à la TVA</strong>, ainsi que les acomptes qui s’y rapportent. Elle ne concerne <strong>pas</strong> les opérations avec des particuliers ni avec des clients établis à l’étranger. Pour ces opérations, ce sont les <strong>données de transaction</strong> qui doivent être transmises à l’administration fiscale : c’est l’« e-reporting », qui suit le même calendrier.</p>
<p>Une même entreprise peut donc être soumise aux deux obligations, selon la nature de ses opérations : facturation électronique pour ses clients professionnels, e-reporting pour ses clients particuliers.</p>

<h2>Le calendrier</h2>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Date</th><th scope="col">Ce qui s’applique</th></tr></thead>
<tbody>
<tr><th scope="row">{{fe_reception_obligatoire}}</th><td>Toutes les entreprises doivent pouvoir recevoir des factures électroniques. Grandes entreprises et entreprises de taille intermédiaire : émission obligatoire.</td></tr>
<tr><th scope="row">{{fe_emission_micro}}</th><td>PME et micro-entreprises : émission obligatoire des factures électroniques et e-reporting.</td></tr>
</tbody></table></div>

<h2>Choisir une plateforme agréée</h2>
<p>À partir du {{fe_emission_grandes_entreprises}}, les entreprises transmettent leurs factures par l’intermédiaire d’une <strong>plateforme agréée par l’État</strong>, directement ou au travers d’une solution compatible. Chaque entreprise désigne la plateforme qui lui permet d’émettre et de recevoir ses factures électroniques ou de déclarer ses données. La liste des plateformes agréées immatriculées par l’administration fiscale est publiée sur impots.gouv.fr. En tant que micro-entrepreneur, vous avez jusqu’à {{fe_emission_micro}} pour être prêt à émettre ; il est utile de choisir votre plateforme dès maintenant, puisque la réception est déjà obligatoire.</p>

<h2>Les nouvelles mentions sur vos factures</h2>
<p>Quatre mentions s’ajoutent, à partir du {{fe_emission_grandes_entreprises}} pour les grandes entreprises et les entreprises de taille intermédiaire, et du <strong>{{fe_emission_micro}}</strong> pour les PME et les micro-entreprises :</p>
<ul>
<li>le <strong>numéro SIREN du client</strong>, lorsqu’il s’agit d’une entreprise ;</li>
<li>l’<strong>adresse de livraison</strong> des biens, si elle est différente de l’adresse de facturation ;</li>
<li>la <strong>nature des opérations</strong> facturées : livraisons de biens, prestations de services, ou les deux ;</li>
<li>la mention « Option pour le paiement de la taxe d’après les débits », si vous avez opté pour ce mode de paiement de la TVA.</li>
</ul>
<p>L’outil <a href="/outils/facture-auto-entrepreneur/">Devis et factures</a> vous les fait déjà renseigner : il conseille le SIREN du client dès maintenant et l’exigera à partir de la date légale. Voir aussi le guide sur les <a href="/guides/mentions-obligatoires-facture/">mentions obligatoires</a>.</p>

<h2>Comment se préparer ?</h2>
<ol>
<li><strong>Faire l’état des lieux</strong> : qui sont vos clients professionnels, comment facturez-vous aujourd’hui ?</li>
<li><strong>Choisir une plateforme agréée</strong> et la désigner pour recevoir vos factures.</li>
<li><strong>Collecter le SIREN</strong> de vos clients professionnels.</li>
<li><strong>Adapter vos modèles de facture</strong> aux nouvelles mentions.</li>
</ol>
<p>La direction générale des finances publiques propose un guide pratique de démarrage et une FAQ destinée aux PME et aux micro-entreprises, ainsi qu’une page « Je passe à la facturation électronique » sur impots.gouv.fr.</p>

<h2>Questions fréquentes</h2>
<h3>Dois-je déjà émettre des factures électroniques ?</h3>
<p>Pas encore si vous êtes micro-entrepreneur : l’obligation d’émettre s’applique à vous à partir du {{fe_emission_micro}}. En revanche, la réception est obligatoire depuis le {{fe_reception_obligatoire}}.</p>
<h3>Et mes clients particuliers ?</h3>
<p>Vous n’émettez pas de facture électronique pour eux, mais les données de ces transactions devront être transmises à l’administration (e-reporting).</p>
<h3>Mon PDF suffira-t-il après 2027 ?</h3>
<p>D’après le calendrier officiel, pas pour vos clients professionnels établis en France : leurs factures devront passer par une plateforme agréée. Le PDF que vous créez avec l’outil reste utile pour vos clients particuliers et pour vos archives.</p>`,
  faq: [
    ['Dois-je déjà émettre des factures électroniques ?', 'Pas encore si vous êtes micro-entrepreneur : l’obligation d’émettre s’applique à partir du {{fe_emission_micro}}. La réception est obligatoire depuis le {{fe_reception_obligatoire}}.'],
    ['La facturation électronique concerne-t-elle mes clients particuliers ?', 'Non : les opérations avec des particuliers ne sont pas concernées par la facture électronique, mais leurs données doivent être transmises à l’administration (e-reporting).'],
    ['Quelles mentions s’ajoutent aux factures ?', 'Le SIREN du client, l’adresse de livraison si elle diffère, la nature des opérations et, le cas échéant, l’option pour le paiement de la taxe d’après les débits.'],
  ],
  sources: [
    ['Facturation électronique : c’est pour bientôt !, service-public.gouv.fr (actualité du 19 janvier 2026, mise à jour le 27 février 2026)', 'https://entreprendre.service-public.gouv.fr/actualites/A15683'],
    ['La facturation électronique est effective depuis le {{fe_reception_obligatoire}} !, service-public.gouv.fr (actualité du 2 septembre 2026)', 'https://entreprendre.service-public.gouv.fr/actualites/A18953'],
    ['Mentions obligatoires sur une facture, service-public.gouv.fr (page vérifiée par la DILA le 11 août 2026)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F31808'],
  ],
  outil: ['/outils/facture-auto-entrepreneur/', 'Devis et factures'],
};
