// Pages du socle. Les outils et guides s'ajoutent dans src/content/outils.mjs et src/content/guides.mjs au fil des livraisons.
import CFG from '../../tools/site.config.json' with { type: 'json' };
import { esc, dateFr, avertissement } from '../../tools/lib/layout.mjs';
import { formaterValeur } from '../../tools/lib/regles.mjs';
import { OUTILS } from './outils.mjs';
import { GUIDES } from './guides.mjs';
import { pageFacture, FAQ_FACTURE } from './outil-facture.mjs';
import { pageSimulateur, FAQ_SIMULATEUR } from './outil-simulateur.mjs';

const carte = (x, base) => `<article class="card"><h3>${x.pret ? `<a href="${base}${x.slug}/">${esc(x.titre)}</a>` : esc(x.titre)}</h3><p>${esc(x.resume)}</p>${x.pret ? '' : '<span class="tag">Bientôt</span>'}</article>`;
const HOME = [['/', 'Accueil']];

export function pages(regles) {
  const enVerif = regles.entrees.filter((e) => e.statut === 'a_verifier').length;
  const liste = [];

  liste.push({
    path: '/', title: CFG.nom, description: 'Facture, cotisations, échéances, tarif journalier : les outils gratuits du micro-entrepreneur. Sans compte ni cookie, tout se calcule dans votre navigateur.',
    jsonld: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: CFG.nom, url: CFG.origin + '/', inLanguage: 'fr' }],
    body: `<section class="hero"><p class="eyebrow">Gratuit · sans compte · sans cookie</p>
<h1>La boîte à outils du micro-entrepreneur</h1>
<p class="lead">Faites vos devis et factures, estimez ce qu’il vous reste après cotisations, ne ratez plus une échéance. Vos chiffres restent chez vous : tout se calcule dans votre navigateur, rien n’est envoyé.</p>
<div class="actions"><a class="btn" href="/outils/">Voir les outils</a><a class="btn ghost" href="/sources/">Sources des chiffres</a></div></section>
<h2>Les outils</h2><div class="grid">${OUTILS.map((o) => carte(o, '/outils/')).join('')}</div>
<h2>Pourquoi ce site ?</h2><div class="prose">
<p><strong>Aucune donnée collectée.</strong> Pas de compte, pas de publicité, pas de cookie, pas de traceur, aucun service tiers : polices, scripts et images sont hébergés sur le site.</p>
<p><strong>Des chiffres sourcés.</strong> Chaque taux, plafond ou date vient d’un site officiel, avec sa date de vérification, visible sur la page <a href="/sources/">Sources et dernière mise à jour</a>.</p>
<p><strong>Code ouvert.</strong> Le code source est public sur <a href="${CFG.depot}" rel="noopener">GitHub</a> : vous pouvez vérifier ce que font les outils.</p></div>`,
  });

  liste.push({
    path: '/outils/', title: 'Outils pour micro-entrepreneur', description: 'Générateur de devis et factures, simulateur de revenu net, calendrier des échéances, tarif journalier, livre des recettes : tous les outils, gratuits.',
    crumbs: [...HOME, ['/outils/', 'Outils']],
    body: `<h1>Outils pour micro-entrepreneur</h1><p class="lead">Chaque outil fonctionne dans votre navigateur, sans inscription.</p>${avertissement()}<div class="grid">${OUTILS.map((o) => carte(o, '/outils/')).join('')}</div>`,
  });

  liste.push({
    path: '/outils/facture-auto-entrepreneur/', title: 'Devis et facture auto-entrepreneur gratuits', outil: true,
    description: 'Créez un devis, une facture, un acompte ou un avoir de micro-entrepreneur avec les mentions obligatoires, et enregistrez-le en PDF. Gratuit, sans compte.',
    crumbs: [...HOME, ['/outils/', 'Outils'], ['/outils/facture-auto-entrepreneur/', 'Devis et factures']], modules: ['/assets/js/outils/facture.js'], studio: true,
    jsonld: [
      { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Devis et factures d’auto-entrepreneur', url: CFG.origin + '/outils/facture-auto-entrepreneur/', applicationCategory: 'BusinessApplication', operatingSystem: 'Web', inLanguage: 'fr', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }, description: 'Générateur de devis, factures, acomptes, soldes et avoirs pour micro-entrepreneur, dans le navigateur.' },
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ_FACTURE.map(([q, r]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: r } })) },
    ],
    body: pageFacture(),
  });

  liste.push({
    path: '/outils/simulateur-revenu-net/', title: 'Simulateur de revenu net auto-entrepreneur', outil: true,
    description: 'Estimez vos cotisations et ce qu’il vous reste après cotisations selon votre activité, avec l’Acre et le versement libératoire. Gratuit, sans compte.',
    crumbs: [...HOME, ['/outils/', 'Outils'], ['/outils/simulateur-revenu-net/', 'Simulateur de revenu net']], modules: ['/assets/js/outils/simulateur.js'], studio: true,
    jsonld: [
      { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Simulateur : combien me reste-t-il ?', url: CFG.origin + '/outils/simulateur-revenu-net/', applicationCategory: 'FinanceApplication', operatingSystem: 'Web', inLanguage: 'fr', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }, description: 'Simulateur de cotisations et de revenu net pour micro-entrepreneur, dans le navigateur.' },
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ_SIMULATEUR.map(([q, r]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: r } })) },
    ],
    body: pageSimulateur(),
  });

  for (const g of GUIDES.filter((x) => x.pret)) {
    const url = `${CFG.origin}/guides/${g.slug}/`;
    liste.push({
      path: `/guides/${g.slug}/`, title: g.titreLong ?? g.titre, description: g.description, studio: true,
      crumbs: [...HOME, ['/guides/', 'Guides'], [`/guides/${g.slug}/`, g.titre]],
      jsonld: [
        { '@context': 'https://schema.org', '@type': 'Article', headline: g.titreLong ?? g.titre, description: g.description, inLanguage: 'fr', datePublished: g.publie, dateModified: g.miseAJour, mainEntityOfPage: url,
          author: { '@type': 'Person', name: CFG.editeur }, publisher: { '@type': 'Organization', name: CFG.nom, url: CFG.origin + '/' } },
        { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: g.faq.map(([q, r]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: r } })) },
      ],
      body: `<article class="prose guide"><p class="eyebrow">Guide · mis à jour le ${dateFr(g.miseAJour)}</p><h1>${esc(g.titreLong ?? g.titre)}</h1>${g.corps}
<h2>Sources</h2><ul class="sources">${g.sources.map(([t, u]) => `<li><a href="${esc(u)}" rel="noopener">${esc(t)}</a></li>`).join('')}</ul>
<p class="aide">Page rédigée le ${dateFr(g.publie)}, mise à jour le ${dateFr(g.miseAJour)}. Les chiffres viennent de la page <a href="/sources/">Sources</a>. Ce guide ne remplace pas l’avis d’un expert-comptable.</p>
${g.outil ? `<p class="actions"><a class="btn" href="${g.outil[0]}">Ouvrir l’outil : ${esc(g.outil[1])}</a></p>` : ''}</article>`,
    });
  }

  liste.push({
    path: '/guides/', title: 'Guides pour micro-entrepreneur', description: 'Créer sa micro-entreprise, mentions obligatoires d’une facture, facturation électronique, déclarations, TVA : des guides clairs et sourcés.',
    crumbs: [...HOME, ['/guides/', 'Guides']],
    body: `<h1>Guides pour micro-entrepreneur</h1><p class="lead">Des explications claires, avec leurs sources officielles et leur date de mise à jour.</p><div class="grid">${GUIDES.map((g) => carte(g, '/guides/')).join('')}</div>`,
  });

  const lignes = regles.entrees.map((e) => `<tr><td>${esc(e.libelle)}</td><td>${e.statut === 'verifie' ? `<strong>${esc(formaterValeur(e))}</strong>` : '<span class="tag">En cours de vérification</span>'}</td><td>${e.source_url ? `<a href="${esc(e.source_url)}" rel="noopener">${esc(e.source_titre)}</a>` : esc(e.source_titre)}</td><td>${e.verifie_le ? dateFr(e.verifie_le) : '—'}</td><td>${dateFr(e.valable_du)} au ${dateFr(e.valable_au)}</td></tr>`).join('');
  liste.push({
    path: '/sources/', title: 'Sources et dernière mise à jour', description: 'Chaque taux, plafond et date utilisé par les outils, avec sa source officielle et sa date de vérification. Les chiffres non vérifiés ne sont pas publiés.',
    crumbs: [...HOME, ['/sources/', 'Sources et mises à jour']],
    body: `<h1>Sources et dernière mise à jour</h1><p class="lead">Tous les chiffres réglementaires du site sont listés ici, avec leur source officielle et la date à laquelle ils ont été contrôlés.</p>
<div class="prose"><p>Règle du site : un chiffre qui n’a pas été contrôlé sur une source officielle (urssaf.fr, service-public.fr, impots.gouv.fr, legifrance.gouv.fr, cnil.fr) <strong>n’est pas publié</strong>. Il apparaît alors « en cours de vérification » et les outils qui en dépendent ne l’utilisent pas.</p>
${enVerif ? `<p class="notice"><strong>${enVerif} donnée${enVerif > 1 ? 's' : ''} sur ${regles.entrees.length} en cours de vérification.</strong> Les outils de calcul seront mis en ligne quand elles auront été contrôlées.</p>` : ''}</div>
<div class="table-wrap"><table><thead><tr><th scope="col">Donnée</th><th scope="col">Valeur</th><th scope="col">Source</th><th scope="col">Vérifiée le</th><th scope="col">Période de validité</th></tr></thead><tbody>${lignes}</tbody></table></div>
<p>Dernière mise à jour du site : ${dateFr(CFG.miseAJour)}. Les données sont revues au moins une fois par an, en début d’année.</p>`,
  });

  liste.push({
    path: '/recherche/', title: 'Recherche', description: 'Cherchez un outil, un guide ou une page du site : la recherche se fait dans votre navigateur, rien n’est envoyé.',
    crumbs: [...HOME, ['/recherche/', 'Recherche']], noindex: true,
    body: `<h1>Recherche</h1><p id="resultats-etat" class="lead" role="status">Saisissez un mot pour chercher un outil, un guide ou une page.</p><ul id="resultats" class="results"></ul><noscript><p class="notice">La recherche demande JavaScript. Vous pouvez parcourir les <a href="/outils/">outils</a> et les <a href="/guides/">guides</a>.</p></noscript>`,
  });

  liste.push({
    path: '/a-propos/', title: 'À propos', description: 'Qui édite Compta by glsc, pourquoi ce site est gratuit, sans cookie ni publicité, et comment vérifier son code source.',
    crumbs: [...HOME, ['/a-propos/', 'À propos']],
    body: `<h1>À propos</h1><div class="prose">
<p>${esc(CFG.nom)} est édité par ${esc(CFG.editeur)}, entrepreneur individuel (EI) et fondateur de <a href="${CFG.studio}" rel="noopener">StudioGLSC</a>, un studio web en Bretagne.</p>
<p>J’ai construit ces outils parce que les démarches d’un indépendant sont souvent plus compliquées qu’elles ne devraient l’être, et que beaucoup de simulateurs en ligne demandent un compte ou collectent des données. Ici, rien de tout cela : les calculs se font dans votre navigateur.</p>
<h2>Le projet est ouvert</h2><p>Le code source est public et sous licence MIT : <a href="${CFG.depot}" rel="noopener">${CFG.depot.replace('https://', '')}</a>. Si vous trouvez une erreur dans un chiffre ou un calcul, écrivez-moi via la page <a href="/contact/">Contact</a>.</p>
<h2>Ce que ce site n’est pas</h2><p>Ce n’est pas un cabinet comptable ni un conseil juridique ou fiscal. Les outils donnent des estimations indicatives à partir de sources officielles citées sur la page <a href="/sources/">Sources</a>.</p></div>`,
  });

  liste.push({
    path: '/contact/', title: 'Contact', description: 'Une erreur, une question, une idée d’outil ? Écrivez à l’éditeur de Compta by glsc par e-mail.',
    crumbs: [...HOME, ['/contact/', 'Contact']],
    body: `<h1>Contact</h1><div class="prose"><p>Pour signaler une erreur, poser une question ou proposer un outil : <a href="mailto:${CFG.email}">${CFG.email}</a>.</p><p>Il n’y a pas de formulaire : votre message passe uniquement par votre messagerie. Merci de ne pas y joindre d’informations sensibles (numéro de sécurité sociale, coordonnées bancaires).</p></div>`,
  });

  liste.push({
    path: '/mentions-legales/', title: 'Mentions légales', description: 'Éditeur, directeur de publication, hébergeur et propriété du site Compta by glsc.',
    crumbs: [...HOME, ['/mentions-legales/', 'Mentions légales']],
    body: `<h1>Mentions légales</h1><div class="prose">
<h2>Éditeur du site</h2><p>${esc(CFG.editeur)}, entrepreneur individuel (EI), exerçant sous le nom commercial StudioGLSC.<br>SIREN : en cours d’immatriculation.<br>Adresse du siège : en cours d’immatriculation.<br>E-mail : <a href="mailto:${CFG.email}">${CFG.email}</a></p>
<h2>Directeur de la publication</h2><p>${esc(CFG.editeur)}.</p>
<h2>Hébergeur</h2><p>IONOS SE, Elgendorfer Straße 57, 56410 Montabaur, Allemagne.</p>
<h2>Propriété et code source</h2><p>Le code du site est publié sous licence MIT sur <a href="${CFG.depot}" rel="noopener">GitHub</a>. Les polices Inter sont distribuées sous licence SIL Open Font License.</p>
<h2>Responsabilité</h2><p>Les outils et les guides donnent des informations et des estimations indicatives, sans valeur de conseil juridique, fiscal ou comptable. Seules les informations publiées par les administrations font foi. Chaque donnée réglementaire est rattachée à sa source sur la page <a href="/sources/">Sources</a>.</p></div>`,
  });

  liste.push({
    path: '/confidentialite/', title: 'Politique de confidentialité', description: 'Aucune donnée collectée, aucun cookie, aucun traceur : ce que fait et ne fait pas Compta by glsc de vos informations.',
    crumbs: [...HOME, ['/confidentialite/', 'Confidentialité']],
    body: `<h1>Politique de confidentialité</h1><div class="prose">
<p>En bref : <strong>ce site ne collecte aucune donnée personnelle</strong> sur ce que vous saisissez.</p>
<h2>Ce que vous saisissez</h2><p>Les montants, noms, adresses et autres informations entrés dans les outils sont traités uniquement dans votre navigateur. Ils ne sont ni envoyés à un serveur, ni transmis à un tiers.</p>
<h2>Enregistrement dans votre navigateur</h2><p>Par défaut, rien n’est conservé : si vous fermez la page, la saisie disparaît. Certains outils proposeront un bouton « Enregistrer dans ce navigateur ». Si vous l’utilisez, les données sont stockées dans l’espace de votre navigateur (localStorage), sur votre appareil uniquement. Un bouton « Tout effacer » les supprime.</p>
<h2>Cookies et traceurs</h2><p>Le site n’utilise aucun cookie, aucun outil de mesure d’audience et aucun service tiers. C’est pourquoi il n’affiche pas de bandeau de consentement : il n’y a rien à consentir.</p>
<h2>Journaux du serveur</h2><p>Comme tout serveur web, celui qui héberge le site enregistre l’adresse IP, la date et la page demandée de chaque visite, pour la sécurité et le bon fonctionnement. Ces journaux sont conservés 35 jours au plus, puis supprimés. Ils ne sont pas utilisés pour mesurer l’audience.</p>
<h2>Vos droits</h2><p>Vous pouvez demander l’accès, la rectification ou la suppression des données vous concernant en écrivant à <a href="mailto:${CFG.email}">${CFG.email}</a>. En cas de désaccord, vous pouvez saisir la <a href="https://www.cnil.fr" rel="noopener">CNIL</a>.</p>
<h2>Courrier électronique</h2><p>Si vous m’écrivez, votre message et votre adresse e-mail sont utilisés uniquement pour vous répondre.</p></div>`,
  });

  liste.push({
    path: '/cgu/', title: 'Conditions d’utilisation', description: 'Conditions d’utilisation des outils gratuits de Compta by glsc : estimations indicatives, absence de conseil, responsabilité de l’utilisateur.',
    crumbs: [...HOME, ['/cgu/', 'Conditions d’utilisation']],
    body: `<h1>Conditions d’utilisation</h1><div class="prose">
<p>L’accès au site et aux outils est gratuit et ne demande aucune inscription.</p>
<h2>Estimations indicatives</h2><p>Les résultats sont des estimations. Ils dépendent de ce que vous saisissez et de règles qui évoluent. Ils ne remplacent ni l’avis d’un expert-comptable, ni les informations publiées par l’Urssaf, l’administration fiscale ou service-public.fr.</p>
<h2>Votre responsabilité</h2><p>Vous restez responsable de l’exactitude des documents que vous établissez (devis, factures) et des déclarations que vous faites. Vérifiez toujours les mentions obligatoires auprès des sources officielles.</p>
<h2>Disponibilité</h2><p>Le site est fourni « en l’état », sans garantie de disponibilité. Il peut être modifié ou interrompu à tout moment.</p>
<h2>Signaler une erreur</h2><p>Une erreur dans un chiffre ou un calcul ? Écrivez via la page <a href="/contact/">Contact</a> : elle sera corrigée.</p></div>`,
  });

  return liste;
}

export const page404 = {
  path: '/404.html', title: 'Page introuvable', description: 'Cette page n’existe pas ou a été déplacée. Retrouvez un outil ou un guide grâce à la recherche.', noindex: true,
  body: `<h1>Page introuvable</h1><p class="lead">Cette page n’existe pas ou a été déplacée.</p><form action="/recherche/" method="get" role="search" class="notice info"><label for="q404"><strong>Rechercher sur le site</strong></label><br><input id="q404" name="q" type="search" maxlength="80" class="wide"> <button class="btn" type="submit">Chercher</button></form><div class="actions"><a class="btn" href="/outils/">Voir les outils</a> <a class="btn ghost" href="/">Accueil</a></div>`,
};
