// Outil « Tarif journalier (TJM) et horaire ». Sécurité : jamais d'innerHTML ; aucune requête réseau ; rien n'est stocké.
import { creerRegles } from '../lib/facture.js?v=4fe9bb99';
import { calculerTarif, HYPOTHESES } from '../lib/tjm.js?v=4fe9bb99';
import { formaterBp } from '../lib/simulateur.js?v=4fe9bb99';
import { formaterEuros } from '../lib/money.js?v=4fe9bb99';
import { aujourdhui } from '../lib/dates.js?v=4fe9bb99';

const $ = (s, r = document) => r.querySelector(s);
const AUJ = aujourdhui();
const eur = (c) => formaterEuros(c, { decimales: 2 });
const eurEntier = (e) => formaterEuros(Math.round(e * 100));
const h = (tag, attrs = {}, ...enfants) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (v === false || v == null) continue; if (k === 'class') el.className = v; else el.setAttribute(k, v === true ? '' : String(v)); }
  for (const c of enfants.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
};
const regles = creerRegles(JSON.parse($('#regles-data').textContent));
const form = $('#formulaire');
const touches = new Set();
const nombre = (n) => String(Math.round(n * 100) / 100).replace('.', ',');

function lire() {
  const g = (n) => form.elements[n];
  return { net: g('net').value, fraisMensuels: g('fraisMensuels').value, activite: g('activite').value, acre: g('acre').checked, debutActivite: g('debutActivite').value, vl: g('vl').checked,
    joursSemaine: g('joursSemaine').value, semainesConges: g('semainesConges').value, joursFeries: g('joursFeries').value, pourcentNonFacture: g('pourcentNonFacture').value, heuresJour: g('heuresJour').value };
}

function rendre(r) {
  const zone = $('#resultat-zone'), bilan = $('#bilan');
  zone.replaceChildren(); bilan.replaceChildren();
  if (r.bloque) {
    const visibles = r.erreurs.filter((er) => er.champ === 'donnees' || touches.has(er.champ));
    if (!visibles.length && r.erreurs.every((er) => er.champ === 'net')) { zone.append(h('p', { class: 'vide' }, 'Indiquez le revenu net mensuel que vous visez pour voir votre tarif.')); return; }
    bilan.append(h('ul', { class: 'erreurs' }, (visibles.length ? visibles : r.erreurs).map((er) => h('li', {}, er.message)))); return;
  }
  zone.append(h('div', { class: 'carte-net' }, h('p', { class: 'etiquette' }, 'Tarif journalier à facturer'), h('p', { class: 'grand' }, `${eurEntier(r.tjm)}`),
    h('p', { class: 'muted' }, `Soit environ ${eurEntier(r.tauxHoraire)} de l’heure (${nombre(r.hj)} h facturées par jour), pour un revenu net de ${eur(r.net)} par mois.`)));
  zone.append(h('table', { class: 'resume' }, h('caption', { class: 'sr-only' }, 'Détail du calcul'), h('tbody', {},
    [['Chiffre d’affaires annuel nécessaire', eur(r.caAnnuel), ''], ['Jours disponibles par an', nombre(r.joursDispo), 'après congés et jours fériés'], [`Jours facturés par an (${100 - r.nf} %)`, nombre(r.joursFacturables), `${r.nf} % du temps non facturé`],
      ['Taux prélevé sur le chiffre d’affaires', formaterBp(r.tauxBp), r.exoBp ? 'avec l’Acre' : '']].map(([a, b, c]) => h('tr', {}, h('th', { scope: 'row' }, a), h('td', { class: 'num' }, b), h('td', { class: 'note' }, c))))));
  if (r.alertes.length) zone.append(h('ul', { class: 'alertes' }, r.alertes.filter((a) => a.niveau !== 'info' || /TVA/.test(a.texte)).map((a) => h('li', { class: `alerte ${a.niveau}` }, h('strong', {}, a.niveau === 'danger' ? 'Attention : ' : a.niveau === 'attention' ? 'À surveiller : ' : 'Bon à savoir : '), a.texte.replace(/ \(estimation sur l’année[^)]*\)/, '')))));
  zone.append(h('details', { class: 'bloc explication', open: true }, h('summary', {}, 'Voici comment on calcule'), h('ol', {}, [
    `Revenu net visé : ${eur(r.net)} × 12 = ${eur(r.net * 12)} par an${r.frais > 0 ? `, plus ${eur(r.frais)} × 12 = ${eur(r.frais * 12)} de frais` : ''}.`,
    `Taux prélevé sur le chiffre d’affaires pour votre activité : ${formaterBp(r.tauxBp)}.`,
    `Chiffre d’affaires nécessaire : ${eur(r.net * 12 + r.frais * 12)} ÷ (1 − ${formaterBp(r.tauxBp)}) = ${eur(r.caAnnuel)}.`,
    `Jours disponibles : ${nombre(r.joursDispo)} par an ; jours facturés : ${nombre(r.joursFacturables)}.`,
    `Tarif journalier : ${eur(r.caAnnuel)} ÷ ${nombre(r.joursFacturables)} jours = ${eurEntier(r.tjm)} (arrondi à l’euro supérieur).`,
    `Contrôle : avec ce chiffre d’affaires, il vous reste ${eur(r.controle.net)} sur l’année, soit ${eur(Math.round(r.controle.net / 12))} par mois.`,
  ].map((t) => h('li', {}, t)))));
}

function rafraichir() {
  const r = calculerTarif(lire(), regles, AUJ);
  $('.si-acre').hidden = !form.elements.acre.checked;
  rendre(r);
  for (const el of form.elements) el.removeAttribute?.('aria-invalid');
  if (r.bloque) for (const er of r.erreurs) if (touches.has(er.champ) && form.elements[er.champ]) form.elements[er.champ].setAttribute('aria-invalid', 'true');
}
form.addEventListener('input', rafraichir);
form.addEventListener('change', rafraichir);
form.addEventListener('focusout', (ev) => { if (ev.target.name) { touches.add(ev.target.name); rafraichir(); } });
form.addEventListener('submit', (ev) => ev.preventDefault());
for (const [k, v] of Object.entries(HYPOTHESES)) form.elements[k].value = v;
$('#outil-tjm').hidden = false;
rafraichir();
