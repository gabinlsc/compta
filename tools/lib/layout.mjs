// Gabarit commun : en-tête, pied de page, métadonnées, données structurées.
import CFG from '../site.config.json' with { type: 'json' };

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const dateFr = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const NAV = [['/outils/', 'Outils'], ['/guides/', 'Guides'], ['/sources/', 'Sources']];
const FOOT_LEGAL = [['/mentions-legales/', 'Mentions légales'], ['/confidentialite/', 'Confidentialité'], ['/cgu/', 'Conditions d’utilisation'], ['/sources/', 'Sources et mises à jour']];

export function fil(items) { // [[href, libellé], …] : le dernier élément est la page courante
  const lis = items.map(([h, l], i) => (i < items.length - 1 ? `<li><a href="${h}">${esc(l)}</a></li>` : `<li aria-current="page">${esc(l)}</li>`)).join('');
  return `<nav class="crumbs" aria-label="Fil d’Ariane"><ol>${lis}</ol></nav>`;
}
const ldBreadcrumb = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([h, l], i) => ({ '@type': 'ListItem', position: i + 1, name: l, item: CFG.origin + h })) });

/** Encart sobre vers StudioGLSC (outils et guides). */
export const encartStudio = () => `<aside class="studio-cta no-print" aria-label="À propos de l’éditeur"><strong>Besoin d’un site pour votre activité ?</strong> Ce site est édité par StudioGLSC, studio web en Bretagne. <a href="${CFG.studio}" rel="noopener">Découvrir StudioGLSC</a>.</aside>`;
export const avertissement = () => '<p class="notice info"><strong>Estimation indicative.</strong> Ce site ne remplace pas l’avis d’un comptable ni les informations officielles.</p>';

export function page({ path, title, description, body, crumbs = null, jsonld = [], noindex = false, assets, studio = false }) {
  const url = CFG.origin + path;
  const full = path === '/' ? `${CFG.nom} : ${CFG.slogan}` : `${title} · ${CFG.nom}`;
  const ld = [...(crumbs ? [ldBreadcrumb(crumbs)] : []), ...jsonld];
  const current = (h) => (path.startsWith(h) ? ' aria-current="page"' : '');
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<link rel="canonical" href="${url}">
<meta name="theme-color" content="#2447d6">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/style.css?v=${assets.css}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(CFG.nom)}">
<meta property="og:locale" content="fr_FR">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${CFG.origin}/assets/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(CFG.nom)} : ${esc(CFG.slogan)}">
<meta name="twitter:card" content="summary_large_image">
${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body>
<a class="skip" href="#contenu">Aller au contenu</a>
<header class="nav">
  <div class="wrap nav-in">
    <a class="brand" href="/"><img src="/assets/favicon.svg" width="32" height="32" alt=""><span>Compta <small>by glsc</small></span></a>
    <nav class="menu" aria-label="Navigation principale">
      ${NAV.map(([h, l]) => `<a href="${h}"${current(h)}>${l}</a>`).join('')}
    </nav>
    <form class="search" action="/recherche/" method="get" role="search"><label class="sr-only" for="q">Rechercher sur le site</label><input id="q" name="q" type="search" placeholder="Rechercher…" autocomplete="off" maxlength="80"></form>
    <button class="icon-btn" id="theme-toggle" type="button" aria-label="Changer de thème (clair ou sombre)" title="Changer de thème"><span aria-hidden="true">◐</span></button>
  </div>
</header>
<main id="contenu">
<div class="wrap">
${crumbs ? fil(crumbs) : ''}
${body}
${studio ? encartStudio() : ''}
</div>
</main>
<footer class="footer">
  <div class="wrap">
    <div class="footer-cols">
      <div><h2>${esc(CFG.nom)}</h2><p>Outils gratuits pour les micro-entrepreneurs. Sans compte, sans publicité, sans cookie : vos chiffres restent dans votre navigateur.</p></div>
      <div><h2>Le site</h2><ul><li><a href="/outils/">Outils</a></li><li><a href="/guides/">Guides</a></li><li><a href="/a-propos/">À propos</a></li><li><a href="/contact/">Contact</a></li></ul></div>
      <div><h2>Informations</h2><ul>${FOOT_LEGAL.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join('')}<li><a href="${CFG.depot}" rel="noopener">Code source</a></li></ul></div>
    </div>
    <p class="small">Ces outils ne constituent ni un conseil juridique, ni un conseil fiscal, ni un conseil comptable. Édité par ${esc(CFG.editeur)} (<a href="${CFG.studio}" rel="noopener">StudioGLSC</a>).</p>
  </div>
</footer>
<script src="/assets/app.js?v=${assets.js}" defer></script>
</body>
</html>
`;
}
