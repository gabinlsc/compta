// Guide « Créer sa micro-entreprise pas à pas ». Sources : service-public.gouv.fr F23961, F11677, F36232, F23257, F23999 ; chiffres en jetons {{id}}.
export const GUIDE_CREER = {
  slug: 'creer-sa-micro-entreprise',
  titre: 'Créer sa micro-entreprise pas à pas',
  titreLong: 'Créer sa micro-entreprise pas à pas',
  description: 'Les démarches pour créer une micro-entreprise, dans l’ordre : activité, nom, domiciliation, immatriculation gratuite, Acre, premières déclarations.',
  resume: 'Les démarches, dans l’ordre, pour se lancer en toute sérénité.',
  publie: '2026-10-26', miseAJour: '2026-10-26',
  corps: `<p class="lead">Devenir micro-entrepreneur est simple et gratuit, à condition de faire les choses dans l’ordre. Voici les étapes, de la préparation de votre projet jusqu’à votre première déclaration de chiffre d’affaires.</p>
<p class="notice info"><strong>Une fois lancé.</strong> Ces outils vous attendent : le <a href="/outils/simulateur-revenu-net/">simulateur de revenu net</a> (avec l’Acre), le <a href="/outils/tarif-journalier/">calculateur de tarif</a> et le <a href="/outils/calendrier-echeances/">calendrier des échéances</a>.</p>

<h2>En bref</h2>
<ul>
<li>Le statut de micro-entrepreneur est un régime fiscal et social simplifié de l’<strong>entreprise individuelle (EI)</strong> : vous exercez en nom propre.</li>
<li>L’<strong>immatriculation est toujours gratuite</strong>, sauf pour les agents commerciaux ({{immatriculation_agent_commercial_euros}} pour le registre spécial qui leur est réservé).</li>
<li>Elle se fait en ligne sur le <strong>guichet des formalités des entreprises</strong>.</li>
<li>Vous pouvez demander l’<strong>Acre</strong> dans les {{acre_delai_demande_jours}} qui suivent l’ouverture de l’activité.</li>
</ul>

<h2>1. Préparer votre projet</h2>
<p>Même si le statut est simple, préparez votre projet : décrivez votre modèle économique (qui sont vos clients, que leur vendez-vous, à quel prix), vérifiez qu’il existe une demande avec une étude de marché, et réfléchissez à la façon de vous faire connaître : réseaux sociaux, réseau personnel, salons, événements. Un <a href="/outils/tarif-journalier/">calcul de tarif</a> vous donne déjà une idée de ce qu’il faut facturer pour vous verser le revenu que vous visez.</p>

<h2>2. Financer le démarrage</h2>
<p>Rédiger un business plan est utile même pour une micro-entreprise, notamment pour convaincre une banque. Vous pouvez financer le démarrage sur vos fonds propres, par un emprunt, par des aides à la création (Acre, Arce, Cape), des concours, des bourses ou un prêt d’honneur. La micro-entreprise n’a pas de personnalité morale : elle ne permet pas de lever des fonds auprès d’investisseurs.</p>

<h2>3. Vérifier que votre activité n’est pas réglementée</h2>
<p>Certaines activités (par exemple restaurateur, agent immobilier, coiffeur) exigent un diplôme, une autorisation de la mairie ou un agrément avant de se lancer. Vérifiez-le avant d’immatriculer l’entreprise. Vous pouvez engager des démarches en amont (achats, contrats), mais toujours en votre nom propre, puisque la micro-entreprise n’a pas de personnalité juridique distincte.</p>

<h2>4. Choisir le nom</h2>
<p>Le nom de la micro-entreprise est votre prénom et votre nom, précédés ou suivis de la mention « entrepreneur individuel » ou « EI ». Vous pouvez en plus choisir un <strong>nom commercial</strong>, facultatif, sous lequel vous serez connu du public (site web, réseaux sociaux).</p>

<h2>5. Domicilier l’entreprise</h2>
<p>La domiciliation est obligatoire : c’est l’adresse administrative et juridique de l’entreprise, qui figure sur vos factures, devis et contrats, et où arrive le courrier de l’activité. Vous pouvez l’établir à votre domicile, dans un local dédié, chez une entreprise de domiciliation, dans un espace de coworking ou une pépinière d’entreprises. Si elle se confond avec votre adresse personnelle, vous pouvez demander à l’Insee de ne pas la rendre publique.</p>

<h2>6. Protéger votre patrimoine</h2>
<p>En principe, votre patrimoine personnel est protégé : seul votre patrimoine professionnel peut être saisi en cas de difficultés. Votre résidence principale est protégée automatiquement. Pour vos autres biens immobiliers non affectés à l’activité (une résidence secondaire par exemple), il faut passer chez un notaire pour une déclaration d’insaisissabilité. Attention : l’administration fiscale ou les organismes de sécurité sociale peuvent réclamer leurs dettes sur le patrimoine personnel en cas de fraude ou de manquements graves, et une dette personnelle (un emprunt pour votre résidence principale) reste personnelle.</p>

<h2>7. Immatriculer votre micro-entreprise</h2>
<p>L’immatriculation est la déclaration de l’existence de l’entreprise. Elle est gratuite (inscription au RNE, et au RCS pour une activité commerciale). Elle se fait sur le guichet des formalités des entreprises, avec :</p>
<ul>
<li>votre pièce d’identité ;</li>
<li>un justificatif de domiciliation avec l’adresse clairement identifiable (facture d’eau, d’électricité ou de gaz, par exemple) ;</li>
<li>une déclaration sur l’honneur de non-condamnation et une attestation de filiation, datées et signées ;</li>
<li>pour une activité réglementée, la copie de l’autorisation, du diplôme ou du titre.</li>
</ul>
<p>Vous obtenez ensuite une attestation d’immatriculation avec votre <strong>numéro SIREN</strong> et votre code d’activité APE. Faites-vous aussi connaître à La Poste, procurez-vous les registres obligatoires (voir le guide sur le <a href="/guides/livre-des-recettes-a-quoi-ca-sert/">livre des recettes</a>) et assurez votre activité. Les artisans doivent indiquer leur assurance professionnelle sur leurs devis et factures quand elle est obligatoire.</p>

<h2>8. Demander l’Acre</h2>
<p>L’Acre réduit vos cotisations au début de l’activité. Pour une micro-entreprise créée ou reprise à partir du {{acre_debut_regime}}, l’exonération est de {{acre_exoneration_micro}} : vous payez 75 % du taux normal, jusqu’à la fin du {{acre_trimestres_suivants}} suivant celui du début d’activité. Vous devez en faire la demande dans les {{acre_delai_demande_jours}} suivant l’ouverture de l’activité ; démarrer en début de trimestre civil (janvier, avril, juillet ou octobre) en tire le meilleur parti. Le <a href="/outils/simulateur-revenu-net/">simulateur</a> calcule l’effet de l’Acre sur vos cotisations.</p>

<h2>9. Vos premières obligations</h2>
<ul>
<li><strong>Déclarer votre chiffre d’affaires</strong> chaque mois ou chaque trimestre. L’option pour le trimestre se prend dans le mois qui suit le début de l’activité. La première déclaration peut se faire au plus tôt {{premiere_declaration_delai_jours}} après le début d’activité. Voir le guide <a href="/guides/declarer-son-chiffre-d-affaires/">Déclarer son chiffre d’affaires</a>.</li>
<li><strong>CFE</strong> : vous êtes exonéré la première année, mais devez déposer la déclaration initiale avant le {{cfe_declaration_creation}} (voir <a href="/guides/cfe-qui-la-paie/">CFE : qui la paie ?</a>).</li>
<li><strong>Facturer correctement</strong> : suivez la <a href="/guides/checklist-premiere-facture/">checklist avant votre première facture</a>.</li>
<li><strong>Surveiller vos plafonds</strong> de chiffre d’affaires et de TVA (voir <a href="/guides/plafonds-et-seuils-de-tva/">Plafonds et seuils de TVA</a>).</li>
</ul>

<h2>Questions fréquentes</h2>
<h3>Faut-il payer pour créer une micro-entreprise ?</h3>
<p>Non : l’immatriculation est gratuite, sauf pour les agents commerciaux. Méfiez-vous des sites qui font payer des démarches gratuites.</p>
<h3>Puis-je commencer avant d’avoir mon SIREN ?</h3>
<p>Vous pouvez préparer des achats et des contrats, mais la facturation doit attendre : si l’entreprise est en cours d’immatriculation, la facture porte la mention « {{mention_siret_en_cours}} ».</p>
<h3>Puis-je garder mon emploi ?</h3>
<p>Cela dépend de votre contrat de travail et de la nature de l’activité : relisez votre contrat et, si besoin, renseignez-vous auprès de votre employeur ou d’un conseiller.</p>`,
  faq: [
    ['Faut-il payer pour créer une micro-entreprise ?', 'Non : l’immatriculation est gratuite, sauf pour les agents commerciaux, qui paient l’immatriculation à leur registre spécial.'],
    ['Où immatriculer sa micro-entreprise ?', 'En ligne sur le guichet des formalités des entreprises, avec une pièce d’identité, un justificatif de domiciliation et une déclaration sur l’honneur de non-condamnation.'],
    ['Quand demander l’Acre ?', 'Dans les {{acre_delai_demande_jours}} qui suivent l’ouverture de l’activité.'],
  ],
  sources: [
    ['Comment devenir micro-entrepreneur ?, service-public.gouv.fr (page vérifiée par la DILA le 15 septembre 2025)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F23961'],
    ['Aide à la création ou à la reprise d’une entreprise (Acre), service-public.gouv.fr (page vérifiée par la DILA le 1er juillet 2026)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F11677'],
    ['Cotisations sociales d’un micro-entrepreneur, service-public.gouv.fr (page vérifiée par la DILA le 1er janvier 2026)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F36232'],
    ['Documents commerciaux d’une micro-entreprise, service-public.gouv.fr (page vérifiée par la DILA le 8 décembre 2025)', 'https://entreprendre.service-public.gouv.fr/vosdroits/F36008'],
  ],
  outil: ['/outils/simulateur-revenu-net/', 'Simulateur de revenu net'],
};
