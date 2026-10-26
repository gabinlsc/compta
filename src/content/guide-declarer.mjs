// Guide « Déclarer son chiffre d'affaires » : jetons {{id}} de data/regles.json ; règles lues sur service-public.gouv.fr (F23257, F36232, F36244).
export const GUIDE_DECLARER = {
  slug: 'declarer-son-chiffre-d-affaires',
  titre: 'Déclarer son chiffre d’affaires',
  titreLong: 'Déclarer son chiffre d’affaires de micro-entrepreneur',
  description: 'Mensuel ou trimestriel : dates limites, première déclaration, ce qu’il faut déclarer, déclaration à zéro et conséquences d’un oubli.',
  resume: 'Mensuel ou trimestriel : dates, démarches et erreurs à éviter.',
  publie: '2026-10-26', miseAJour: '2026-10-26',
  corps: `<p class="lead">Un micro-entrepreneur déclare son chiffre d’affaires à l’Urssaf, chaque mois ou chaque trimestre, et paie ses cotisations en même temps. Voici les dates, la méthode, et ce qui se passe en cas d’oubli.</p>
<p class="notice info"><strong>Ne ratez plus une date.</strong> Le <a href="/outils/calendrier-echeances/">calendrier des échéances</a> crée le fichier pour votre agenda, avec des rappels, selon que vous déclarez chaque mois ou chaque trimestre.</p>

<h2>En bref</h2>
<ul>
<li>Vous déclarez <strong>tous les mois</strong> (automatiquement) ou <strong>tous les trimestres</strong> (sur demande), en ligne sur le site de l’Urssaf.</li>
<li>La déclaration est <strong>obligatoire même si votre chiffre d’affaires est nul</strong> : vous écrivez « Néant ».</li>
<li>Vous déclarez ce que vous avez <strong>encaissé</strong>, hors taxes, sans déduire vos charges.</li>
<li>Un oubli coûte {{decl_penalite_euros}} par déclaration manquante, plus une majoration de vos cotisations.</li>
</ul>

<h2>Mensuel ou trimestriel ?</h2>
<p>Par défaut, la déclaration est mensuelle. L’option pour une déclaration tous les 3 mois doit être prise <strong>dans le mois qui suit le début de l’activité</strong> ; elle vaut pour l’année civile et se reconduit tacitement l’année suivante. Pour revenir à la déclaration mensuelle, il faut le demander <strong>avant le {{decl_retour_mensuel_limite}}</strong> de l’année précédant celle où vous voulez changer : pour modifier la périodicité en 2027, la demande devait être faite avant le 31 octobre 2026.</p>

<h2>Les dates limites</h2>
<p>Les déclarations se font avant la fin du mois suivant le mois ou le trimestre concerné.</p>
<h3>Déclaration mensuelle</h3>
<p>Le chiffre d’affaires d’un mois se déclare avant la fin du mois suivant : celui de juin, au plus tard le 31 juillet.</p>
<h3>Déclaration trimestrielle</h3>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Chiffre d’affaires réalisé</th><th scope="col">À déclarer avant le</th></tr></thead>
<tbody>
<tr><th scope="row">De janvier à mars</th><td>{{decl_trimestre_1}}</td></tr>
<tr><th scope="row">D’avril à juin</th><td>{{decl_trimestre_2}}</td></tr>
<tr><th scope="row">De juillet à septembre</th><td>{{decl_trimestre_3}}</td></tr>
<tr><th scope="row">D’octobre à décembre</th><td>{{decl_trimestre_4}} (de l’année suivante)</td></tr>
</tbody></table></div>

<h2>Votre première déclaration</h2>
<p>La première déclaration peut se faire au plus tôt 3 mois ({{premiere_declaration_delai_jours}}) après le début de l’activité. Elle couvre tout le chiffre d’affaires depuis le démarrage.</p>
<ul>
<li><strong>En déclaration mensuelle :</strong> avant la fin du mois suivant vos 3 premiers mois d’activité. Exemple officiel : activité démarrée le 6 mars 2026, première déclaration au plus tard le 31 juillet 2026.</li>
<li><strong>En déclaration trimestrielle :</strong> avant la fin du mois suivant le trimestre qui suit celui du démarrage. Exemple officiel : activité démarrée le 12 avril 2026, première déclaration au plus tard le 31 octobre 2026.</li>
</ul>

<h2>Que déclarer ?</h2>
<p>Le chiffre d’affaires à déclarer est la somme, <strong>hors taxes</strong>, des ventes de biens et des prestations de services <strong>encaissées</strong> pendant la période. Les ventes réalisées mais pas encore payées sont exclues. La TVA payée par vos clients n’est pas incluse et aucune charge (commissions, frais) ne se déduit.</p>
<p>Si vous avez opté pour le versement libératoire de l’impôt sur le revenu, le montant des cotisations et de l’impôt est calculé automatiquement lors de la déclaration en ligne, selon le taux de votre activité. Vous devez aussi reporter votre chiffre d’affaires dans votre déclaration fiscale annuelle : cela n’entraîne pas de seconde imposition.</p>

<h2>En cas d’oubli ou de retard</h2>
<p>Une pénalité de <strong>{{decl_penalite_euros}}</strong> s’applique à chaque déclaration manquante. Vos cotisations sont en plus majorées : de {{decl_majoration_mensuelle}} par déclaration manquante si vous déclarez chaque mois, de {{decl_majoration_trimestrielle}} si vous déclarez chaque trimestre. Elles sont alors calculées sur une base forfaitaire :</p>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Par déclaration manquante</th><th scope="col">Ventes</th><th scope="col">Prestations de services</th></tr></thead>
<tbody>
<tr><th scope="row">Déclaration mensuelle</th><td>{{decl_base_forfaitaire_vente_mensuelle}}</td><td>{{decl_base_forfaitaire_services_mensuelle}}</td></tr>
<tr><th scope="row">Déclaration trimestrielle</th><td>{{decl_base_forfaitaire_vente_trimestrielle}}</td><td>{{decl_base_forfaitaire_services_trimestrielle}}</td></tr>
</tbody></table></div>

<h2>Questions fréquentes</h2>
<h3>Dois-je déclarer si je n’ai rien vendu ?</h3>
<p>Oui. La déclaration est obligatoire même si le chiffre d’affaires est nul : écrivez « Néant » à la place du montant. Sans chiffre d’affaires, il n’y a aucune cotisation à payer.</p>
<h3>Je facture en décembre, un client paie en janvier : dans quelle période ?</h3>
<p>Dans celle de l’encaissement : c’est le chiffre d’affaires encaissé pendant la période qui est déclaré.</p>
<h3>Puis-je changer de périodicité en cours d’année ?</h3>
<p>Non : l’option vaut pour l’année civile. Elle peut être modifiée pour l’année suivante, avant le {{decl_retour_mensuel_limite}} pour revenir au mensuel.</p>`,
  faq: [
    ['Dois-je déclarer si je n’ai rien vendu ?', 'Oui. La déclaration est obligatoire même si le chiffre d’affaires est nul : écrivez « Néant ». Sans chiffre d’affaires, il n’y a aucune cotisation à payer.'],
    ['Dans quelle période déclarer une facture payée plus tard ?', 'Dans celle de l’encaissement : c’est le chiffre d’affaires encaissé pendant la période qui est déclaré.'],
    ['Puis-je changer de périodicité en cours d’année ?', 'Non : l’option vaut pour l’année civile. Elle peut être modifiée pour l’année suivante.'],
  ],
  sources: [
    ['Micro-entrepreneur : quand déclarer son chiffre d’affaires ?, service-public.gouv.fr (page vérifiée par la DILA le 1er janvier 2026)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F23257'],
    ['Cotisations sociales d’un micro-entrepreneur, service-public.gouv.fr (page vérifiée par la DILA le 1er janvier 2026)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F36232'],
    ['Imposition d’un micro-entrepreneur, service-public.gouv.fr (page vérifiée par la DILA le 13 mars 2026)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F36244'],
  ],
  outil: ['/outils/calendrier-echeances/', 'Calendrier des échéances'],
};
