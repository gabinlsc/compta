// Guide « Les mentions obligatoires sur une facture ». Les chiffres sont des jetons {{id}} remplis depuis data/regles.json ; chaque affirmation vient d'une page officielle citée en bas.
export const GUIDE_MENTIONS = {
  slug: 'mentions-obligatoires-facture',
  titre: 'Les mentions obligatoires sur une facture',
  titreLong: 'Mentions obligatoires sur une facture',
  description: 'Toutes les mentions à faire figurer sur une facture ou un devis de micro-entrepreneur : identité, SIREN, TVA, pénalités, indemnité de 40 €, nouveautés 2026.',
  resume: 'Ce qui doit figurer sur vos factures et vos devis.',
  publie: '2026-10-26', miseAJour: '2026-10-26',
  corps: `<p class="lead">Une facture sans ses mentions obligatoires n’est pas valable, et son oubli peut être sanctionné. Voici, dans l’ordre, ce qu’il faut y écrire quand on est micro-entrepreneur, avec les changements de 2026.</p>
<p class="notice info"><strong>Gagnez du temps.</strong> L’outil <a href="/outils/facture-auto-entrepreneur/">Devis et factures</a> ajoute automatiquement toutes ces mentions et vérifie votre SIREN, votre IBAN et vos délais.</p>

<h2>En bref</h2>
<ul>
<li>Une facture porte un <strong>numéro unique</strong>, dans une suite chronologique et continue, sans trou.</li>
<li>Elle indique <strong>qui vend</strong> (vous, avec la mention « Entrepreneur individuel » ou « EI » et votre SIREN) et <strong>qui achète</strong>.</li>
<li>Elle détaille chaque ligne, le total à payer, la <strong>date de règlement</strong>, les <strong>pénalités de retard</strong> et l’<strong>indemnité de recouvrement de {{indemnite_recouvrement}}</strong> pour un client professionnel.</li>
<li>En franchise de TVA, elle porte la mention « TVA non applicable », dont le texte a changé le {{mention_franchise_tva_cibs_debut}}.</li>
</ul>

<h2>Les mentions communes à toutes les factures</h2>
<p>Elles s’appliquent que votre client soit un particulier, un professionnel ou une entité publique :</p>
<ul>
<li><strong>La date d’émission</strong> de la facture et son <strong>numéro unique</strong>.</li>
<li><strong>La date de la vente ou de la prestation</strong> : le jour de la livraison ou de la fin du travail, ou la date à laquelle l’acompte est versé.</li>
<li><strong>Votre identité</strong> : nom et prénom, précédés ou suivis de « Entrepreneur individuel » ou « EI », votre adresse et votre numéro SIREN.</li>
<li><strong>L’identité du client</strong> : nom de l’entreprise s’il s’agit d’un professionnel ; nom complet et adresse s’il s’agit d’un particulier.</li>
<li><strong>Le numéro de bon de commande</strong>, quand le client en a établi un.</li>
<li><strong>Le détail de chaque prestation ou produit</strong> : désignation, quantité, prix unitaire hors taxe, et taux de TVA ou mention d’exonération.</li>
<li><strong>Le total hors taxe et toutes taxes comprises</strong>, ainsi que toute réduction de prix acquise (remise, rabais, ristourne).</li>
<li><strong>La date à laquelle le règlement doit intervenir</strong>, et les conditions d’escompte en cas de paiement anticipé. S’il n’y en a pas : « Escompte pour paiement anticipé : néant ».</li>
<li><strong>Le taux des pénalités de retard</strong> et la mention de l’<strong>indemnité forfaitaire de {{indemnite_recouvrement}}</strong> pour frais de recouvrement.</li>
</ul>
<p>Votre numéro de TVA intracommunautaire n’est pas concerné tant que vous êtes en franchise de TVA : vous n’en avez pas.</p>

<h2>Votre entreprise est en cours d’immatriculation</h2>
<p>La facture doit alors être établie au nom de l’entreprise, avec la mention « Siret en cours d’attribution », et non au nom du créateur. L’outil propose une case à cocher pour ce cas.</p>

<h2>Le délai de paiement, les pénalités et l’indemnité de {{indemnite_recouvrement}}</h2>
<p>Sans accord, le délai de paiement est de {{delai_paiement_defaut_jours}} après la réception du bien ou la réalisation de la prestation. Entre professionnels, vous pouvez convenir d’un délai plus long, mais il ne peut pas dépasser <strong>{{delai_paiement_max_jours}} à compter de l’émission de la facture</strong> (ou {{delai_paiement_fin_de_mois_jours}} fin de mois). Ce délai doit apparaître sur la facture.</p>
<p>En cas de retard, des <strong>pénalités</strong> s’appliquent pour chaque jour, dès le lendemain de la date de règlement indiquée, sans qu’il soit nécessaire de relancer le client. Leur taux ne peut pas être inférieur à trois fois le taux de l’intérêt légal. Le code de commerce recommande le taux de refinancement de la Banque centrale européenne, majoré de {{penalite_majoration_bce}}. Pour le 2<sup>e</sup> semestre 2026, cela donne {{penalite_bce_2026_s2}} (taux de refinancement de {{penalite_refi_2026_s2}} au 1<sup>er</sup> juillet 2026).</p>
<p>S’y ajoute une <strong>indemnité forfaitaire de {{indemnite_recouvrement}}</strong> par facture impayée à temps, due une seule fois et non chaque jour de retard, même en cas de paiement partiel. Elle n’est pas soumise à la TVA et ne peut être demandée qu’à un client professionnel. Si vos frais réels sont plus élevés, vous pouvez demander un complément sur justificatifs, sans le mentionner sur la facture.</p>

<h2>La TVA : franchise en base et nouvelle mention</h2>
<p>Si vous êtes en franchise en base de TVA, vous le signalez sur chaque facture. Depuis le {{mention_franchise_tva_cibs_debut}}, la mention est : <em>« {{mention_franchise_tva_cibs}} »</em>. Elle remplace « TVA non applicable, art. 293 B du code général des impôts ». L’ancienne formule reste <strong>tolérée jusqu’au {{tolerance_mention_293b_fin}}</strong>, mais mieux vaut adopter la nouvelle dès maintenant.</p>
<p>Les seuils qui vous maintiennent en franchise sont détaillés dans notre page <a href="/sources/">Sources</a>.</p>

<h2>Les mentions qui dépendent de votre situation</h2>
<ul>
<li><strong>Membre d’une association agréée</strong> : « {{mention_association_agreee}} ».</li>
<li><strong>Activité artisanale</strong> : indiquez votre assurance professionnelle quand elle est obligatoire pour votre métier (par exemple la décennale pour un plombier), avec l’assureur et la couverture géographique, sur vos devis comme sur vos factures.</li>
<li><strong>Facture à un particulier</strong> : pour certains biens (électroménager, informatique, téléphonie, jouets, articles de sport…), la facture rappelle l’existence et la durée de la garantie légale de conformité, d’au moins {{garantie_conformite_ans}}.</li>
<li><strong>Client redevable de la TVA</strong> : « Auto-liquidation ». <strong>Auto-facturation</strong> : la mention correspondante, quand c’est le client qui établit la facture.</li>
</ul>

<h2>Ce que change la facturation électronique</h2>
<p>La généralisation de la facture électronique ajoute quatre mentions : le <strong>SIREN du client</strong> (s’il s’agit d’une entreprise), l’<strong>adresse de livraison</strong> si elle diffère de celle du client, la <strong>nature de l’opération</strong> (livraison de biens, prestation de services ou les deux) et, le cas échéant, « Option pour le paiement de la taxe d’après les débits ».</p>
<p>Ces mentions s’imposent aux grandes entreprises et aux entreprises de taille intermédiaire à partir du {{fe_emission_grandes_entreprises}}. Les PME et les <strong>micro-entreprises</strong> sont concernées à partir du <strong>{{fe_emission_micro}}</strong>. L’outil vous les fait déjà renseigner.</p>

<h2>Et le devis ?</h2>
<p>Le devis n’est pas toujours obligatoire : il l’est dans certains secteurs (bâtiment, services à la personne, déménagement…), et ses mentions dépendent alors du secteur. En dehors de ces cas, vous pouvez fournir un autre document d’information avant l’achat, comme vos conditions générales de vente. Dans tous les cas, un devis signé par les deux parties vous engage. Un artisan indique son assurance professionnelle sur ses devis aussi.</p>

<h2>Questions fréquentes</h2>
<h3>Que risque-t-on en oubliant une mention ?</h3>
<p>Une facture incomplète expose à des sanctions, qui varient selon la mention oubliée. Les pénalités de retard et l’indemnité de {{indemnite_recouvrement}} doivent, elles, être indiquées à la fois dans vos conditions générales de vente et sur chaque facture.</p>
<h3>Faut-il conserver les factures ?</h3>
<p>Oui. Les documents commerciaux se conservent {{conservation_documents_commerciaux}}.</p>
<h3>Puis-je modifier une facture déjà envoyée ?</h3>
<p>Non : on la corrige par un <strong>avoir</strong>, puis on émet une nouvelle facture avec un nouveau numéro. L’outil gère les avoirs.</p>`,
  faq: [
    ['Que risque-t-on en oubliant une mention ?', 'Une facture incomplète expose à des sanctions, qui varient selon la mention oubliée. Les pénalités de retard et l’indemnité de {{indemnite_recouvrement}} doivent, elles, être indiquées à la fois dans vos conditions générales de vente et sur chaque facture.'],
    ['Faut-il conserver les factures ?', 'Oui. Les documents commerciaux se conservent {{conservation_documents_commerciaux}}.'],
    ['Puis-je modifier une facture déjà envoyée ?', 'Non : on la corrige par un avoir, puis on émet une nouvelle facture avec un nouveau numéro.'],
  ],
  sources: [
    ['Mentions obligatoires sur une facture, service-public.gouv.fr (vérifiée par la DILA le 11 août 2026)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F31808'],
    ['Documents commerciaux d’une micro-entreprise, service-public.gouv.fr (vérifiée le 8 décembre 2025)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F36008'],
    ['Délais de paiement entre professionnels et pénalités de retard, service-public.gouv.fr (vérifiée le 7 août 2026)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F23211'],
  ],
  outil: ['/outils/facture-auto-entrepreneur/', 'Devis et factures'],
};
