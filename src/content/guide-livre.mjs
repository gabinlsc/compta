// Guide « Le livre des recettes : à quoi ça sert ». Règles lues sur service-public.gouv.fr (F23266, F36018) ; chiffres en jetons {{id}}.
export const GUIDE_LIVRE = {
  slug: 'livre-des-recettes-a-quoi-ca-sert',
  titre: 'Le livre des recettes : à quoi ça sert',
  titreLong: 'Le livre des recettes du micro-entrepreneur',
  description: 'Ce que doit contenir le livre des recettes, comment le tenir, combien de temps le garder et ce qu’on risque en cas de faux.',
  resume: 'Une obligation simple à comprendre et à tenir.',
  publie: '2026-10-26', miseAJour: '2026-10-26',
  corps: `<p class="lead">Le livre des recettes est le seul registre que presque tous les micro-entrepreneurs doivent tenir. Il sert à garder une trace de ce que vous encaissez, et à retrouver le chiffre d’affaires à déclarer à l’Urssaf. Voici ce qu’il contient et comment le tenir sans y passer du temps.</p>
<p class="notice info"><strong>Prêt à l’emploi.</strong> L’outil <a href="/outils/livre-des-recettes/">Livre des recettes</a> classe vos encaissements, calcule les totaux par période de déclaration, surveille le plafond et exporte le tout en CSV.</p>

<h2>En bref</h2>
<ul>
<li>Vous inscrivez <strong>chronologiquement</strong> chaque recette encaissée : son montant et son <strong>origine</strong> (le client ou la société qui vous a payé).</li>
<li>Vous indiquez le <strong>mode de règlement</strong>, en distinguant les espèces des autres règlements, et la <strong>référence de la pièce justificative</strong> (numéro de facture).</li>
<li>Vous faites le <strong>total tous les 3 mois</strong>.</li>
<li>Vous conservez le livre et les pièces <strong>{{livre_conservation_ans}}</strong> à partir de la clôture de l’exercice.</li>
</ul>

<h2>Que contient-il ?</h2>
<p>Le livre recense le montant et l’origine des recettes que vous percevez, au fil de leur encaissement. Pour chaque ligne :</p>
<ul>
<li><strong>le montant et l’origine</strong> de la recette : l’identité du client ou de la société mandataire ;</li>
<li><strong>le mode de règlement</strong> : chèque, espèces ou autres (carte bancaire, virement) ;</li>
<li><strong>la référence de la pièce justificative</strong>, par exemple la numérotation des factures ou des notes ;</li>
<li>pour une activité libérale, <strong>la date et la forme du versement</strong> des honoraires.</li>
</ul>
<p>Pour les ventes au détail et les services rendus à des particuliers, vous pouvez inscrire les informations <strong>globalement en fin de journée</strong> quand chaque montant est inférieur à {{livre_seuil_global_euros}}.</p>

<h2>Les écritures ne se modifient pas</h2>
<p>Une fois enregistrées, les écritures ne peuvent pas être modifiées. Si vous vous trompez, vous ajoutez une écriture qui annule la première, puis vous saisissez la bonne. C’est exactement ce que fait le bouton « Corriger » de l’outil.</p>

<h2>Comment le tenir ?</h2>
<p>Vous avez le choix entre des livres comptables papier achetés dans le commerce, des modèles officiels à télécharger et à remplir, ou un logiciel comptable. Le livre des recettes peut aussi être tenu <strong>sous forme électronique</strong>, à condition d’être identifié et daté au moment où il est établi, par des moyens offrant toute garantie de preuve. Pensez à exporter régulièrement votre livre : l’outil propose un export CSV et un export JSON.</p>

<h2>Et le registre des achats ?</h2>
<p>Il n’est exigé que si votre activité consiste à vendre des marchandises, des objets, des fournitures ou des denrées, ou à fournir un logement. Les prestataires de services en sont dispensés. Il récapitule chronologiquement, par année, le détail de vos achats : date et mode de paiement, référence de la pièce justificative et montant.</p>

<h2>Combien de temps le garder ? Et si on ne le tient pas ?</h2>
<p>Le livre des recettes et les pièces justificatives se conservent <strong>{{livre_conservation_ans}}</strong> à partir de la clôture de l’exercice comptable concerné.</p>
<p>Le fait de ne pas tenir le livre des recettes n’est pas sanctionné. En revanche, <strong>le faux et l’usage de faux</strong> le sont : inscrire de fausses informations ou présenter un registre falsifié, par exemple pour obtenir un prêt, vous expose à {{livre_faux_prison_ans}} d’emprisonnement et {{livre_faux_amende_euros}} d’amende. Tenir son livre reste surtout votre meilleure défense en cas de question sur votre chiffre d’affaires.</p>

<h2>Lien avec votre déclaration</h2>
<p>Le total d’un mois ou d’un trimestre est le chiffre d’affaires à déclarer à l’Urssaf avant la date limite. Voir le guide <a href="/guides/declarer-son-chiffre-d-affaires/">Déclarer son chiffre d’affaires</a>. Si vous exercez une activité libérale et bénéficiez de la franchise en base de TVA, vous devez aussi tenir un registre par année des achats de biens et de services et un livre journal détaillant jour par jour vos recettes professionnelles, et conserver les factures et autres pièces justificatives.</p>

<h2>Questions fréquentes</h2>
<h3>Un paiement reçu en janvier pour une facture de décembre va-t-il dans quelle année ?</h3>
<p>Dans l’année de l’encaissement : le livre enregistre les recettes encaissées, à la date où vous les percevez.</p>
<h3>Faut-il y inscrire la TVA ?</h3>
<p>En franchise en base de TVA, il n’y en a pas : le montant inscrit est le montant encaissé.</p>
<h3>Mon livre peut-il être sur un tableur ?</h3>
<p>Un livre électronique est admis s’il est identifié et daté au moment de son établissement par des moyens offrant toute garantie de preuve. Un tableur modifiable sans trace n’offre pas cette garantie : c’est pourquoi l’outil conserve les écritures et ne permet de les corriger que par une écriture inverse.</p>`,
  faq: [
    ['Un livre des recettes est-il obligatoire ?', 'Oui, le micro-entrepreneur doit tenir un livre des recettes, mais le fait de ne pas le tenir n’est pas sanctionné ; en revanche, un faux dans un registre l’est.'],
    ['Combien de temps garder le livre des recettes ?', 'Dix ans à partir de la clôture de l’exercice comptable concerné, comme les pièces justificatives.'],
    ['Une écriture peut-elle être modifiée ?', 'Non : une fois enregistrée, elle ne se modifie pas. On ajoute une écriture inverse puis la bonne écriture.'],
  ],
  sources: [
    ['Obligations comptables du micro-entrepreneur, service-public.gouv.fr (page vérifiée par la DILA le 7 septembre 2026)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F23266'],
    ['Registres obligatoires du micro-entrepreneur, service-public.gouv.fr (page vérifiée par la DILA le 21 février 2026)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F36018'],
  ],
  outil: ['/outils/livre-des-recettes/', 'Livre des recettes'],
};
