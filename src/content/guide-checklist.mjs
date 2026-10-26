// Guide « Checklist avant votre première facture » : synthèse de F31808, F36008, F23211 (chiffres en jetons {{id}}).
export const GUIDE_CHECKLIST = {
  slug: 'checklist-premiere-facture',
  titre: 'Checklist avant votre première facture',
  titreLong: 'Checklist avant d’envoyer votre première facture',
  description: 'Dix vérifications avant d’envoyer votre première facture de micro-entrepreneur : identité, numéro, TVA, délai, pénalités, SIREN du client.',
  resume: 'Dix vérifications avant d’envoyer votre première facture.',
  publie: '2026-10-26', miseAJour: '2026-10-26',
  corps: `<p class="lead">Une facture se prépare avant de se rédiger. Voici dix vérifications, dans l’ordre, pour que votre première facture soit complète, claire pour votre client et conforme aux règles de 2026.</p>
<p class="notice info"><strong>Les cases à cocher, automatiquement.</strong> L’outil <a href="/outils/facture-auto-entrepreneur/">Devis et factures</a> contrôle la plupart de ces points pour vous et refuse d’imprimer un document incomplet.</p>

<h2>La checklist</h2>
<ol class="checklist">
<li><h3>Mon entreprise est bien immatriculée</h3>
<p>Vous avez votre numéro <strong>SIREN</strong>. Si vous êtes encore en cours d’immatriculation, la facture porte la mention « {{mention_siret_en_cours}} » et elle est établie au nom de l’entreprise, pas à celui du créateur.</p></li>
<li><h3>Mon identité est complète</h3>
<p>Vos nom et prénom, précédés ou suivis de « {{mention_entrepreneur_individuel}} », votre adresse et votre SIREN. Un nom commercial est facultatif.</p></li>
<li><h3>Mon numéro de facture est unique et continu</h3>
<p>La suite des numéros est chronologique et continue, sans trou. Une facture déjà envoyée ne se modifie pas : on l’annule par un avoir.</p></li>
<li><h3>Les dates sont indiquées</h3>
<p>La date d’émission, et la date de la vente ou de la prestation (ou celle du versement de l’acompte).</p></li>
<li><h3>Mon client est bien identifié</h3>
<p>Nom de l’entreprise pour un professionnel ; nom complet et adresse pour un particulier. Pour un professionnel, notez dès maintenant son <strong>SIREN</strong> : il sera obligatoire sur vos factures à partir du {{fe_emission_micro}}.</p></li>
<li><h3>Chaque ligne est détaillée</h3>
<p>Désignation précise, quantité, prix unitaire hors taxe, et réductions éventuelles. Le total est indiqué hors taxe et toutes taxes comprises, qui sont ici identiques.</p></li>
<li><h3>La mention de TVA est la bonne</h3>
<p>En franchise en base : « {{mention_franchise_tva_cibs}} ». L’ancienne formule (article 293 B du CGI) reste tolérée jusqu’au {{tolerance_mention_293b_fin}}.</p></li>
<li><h3>La date limite de paiement est claire</h3>
<p>Entre professionnels, le délai ne dépasse pas {{delai_paiement_max_jours}} à compter de l’émission. Mentionnez aussi : « {{mention_escompte_neant}} » si vous n’en proposez pas.</p></li>
<li><h3>Les pénalités et l’indemnité sont mentionnées</h3>
<p>Le taux des pénalités de retard (au moins trois fois le taux de l’intérêt légal) et, pour un client professionnel, l’indemnité forfaitaire de {{indemnite_recouvrement}} pour frais de recouvrement.</p></li>
<li><h3>Mon client sait comment payer</h3>
<p>Votre IBAN et votre BIC, la référence à rappeler, et la façon de vous joindre. Pensez ensuite à noter l’encaissement dans votre <a href="/outils/livre-des-recettes/">livre des recettes</a>.</p></li>
</ol>

<h2>Selon votre situation</h2>
<ul>
<li><strong>Artisan</strong> : indiquez votre assurance professionnelle sur vos devis et vos factures si elle est obligatoire pour votre métier.</li>
<li><strong>Client particulier</strong> : pour certains biens, rappelez la garantie légale de conformité (au moins {{garantie_conformite_ans}}). Pas d’indemnité de recouvrement.</li>
<li><strong>Association agréée</strong> : « {{mention_association_agreee}} ».</li>
</ul>

<h2>Si votre client ne paie pas à l’échéance</h2>
<p>Les pénalités de retard s’appliquent dès le lendemain de la date de règlement indiquée sur la facture, sans que vous ayez à relancer ni à envoyer une mise en demeure. L’indemnité forfaitaire de {{indemnite_recouvrement}} est due une seule fois par facture impayée à temps, y compris en cas de paiement partiel. Si vos frais de recouvrement dépassent ce montant, vous pouvez demander une indemnisation complémentaire sur justificatifs, sans la mentionner sur la facture.</p>

<h2>Après l’envoi</h2>
<ul>
<li>Conservez la facture : les documents commerciaux se conservent {{conservation_documents_commerciaux}}.</li>
<li>Reportez le montant encaissé dans le livre des recettes, puis déclarez-le à l’Urssaf avant la date limite (voir le guide <a href="/guides/declarer-son-chiffre-d-affaires/">Déclarer son chiffre d’affaires</a>).</li>
<li>Gardez un œil sur vos plafonds (voir <a href="/guides/plafonds-et-seuils-de-tva/">Plafonds et seuils de TVA</a>).</li>
</ul>

<h2>Questions fréquentes</h2>
<h3>Ai-je besoin d’un numéro de TVA ?</h3>
<p>Pas en franchise en base de TVA : la mention « TVA non applicable » suffit. Votre numéro de TVA intracommunautaire n’est requis que si vous facturez la TVA.</p>
<h3>Puis-je facturer avant d’avoir mon SIREN ?</h3>
<p>Mieux vaut attendre : si l’entreprise est en cours d’immatriculation, la facture doit porter la mention « {{mention_siret_en_cours}} » et être établie au nom de l’entreprise.</p>`,
  faq: [
    ['Ai-je besoin d’un numéro de TVA pour facturer ?', 'Pas en franchise en base de TVA : la mention « TVA non applicable » suffit.'],
    ['Que faire si je me suis trompé sur une facture ?', 'On ne modifie pas une facture envoyée : on émet un avoir qui l’annule, puis une nouvelle facture avec un nouveau numéro.'],
    ['Mon client est un particulier : quelles différences ?', 'Pas d’indemnité forfaitaire de recouvrement, et pour certains biens, la mention de la garantie légale de conformité.'],
  ],
  sources: [
    ['Mentions obligatoires sur une facture, service-public.gouv.fr (page vérifiée par la DILA le 11 août 2026)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F31808'],
    ['Documents commerciaux d’une micro-entreprise, service-public.gouv.fr (page vérifiée par la DILA le 8 décembre 2025)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F36008'],
    ['Délais de paiement entre professionnels et pénalités de retard, service-public.gouv.fr (page vérifiée par la DILA le 7 août 2026)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F23211'],
  ],
  outil: ['/outils/facture-auto-entrepreneur/', 'Devis et factures'],
};
