// Page de l'outil « Calendrier des échéances » (formulaire statique, fichier .ics généré dans le navigateur, flux pré-générés pour l'abonnement).
import CFG from '../../tools/site.config.json' with { type: 'json' };
import { esc } from '../../tools/lib/layout.mjs';
import { champ, coche, radios } from './formulaires.mjs';
import { FLUX } from './ics-flux.mjs';

export function pageCalendrier() {
  const host = new URL(CFG.origin).host;
  return `<p class="eyebrow">Outil gratuit · sans compte</p>
<h1>Calendrier des échéances du micro-entrepreneur</h1>
<p class="lead">Téléchargez un fichier pour votre agenda (Google Agenda, Apple Calendrier, Outlook…) avec toutes vos dates de déclaration et de paiement, et des rappels avant chaque échéance. Il se crée dans votre navigateur : rien n’est envoyé.</p>
<p class="notice info"><strong>Dates officielles.</strong> Elles viennent de <a href="/sources/">service-public.gouv.fr</a>. Pour la CFE, la date exacte figure sur votre avis d’imposition, qui fait foi.</p>
<noscript><p class="notice">Le fichier se crée dans votre navigateur : JavaScript est nécessaire. Vous pouvez sinon vous abonner à un calendrier ci-dessous.</p></noscript>

<div class="outil outil-cal" id="outil-calendrier" hidden>
<form class="outil-form" id="formulaire" novalidate autocomplete="off" aria-label="Paramètres du calendrier">
  <div class="bloc plein">
    ${radios({ nom: 'periodicite', legende: 'Comment déclarez-vous votre chiffre d’affaires ?', options: [['mois', 'Chaque mois', 'Avant la fin du mois suivant'], ['trimestre', 'Chaque trimestre', 'Avant le 30 avril, 31 juillet, 31 octobre et 31 janvier']] })}
    <div class="grille">
    ${champ({ nom: 'debutActivite', label: 'Date de début d’activité (facultatif)', type: 'date', aide: 'Pour calculer votre première déclaration et la CFE de la première année.' })}
    ${champ({ nom: 'depuis', label: 'Calendrier à partir du', type: 'date', attrs: 'required' })}
    <div class="champ"><label for="f-duree">Pour combien de temps ?</label><select id="f-duree" name="duree"><option value="12">12 mois</option><option value="24">24 mois</option></select><p class="aide" id="note-validite"></p></div>
    </div>
    <fieldset class="options"><legend>Que voulez-vous dans le calendrier ?</legend>
      ${coche({ nom: 'cfe', label: 'La CFE (déclaration la première année, puis paiement)' })}
      ${coche({ nom: 'fe', label: 'Les dates de la facturation électronique' })}
      ${coche({ nom: 'options', label: 'Les dates limites d’option (versement libératoire, retour à la déclaration mensuelle)' })}
      ${coche({ nom: 'ir', label: 'Un rappel pour préparer la déclaration annuelle de revenus', aide: 'Rappel de Compta by glsc : les dates de cette déclaration sont publiées chaque printemps sur impots.gouv.fr.' })}
    </fieldset>
    <fieldset class="options"><legend>Rappels dans votre agenda (à 9 h)</legend>
      ${coche({ nom: 'rappel7', label: '7 jours avant' })}
      ${coche({ nom: 'rappel1', label: 'La veille' })}
      ${coche({ nom: 'rappel0', label: 'Le jour même' })}
    </fieldset>
  </div>
</form>

<section class="resultat" aria-labelledby="titre-resultat">
  <h2 id="titre-resultat">Votre calendrier</h2>
  <div id="bilan" role="status" aria-live="polite"></div>
  <div class="actions"><button type="button" class="btn" id="telecharger" aria-disabled="true">Télécharger le fichier .ics</button></div>
  <div id="liste-echeances"></div>
</section>
</div>

<div class="prose aide-page">
<h2>Ajouter le fichier à votre agenda</h2>
<p>Ouvrez le fichier téléchargé : votre application d’agenda propose de l’importer. Les échéances apparaissent comme des événements sur la journée entière, avec les rappels choisis. Le fichier est un instantané : pour recevoir automatiquement les mises à jour, abonnez-vous plutôt à un calendrier ci-dessous.</p>
<h2 id="abonnement">S’abonner à un calendrier</h2>
<p>Ces calendriers sont régénérés à chaque mise à jour des données et contiennent les échéances jusqu’à la fin de 2027, avec des rappels 7 jours avant et la veille. Dans votre agenda, ajoutez un calendrier « à partir d’une adresse » (URL) et collez le lien.</p>
<div class="table-wrap"><table class="flux"><thead><tr><th scope="col">Calendrier</th><th scope="col">Lien</th></tr></thead><tbody>
${FLUX.map((f) => `<tr><th scope="row">${esc(f.titre)}</th><td><a href="webcal://${host}/ics/${f.fichier}">S’abonner</a> · <a href="/ics/${f.fichier}" download>Télécharger</a> · <button type="button" class="lien copier" data-url="${CFG.origin}/ics/${f.fichier}">Copier le lien</button></td></tr>`).join('\n')}
</tbody></table></div>
<p id="etat-copie" role="status" class="aide"></p>
<h2>Questions fréquentes</h2>
<h3>Mon chiffre d’affaires est nul, dois-je déclarer ?</h3>
<p>Oui : la déclaration est obligatoire même si votre chiffre d’affaires est nul. Il suffit d’indiquer « Néant ». En cas d’oubli, une pénalité de {{decl_penalite_euros}} s’applique à chaque déclaration manquante, avec une majoration de vos cotisations de {{decl_majoration_mensuelle}} par déclaration mensuelle manquante ou de {{decl_majoration_trimestrielle}} par déclaration trimestrielle manquante.</p>
<h3>Quelle est ma première échéance ?</h3>
<p>Indiquez votre date de début d’activité. En déclaration mensuelle, la première déclaration se fait avant la fin du mois suivant vos 3 premiers mois d’activité (début le 6 mars 2026 : au plus tard le 31 juillet 2026). En déclaration trimestrielle, avant la fin du mois suivant le trimestre qui suit celui du démarrage (début le 12 avril 2026 : au plus tard le 31 octobre 2026).</p>
<h3>Quand payer la CFE ?</h3>
<p>En général au plus tard le {{cfe_paiement}} ; la date est reportée au premier jour ouvrable si elle tombe un samedi, un dimanche ou un jour férié. La première année, vous êtes exonéré mais devez déposer la déclaration initiale 1447-C-SD avant le {{cfe_declaration_creation}} de l’année de création. Voir le guide <a href="/guides/declarer-son-chiffre-d-affaires/">Déclarer son chiffre d’affaires</a>.</p>
<h3>Mes données sont-elles envoyées ?</h3>
<p>Non. Le fichier est créé dans votre navigateur et rien n’est conservé.</p>
</div>`;
}

export const FAQ_CALENDRIER = [
  ['Mon chiffre d’affaires est nul, dois-je déclarer ?', 'Oui : la déclaration est obligatoire même si votre chiffre d’affaires est nul. Il suffit d’indiquer « Néant ».'],
  ['Quelle est ma première échéance ?', 'En déclaration mensuelle, avant la fin du mois suivant vos 3 premiers mois d’activité. En déclaration trimestrielle, avant la fin du mois suivant le trimestre qui suit celui du démarrage.'],
  ['Mes données sont-elles envoyées ?', 'Non. Le fichier est créé dans votre navigateur et rien n’est conservé.'],
];
