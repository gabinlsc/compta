// Outil « Combien me reste-t-il ? » : relie le formulaire à lib/simulateur.js et dessine le résultat.
// Sécurité : jamais d'innerHTML ; aucune requête réseau ; rien n'est stocké.
import { creerRegles } from '../lib/facture.js';
import { simuler, formaterBp } from '../lib/simulateur.js';
import { formaterEuros } from '../lib/money.js';
import { dateLongue, aujourdhui } from '../lib/dates.js';

const $ = (s, r = document) => r.querySelector(s);
const AUJ = aujourdhui();
const eur = (c) => formaterEuros(c, { decimales: 2 });
const eur0 = (c) => formaterEuros(Math.round(c / 100) * 100);
const SVG = 'http://www.w3.org/2000/svg';

function h(tag, attrs = {}, ...enfants) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (v === false || v == null) continue; if (k === 'class') el.className = v; else el.setAttribute(k, v === true ? '' : String(v)); }
  for (const c of enfants.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
}
const svg = (tag, attrs = {}, ...enfants) => { const el = document.createElementNS(SVG, tag); for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v)); for (const c of enfants) if (c != null) el.append(typeof c === 'string' ? document.createTextNode(c) : c); return el; };

const regles = creerRegles(JSON.parse($('#regles-data').textContent));
const form = $('#formulaire');
const touches = new Set();

function lire() {
  const g = (n) => form.elements[n];
  return { ca: g('ca').value, periode: g('periode').value, activite: g('activite').value, depenses: g('depenses').value, acre: g('acre').checked, debutActivite: g('debutActivite').value, vl: g('vl').checked };
}

function graphique(r) {
  const total = r.parts.reduce((a, p) => a + p.montant, 0) || 1;
  const W = 600, H = 56; let x = 0;
  const desc = r.parts.map((p) => `${p.libelle} : ${eur(p.montant)} (${Math.round((p.montant / total) * 100)} %)`).join(' ; ');
  const g = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-labelledby': 'graph-titre graph-desc', class: 'barre', preserveAspectRatio: 'none' }, svg('title', { id: 'graph-titre' }, 'Répartition du chiffre d’affaires'), svg('desc', { id: 'graph-desc' }, desc));
  for (const p of r.parts) { const w = (p.montant / total) * W; if (w <= 0) continue; g.append(svg('rect', { x, y: 0, width: Math.max(w - 2, 1), height: H, rx: 6, class: `seg seg-${p.id}` })); x += w; }
  return g;
}

function rendre(r) {
  const zone = $('#resultat-zone'), bilan = $('#bilan');
  zone.replaceChildren(); bilan.replaceChildren();
  if (r.bloque) {
    const visibles = r.erreurs.filter((er) => er.champ === 'donnees' || touches.has(er.champ));
    if (!visibles.length && r.erreurs.some((er) => er.champ === 'ca') && !touches.has('ca')) { zone.append(h('p', { class: 'vide' }, 'Saisissez votre chiffre d’affaires pour voir le résultat.')); return; }
    bilan.append(h('ul', { class: 'erreurs' }, (visibles.length ? visibles : r.erreurs).map((er) => h('li', {}, er.message)))); return;
  }
  const part = r.ca > 0 ? Math.round((r.net / r.ca) * 1000) / 10 : 0;
  zone.append(h('div', { class: 'carte-net' }, h('p', { class: 'etiquette' }, `Il vous reste environ (${r.periode.libelle})`), h('p', { class: 'grand' }, eur(r.net)),
    h('p', { class: 'muted' }, r.ca > 0 ? `sur ${eur(r.ca)} de chiffre d’affaires, soit ${String(part).replace('.', ',')} % avant impôt sur le revenu.` : 'Sans chiffre d’affaires, aucune cotisation à payer.')));
  if (r.ca > 0) { zone.append(h('div', { class: 'graph' }, graphique(r))); }
  const lignes = [['Chiffre d’affaires', eur(r.ca), ''], ['Cotisations sociales', `− ${eur(r.social)}`, `${formaterBp(r.tauxEffectifBp)} du chiffre d’affaires`]];
  if (r.impotVl !== 0 || zone) { /* ligne ajoutée plus bas si le versement libératoire est choisi */ }
  const e = lire();
  if (e.vl) lignes.push(['Impôt (versement libératoire)', `− ${eur(r.impotVl)}`, `${formaterBp(r.vlBp - r.tauxBp)} du chiffre d’affaires`]);
  if (r.depenses > 0) lignes.push(['Vos dépenses', `− ${eur(r.depenses)}`, '']);
  lignes.push(['Ce qu’il vous reste', eur(r.net), '']);
  zone.append(h('table', { class: 'resume' }, h('caption', { class: 'sr-only' }, 'Détail du calcul'), h('tbody', {}, lignes.map(([a, b, c], i) => h('tr', { class: i === lignes.length - 1 ? 'total' : '' }, h('th', { scope: 'row' }, a), h('td', { class: 'num' }, b), h('td', { class: 'note' }, c))))));
  const legende = h('ul', { class: 'legende' }, r.parts.map((p) => h('li', {}, h('span', { class: `pastille seg-${p.id}`, 'aria-hidden': 'true' }), `${p.libelle} : ${eur(p.montant)}`)));
  if (r.ca > 0) zone.append(legende);

  if (r.alertes.length) zone.append(h('ul', { class: 'alertes' }, r.alertes.map((a) => h('li', { class: `alerte ${a.niveau}` }, h('strong', {}, a.niveau === 'danger' ? 'Attention : ' : a.niveau === 'attention' ? 'À surveiller : ' : 'Bon à savoir : '), a.texte))));
  if (r.finAcre) zone.append(h('p', { class: 'note-acre' }, `Votre Acre court jusqu’au ${dateLongue(r.finAcre)}.`));
  if (r.imposable) zone.append(h('p', { class: 'imposable' }, h('strong', {}, 'Pour l’impôt sur le revenu : '), `abattement forfaitaire de ${String(r.imposable.pct).replace('.', ',')} % (au moins 305 €), soit ${eur0(r.imposable.abattement)} sur ${eur0(r.annuel)} de chiffre d’affaires annuel${r.projection ? ' (estimation)' : ''} : revenu imposable d’environ ${eur0(r.imposable.base)}, avant application du barème. Le montant de l’impôt dépend de tout votre foyer.`));

  const etapes = [
    `Chiffre d’affaires encaissé : ${eur(r.ca)}.`,
    `Taux de cotisations de votre activité (« ${r.activite.libelle} ») : ${formaterBp(r.tauxBp)}. Il inclut toutes les cotisations et contributions sociales.`,
    r.exoBp ? `Avec l’Acre, vous payez 75 % de ce taux : ${formaterBp(r.tauxBp)} × (100 % − ${formaterBp(r.exoBp)}) = ${formaterBp(r.tauxEffectifBp)}.` : null,
    `Cotisations : ${eur(r.ca)} × ${formaterBp(r.tauxEffectifBp)} = ${eur(r.social)}.`,
    e.vl ? `Versement libératoire : le taux global publié est de ${formaterBp(r.vlBp)} (cotisations et impôt). L’impôt est donc ${formaterBp(r.vlBp - r.tauxBp)} du chiffre d’affaires, soit ${eur(r.impotVl)}.` : null,
    r.depenses > 0 ? `Dépenses professionnelles : ${eur(r.depenses)}.` : null,
    `Ce qu’il vous reste : ${eur(r.ca)} − ${eur(r.social)}${e.vl ? ` − ${eur(r.impotVl)}` : ''}${r.depenses > 0 ? ` − ${eur(r.depenses)}` : ''} = ${eur(r.net)}.`,
  ].filter(Boolean);
  zone.append(h('details', { class: 'bloc explication', open: true }, h('summary', {}, 'Voici comment on calcule'), h('ol', {}, etapes.map((t) => h('li', {}, t)))));
}

function rafraichir() {
  const e = lire();
  $('.si-acre').hidden = !e.acre;
  const r = simuler(e, regles, AUJ);
  rendre(r);
  for (const el of form.elements) { el.removeAttribute?.('aria-invalid'); }
  if (r.bloque && !r.erreurs.some((x) => x.champ === 'donnees')) for (const er of r.erreurs) if (touches.has(er.champ) && form.elements[er.champ]) form.elements[er.champ].setAttribute('aria-invalid', 'true');
}
form.addEventListener('input', rafraichir);
form.addEventListener('change', rafraichir);
form.addEventListener('focusout', (ev) => { if (ev.target.name) { touches.add(ev.target.name); rafraichir(); } });
form.addEventListener('submit', (ev) => ev.preventDefault());
$('#outil-simulateur').hidden = false;
rafraichir();
