// Guide « Plafonds et seuils de TVA » : chaque chiffre est un jeton {{id}} de data/regles.json ; chaque règle vient d'une page officielle citée en bas.
export const GUIDE_PLAFONDS = {
  slug: 'plafonds-et-seuils-de-tva',
  titre: 'Plafonds et seuils de TVA',
  titreLong: 'Plafonds de chiffre d’affaires et seuils de TVA',
  description: 'Jusqu’où rester micro-entrepreneur et en franchise de TVA : plafonds de chiffre d’affaires, seuils de base et majorés, première année, dépassement.',
  resume: 'Jusqu’où rester en micro-entreprise et en franchise de TVA.',
  publie: '2026-10-26', miseAJour: '2026-10-26',
  corps: `<p class="lead">Deux limites de chiffre d’affaires existent pour un micro-entrepreneur, et on les confond souvent : celle qui vous garde dans le régime de la micro-entreprise, et celle qui vous dispense de facturer la TVA. Voici les valeurs de 2026 et les règles pour les calculer.</p>
<p class="notice info"><strong>Voir où vous en êtes.</strong> Le <a href="/outils/simulateur-revenu-net/">simulateur de revenu net</a> compare votre chiffre d’affaires à ces limites et vous prévient quand vous vous en approchez.</p>

<h2>En bref</h2>
<ul>
<li><strong>Plafond de la micro-entreprise :</strong> {{plafond_ca_vente}} pour la vente de marchandises, {{plafond_ca_services}} pour les prestations de services et les activités libérales.</li>
<li><strong>Franchise de TVA (vente) :</strong> {{tva_franchise_vente}}, seuil majoré à {{tva_majore_vente}}.</li>
<li><strong>Franchise de TVA (services) :</strong> {{tva_franchise_services}}, seuil majoré à {{tva_majore_services}}.</li>
<li>Pour 2026, les seuils de franchise de TVA sont inchangés ; le seuil unique de 25 000 € envisagé a été abandonné.</li>
</ul>

<h2>Le plafond de la micro-entreprise</h2>
<p>Le régime de la micro-entreprise s’applique tant que votre chiffre d’affaires annuel, <strong>effectivement encaissé au cours de l’année civile</strong>, ne dépasse pas un certain seuil. Ce seuil varie selon la nature de l’activité. En 2026 :</p>
<ul>
<li><strong>{{plafond_ca_vente}}</strong> pour une activité commerciale de vente de marchandises (hors location meublée) ;</li>
<li><strong>{{plafond_ca_services}}</strong> pour les prestations de services (BIC) et les activités libérales (BNC).</li>
</ul>
<p>Dépasser le plafond une seule année ne vous fait pas sortir du régime. Ce sont <strong>deux années de suite</strong> qui comptent : pour bénéficier du régime au 1<sup>er</sup> janvier de l’année N, le chiffre d’affaires HT réalisé en N-1 ou en N-2 ne doit pas avoir dépassé le seuil. Si le seuil est dépassé deux années consécutives, vous basculez dès le 1<sup>er</sup> janvier suivant dans le régime des travailleurs indépendants classiques, avec des cotisations calculées au réel.</p>

<h3>Activité mixte</h3>
<p>Si vous vendez des marchandises <em>et</em> vous réalisez des prestations de services, le chiffre d’affaires global ne doit pas dépasser le plafond de la vente, et la part des prestations ne doit pas dépasser celui des services. Il faut donc tenir une comptabilité qui sépare les deux.</p>

<h3>La première année</h3>
<p>Si vous créez votre activité en cours d’année, le seuil est ajusté au prorata de votre temps d’exploitation : (seuil de l’année × nombre de jours d’existence) / 365. Exemple officiel : une activité de vente créée le 31 janvier 2026 dispose de 335 jours, soit (203 100 € × 335) / 365 = 186 407 € pour 2026. Dès la deuxième année, le seuil complet s’applique.</p>

<h2>La franchise en base de TVA</h2>
<p>La franchise en base vous dispense de déclarer et de payer la TVA. Vous écrivez alors « TVA non applicable » sur vos factures (voir le guide sur les <a href="/guides/mentions-obligatoires-facture/">mentions obligatoires</a>). Elle dépend de deux seuils :</p>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Activité</th><th scope="col">Seuil de base</th><th scope="col">Seuil majoré</th></tr></thead>
<tbody>
<tr><th scope="row">Vente de marchandises</th><td>{{tva_franchise_vente}}</td><td>{{tva_majore_vente}}</td></tr>
<tr><th scope="row">Prestations de services</th><td>{{tva_franchise_services}}</td><td>{{tva_majore_services}}</td></tr>
</tbody></table></div>
<ul>
<li>Vous gardez la franchise si votre chiffre d’affaires de l’<strong>année précédente</strong> (N-1) est inférieur ou égal au seuil de base.</li>
<li>Si vous dépassez le seuil de base, vous restez en franchise jusqu’à la fin de l’année <strong>tant que votre chiffre d’affaires de l’année en cours (N) ne dépasse pas le seuil majoré</strong>.</li>
<li>Si vous dépassez le seuil majoré, vous êtes soumis à la TVA <strong>dès le jour du dépassement</strong>.</li>
<li>Si le seuil de base a été dépassé sur l’année précédente, la TVA s’applique dès le 1<sup>er</sup> janvier suivant.</li>
</ul>
<p>Exemple officiel (prestations de services) : 24 000 € de chiffre d’affaires en 2025 (sous 37 500 €), puis 38 500 € en 2026. Le seuil de base est dépassé, mais pas le seuil majoré de 41 250 € : la franchise continue jusqu’au 31 décembre 2026.</p>
<p>La première année, comme pour le plafond, le chiffre d’affaires est ramené à une année complète au prorata du temps d’activité avant d’être comparé aux seuils. Les seuils de TVA diffèrent aussi pour certaines activités réglementées : consultez la page officielle si vous n’êtes pas dans les cas courants.</p>

<h2>Ne pas confondre les deux</h2>
<p>Dépasser le seuil de TVA ne vous fait pas quitter la micro-entreprise : vous continuez à déclarer votre chiffre d’affaires à l’Urssaf, mais vous devez facturer et reverser la TVA. Inversement, vous pouvez rester sous le plafond de la micro-entreprise tout en dépassant le seuil de TVA, surtout en prestations de services, où l’écart entre les deux est grand.</p>

<h2>Questions fréquentes</h2>
<h3>Le chiffre d’affaires compte-t-il facturé ou encaissé ?</h3>
<p>Pour le plafond de la micro-entreprise, c’est le chiffre d’affaires effectivement encaissé au cours de l’année civile qui compte.</p>
<h3>Que se passe-t-il si je dépasse le plafond une seule année ?</h3>
<p>Rien ne change : le régime n’est perdu que si le seuil est dépassé deux années consécutives.</p>
<h3>Le simulateur utilise-t-il ces mêmes chiffres ?</h3>
<p>Oui. Il lit les mêmes données que cette page, listées avec leur source sur la page <a href="/sources/">Sources</a>.</p>`,
  faq: [
    ['Le chiffre d’affaires compte-t-il facturé ou encaissé ?', 'Pour le plafond de la micro-entreprise, c’est le chiffre d’affaires effectivement encaissé au cours de l’année civile qui compte.'],
    ['Que se passe-t-il si je dépasse le plafond une seule année ?', 'Rien ne change : le régime n’est perdu que si le seuil est dépassé deux années consécutives.'],
    ['Dépasser le seuil de TVA me fait-il quitter la micro-entreprise ?', 'Non : vous restez micro-entrepreneur, mais vous devez facturer et reverser la TVA.'],
  ],
  sources: [
    ['Conséquences du dépassement des seuils de chiffre d’affaires d’un micro-entrepreneur, service-public.gouv.fr (page vérifiée par la DILA le 21 février 2026)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F32353'],
    ['Franchise en base de TVA, service-public.gouv.fr (page vérifiée par la DILA le 1er janvier 2026)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F21746'],
    ['Régime fiscal de la micro-entreprise, service-public.gouv.fr (page vérifiée par la DILA le 13 mai 2026)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F23267'],
    ['Cotisations sociales d’un micro-entrepreneur, service-public.gouv.fr (page vérifiée par la DILA le 1er janvier 2026)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F36232'],
  ],
  outil: ['/outils/simulateur-revenu-net/', 'Simulateur de revenu net'],
};
