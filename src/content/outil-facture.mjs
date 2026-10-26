// Page de l'outil « Devis et factures » : formulaire statique (tout le contenu est écrit ici, jamais construit avec des données saisies) ;
// le script src/assets/js/outils/facture.js le relie à l'aperçu. Les textes réglementaires viennent de data/regles.json.
import { champ, coche, choisir, radios } from './formulaires.mjs';

const TYPES_FACTURIERS = 'facture acompte solde';
export function pageFacture() {
  return `<p class="eyebrow">Outil gratuit · sans compte</p>
<h1>Devis et factures d’auto-entrepreneur</h1>
<p class="lead">Créez un devis, une facture, un acompte, un solde ou un avoir avec toutes les mentions obligatoires, puis enregistrez-le en PDF. Rien n’est envoyé : tout reste dans votre navigateur.</p>
<p class="notice info"><strong>Estimation indicative.</strong> Cet outil applique les règles publiées par l’administration (voir <a href="/sources/">les sources</a>) mais ne remplace ni l’avis d’un comptable ni les informations officielles. Relisez toujours votre document avant de l’envoyer.</p>
<noscript><p class="notice">Cet outil demande JavaScript pour calculer et afficher le document dans votre navigateur. Aucune donnée n’est envoyée.</p></noscript>

<div class="outil" id="outil-facture" hidden>
<form class="outil-form" id="formulaire" novalidate autocomplete="off" aria-label="Formulaire du document">
  <details open class="bloc"><summary>1. Type de document</summary>
    ${radios({ nom: 'type', legende: 'Que voulez-vous créer ?', options: [['devis', 'Devis', 'Une proposition de prix à faire signer'], ['facture', 'Facture', 'Pour une prestation terminée ou un bien livré'], ['acompte', 'Facture d’acompte', 'Un pourcentage demandé à la commande'], ['solde', 'Facture de solde', 'Le reste à payer, acomptes déduits'], ['avoir', 'Avoir', 'Pour annuler ou corriger une facture']] })}
  </details>

  <details open class="bloc"><summary>2. Vous</summary>
    <div class="grille">
    ${champ({ nom: 'emetteur.nom', label: 'Nom et prénom *', auto: 'name', attrs: 'maxlength="120" required' })}
    ${champ({ nom: 'emetteur.nomCommercial', label: 'Nom commercial (facultatif)', attrs: 'maxlength="120"' })}
    ${champ({ nom: 'emetteur.adresse', label: 'Adresse *', auto: 'street-address', attrs: 'maxlength="160" required', classe: 'large' })}
    ${champ({ nom: 'emetteur.cp', label: 'Code postal *', auto: 'postal-code', attrs: 'maxlength="10" required inputmode="numeric"' })}
    ${champ({ nom: 'emetteur.ville', label: 'Ville *', auto: 'address-level2', attrs: 'maxlength="80" required' })}
    ${champ({ nom: 'emetteur.email', label: 'E-mail', type: 'email', auto: 'email', attrs: 'maxlength="120"' })}
    ${champ({ nom: 'emetteur.tel', label: 'Téléphone', type: 'tel', auto: 'tel', attrs: 'maxlength="30"' })}
    </div>
    ${coche({ nom: 'emetteur.enCours', label: 'Mon entreprise est en cours d’immatriculation', aide: 'La facture portera alors la mention « Siret en cours d’attribution ».' })}
    <div class="grille">
    ${champ({ nom: 'emetteur.siren', label: 'SIREN (9 chiffres)', attrs: 'maxlength="14" inputmode="numeric"', aide: 'Obligatoire sauf si l’entreprise est en cours d’immatriculation.' })}
    ${champ({ nom: 'emetteur.siret', label: 'SIRET (14 chiffres, facultatif)', attrs: 'maxlength="20" inputmode="numeric"' })}
    ${champ({ nom: 'emetteur.iban', label: 'IBAN (pour le virement)', attrs: 'maxlength="50" autocapitalize="characters"', classe: 'large' })}
    ${champ({ nom: 'emetteur.bic', label: 'BIC', attrs: 'maxlength="15" autocapitalize="characters"' })}
    ${champ({ nom: 'emetteur.banque', label: 'Banque (facultatif)', attrs: 'maxlength="80"' })}
    </div>
    ${champ({ nom: 'emetteur.assurance', label: 'Assurance professionnelle', type: 'textarea', aide: 'À indiquer si elle est obligatoire pour votre métier (artisanat, bâtiment…) : assureur, numéro de contrat et couverture géographique.' })}
    ${coche({ nom: 'emetteur.associationAgreee', label: 'Je suis membre d’une association agréée', pour: TYPES_FACTURIERS + ' avoir devis' })}
  </details>

  <details open class="bloc"><summary>3. Votre client</summary>
    ${radios({ nom: 'client.type', legende: 'Votre client est…', options: [['pro', 'Un professionnel', 'Entreprise, association, indépendant'], ['particulier', 'Un particulier', 'Une personne qui achète pour elle-même']] })}
    <div class="grille">
    ${champ({ nom: 'client.nom', label: 'Nom de l’entreprise ou nom complet *', attrs: 'maxlength="120" required', classe: 'large' })}
    ${champ({ nom: 'client.adresse', label: 'Adresse', attrs: 'maxlength="160"', classe: 'large' })}
    ${champ({ nom: 'client.cp', label: 'Code postal', attrs: 'maxlength="10" inputmode="numeric"' })}
    ${champ({ nom: 'client.ville', label: 'Ville', attrs: 'maxlength="80"' })}
    ${champ({ nom: 'client.siren', label: 'SIREN du client', client: 'pro', attrs: 'maxlength="14" inputmode="numeric"', aide: 'Obligatoire sur vos factures à partir du 1<sup>er</sup> septembre 2027 ; utile dès maintenant.' })}
    ${champ({ nom: 'client.tvaIntra', label: 'N° de TVA intracommunautaire du client (facultatif)', client: 'pro', attrs: 'maxlength="20"' })}
    ${champ({ nom: 'client.adresseLivraison', label: 'Adresse de livraison, si elle est différente', attrs: 'maxlength="300"', classe: 'large' })}
    ${champ({ nom: 'client.mediateur', label: 'Médiateur de la consommation (facultatif)', client: 'particulier', type: 'textarea', aide: 'Nom et coordonnées de votre médiateur, si vous en avez un.', classe: 'large' })}
    </div>
  </details>

  <details open class="bloc"><summary>4. Le document</summary>
    <div class="grille">
    <div class="champ"><label for="f-numero">Numéro *</label><div class="avec-bouton"><input id="f-numero" name="numero" type="text" maxlength="30" required aria-describedby="f-numero-aide"><button type="button" class="btn ghost petit" id="proposer-numero">Proposer</button></div><p class="aide" id="f-numero-aide">La suite des numéros doit être chronologique et continue, sans trou.</p></div>
    ${champ({ nom: 'dateEmission', label: 'Date d’émission *', type: 'date', attrs: 'required' })}
    ${champ({ nom: 'datePrestation', label: 'Date de la prestation, de la livraison ou de l’acompte *', type: 'date', pour: TYPES_FACTURIERS + ' avoir' })}
    ${champ({ nom: 'validiteJours', label: 'Durée de validité du devis (jours) *', attrs: 'inputmode="numeric" maxlength="3"', pour: 'devis' })}
    ${champ({ nom: 'reference', label: 'Référence', pour: 'acompte solde avoir', attrs: 'maxlength="40"', etiquettes: { acompte: 'Devis de référence', solde: 'Devis de référence', avoir: 'Facture annulée ou corrigée *' } })}
    ${champ({ nom: 'bonCommande', label: 'N° de bon de commande du client (si fourni)', pour: TYPES_FACTURIERS, attrs: 'maxlength="40"' })}
    ${champ({ nom: 'objet', label: 'Objet', attrs: 'maxlength="160"', classe: 'large' })}
    ${choisir({ nom: 'nature', label: 'Nature de l’opération', options: [['services', 'Prestation de services'], ['biens', 'Livraison de biens'], ['mixte', 'Livraison de biens et prestation de services']], pour: TYPES_FACTURIERS + ' avoir' })}
    ${champ({ nom: 'acomptePct', label: 'Pourcentage d’acompte *', attrs: 'inputmode="numeric" maxlength="2"', pour: 'acompte', aide: 'Calculé sur le total des lignes ci-dessous (le total du devis).' })}
    </div>
    <div class="acomptes" data-pour="solde"><h3>Acomptes déjà facturés</h3><div id="acomptes"></div><button type="button" class="btn ghost petit" id="ajouter-acompte">Ajouter un acompte</button></div>
  </details>

  <details open class="bloc"><summary>5. Les lignes</summary>
    <div id="lignes" class="lignes" aria-live="polite"></div>
    <div class="actions-lignes"><button type="button" class="btn ghost petit" id="ajouter-ligne">Ajouter une ligne</button>
      <label class="modele" id="bloc-modeles" hidden><span class="sr-only">Insérer une ligne depuis un modèle</span><select id="modeles"><option value="">Insérer un modèle de ligne…</option></select></label></div>
    <p class="aide">Prix en euros, hors TVA : vous êtes en franchise en base de TVA, le prix HT est le prix à payer. La remise est un pourcentage de la ligne.</p>
    <p class="total-live" role="status" id="total-live"></p>
  </details>

  <details class="bloc" id="bloc-reglement"><summary>6. Règlement et mentions</summary>
    <div class="grille">
    ${champ({ nom: 'reglement.delai', label: 'Délai de paiement (jours) *', attrs: 'inputmode="numeric" maxlength="3"', pour: TYPES_FACTURIERS, aide: 'Entre professionnels : 60 jours au maximum à compter de l’émission. 0 = à réception.' })}
    ${choisir({ nom: 'reglement.penalites', label: 'Taux des pénalités de retard', options: [['bce', 'Taux de refinancement de la BCE + 10 points (recommandé)'], ['legal3', 'Trois fois le taux de l’intérêt légal'], ['fixe', 'Un taux annuel que je fixe']], pour: TYPES_FACTURIERS })}
    ${champ({ nom: 'reglement.tauxFixe', label: 'Taux annuel des pénalités (%)', attrs: 'inputmode="decimal" maxlength="6"', pour: TYPES_FACTURIERS, classe: 'si-fixe' })}
    ${choisir({ nom: 'tvaMention', label: 'Mention de franchise de TVA', options: [['cibs', 'Art. L. 223 et s. du CIBS (en vigueur depuis le 1er septembre 2026)'], ['cgi', 'Art. 293 B du CGI (encore toléré jusqu’au 31 décembre 2027)']], aide: 'La première est la mention à utiliser désormais.' })}
    </div>
    ${coche({ nom: 'garantieConformite', label: 'Ajouter la mention de garantie légale de conformité', pour: TYPES_FACTURIERS, client: 'particulier', aide: 'Obligatoire pour certains biens vendus à un particulier (appareils électroménagers, informatique, téléphonie, jouets, articles de sport…).' })}
    ${champ({ nom: 'notes', label: 'Autre mention ou remarque (facultatif)', type: 'textarea', aide: 'Par exemple vos conditions générales de vente ou un délai de réalisation.' })}
  </details>

  <details class="bloc"><summary>7. Enregistrer, exporter</summary>
    <p class="aide">Par défaut, rien n’est conservé : si vous fermez la page, tout disparaît. Vous choisissez ci-dessous ce qui est gardé, uniquement sur cet appareil.</p>
    <div class="actions">
      <button type="button" class="btn ghost petit" id="enregistrer">Enregistrer dans ce navigateur</button>
      <button type="button" class="btn ghost petit" id="exporter">Exporter (JSON)</button>
      <label class="btn ghost petit" for="importer">Importer (JSON)</label><input type="file" id="importer" accept="application/json,.json" class="sr-only">
      <button type="button" class="btn ghost petit" id="nouveau">Nouveau document</button>
      <button type="button" class="btn ghost petit danger" id="effacer">Tout effacer</button>
    </div>
    <p class="aide" id="etat-stockage" role="status"></p>
    <div id="documents-enregistres" hidden><h3>Documents enregistrés</h3><ul id="liste-documents" class="liste-docs"></ul></div>
  </details>
</form>

<section class="apercu" aria-labelledby="titre-apercu">
  <div class="apercu-tete">
    <h2 id="titre-apercu">Aperçu</h2>
    <button type="button" class="btn" id="imprimer">Imprimer ou enregistrer en PDF</button>
  </div>
  <div id="bilan" class="bilan" role="status" aria-live="polite"></div>
  <div id="feuille-zone"></div>
</section>
</div>

<div class="prose aide-page">
<h2>Comment ça marche</h2>
<ol>
<li>Choisissez le type de document, remplissez votre identité et celle de votre client.</li>
<li>Ajoutez vos lignes : le total se calcule au centime près et l’aperçu se met à jour en direct.</li>
<li>Cliquez sur « Imprimer ou enregistrer en PDF » : dans la fenêtre d’impression de votre navigateur, choisissez « Enregistrer au format PDF ».</li>
</ol>
<h2>Questions fréquentes</h2>
<h3>Pourquoi la mention de TVA a-t-elle changé ?</h3>
<p>Depuis le 1<sup>er</sup> septembre 2026, la mention de franchise en base de TVA fait référence au code des impositions sur les biens et services (CIBS). L’ancienne mention (article 293 B du CGI) reste tolérée jusqu’au 31 décembre 2027. Source : <a href="https://entreprendre.service-public.gouv.fr/vosdroits/F36008" rel="noopener">service-public.gouv.fr</a>.</p>
<h3>Le SIREN du client est-il obligatoire ?</h3>
<p>Il le devient sur les factures des micro-entreprises à partir du 1<sup>er</sup> septembre 2027 (les grandes entreprises et les ETI y sont tenues dès le 1<sup>er</sup> septembre 2026). L’outil le signale et l’exige à partir de cette date.</p>
<h3>Quel taux de pénalités de retard indiquer ?</h3>
<p>Le taux ne peut pas être inférieur à trois fois le taux de l’intérêt légal. Le code de commerce recommande le taux de refinancement de la BCE majoré de 10 points, c’est le choix par défaut. L’indemnité forfaitaire de 40 € ne peut être demandée qu’à un client professionnel. Source : <a href="https://entreprendre.service-public.gouv.fr/vosdroits/F23211" rel="noopener">service-public.gouv.fr</a>.</p>
<h3>Un devis est-il obligatoire ?</h3>
<p>Pas dans tous les cas : il l’est dans certains secteurs (bâtiment, services à la personne, déménagement…). Les mentions d’un devis dépendent alors du secteur. Source : <a href="https://entreprendre.service-public.gouv.fr/vosdroits/F36008" rel="noopener">service-public.gouv.fr</a>.</p>
<h3>Mes données sont-elles envoyées quelque part ?</h3>
<p>Non. Les calculs et la mise en page se font dans votre navigateur. Si vous cliquez sur « Enregistrer dans ce navigateur », les données sont gardées sur votre appareil seulement, et « Tout effacer » les supprime.</p>
<h3>L’outil gère-t-il la TVA ?</h3>
<p>Pas encore : il est prévu pour les micro-entrepreneurs en franchise en base de TVA (« TVA non applicable »). Si vous facturez la TVA, utilisez un autre outil.</p>
</div>`;
}

export const FAQ_FACTURE = [
  ['Pourquoi la mention de TVA a-t-elle changé ?', 'Depuis le 1er septembre 2026, la mention de franchise en base de TVA fait référence au code des impositions sur les biens et services (CIBS). L’ancienne mention (article 293 B du CGI) reste tolérée jusqu’au 31 décembre 2027.'],
  ['Le SIREN du client est-il obligatoire ?', 'Il le devient sur les factures des micro-entreprises à partir du 1er septembre 2027 (grandes entreprises et ETI : dès le 1er septembre 2026).'],
  ['Mes données sont-elles envoyées quelque part ?', 'Non. Les calculs et la mise en page se font dans votre navigateur ; rien n’est enregistré sans votre action.'],
];
