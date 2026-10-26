// Outil « Calendrier des échéances » : génère le fichier .ics dans le navigateur. Aucune requête réseau ; rien n'est stocké ; jamais d'innerHTML.
import { creerRegles } from '../lib/facture.js?v=122afbfd';
import { genererEcheances, FIN_VALIDITE } from '../lib/echeances.js?v=122afbfd';
import { construireIcs } from '../lib/ics.js?v=122afbfd';
import { ajouterJours, ajouterMois, dateLongue, aujourdhui, MOIS_FR } from '../lib/dates.js?v=122afbfd';

const $ = (s, r = document) => r.querySelector(s);
const AUJ = aujourdhui();
const h = (tag, attrs = {}, ...enfants) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (v === false || v == null) continue; if (k === 'class') el.className = v; else el.setAttribute(k, v === true ? '' : String(v)); }
  for (const c of enfants.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
};
const regles = creerRegles(JSON.parse($('#regles-data').textContent));
const form = $('#formulaire');
let courant = null;

function lire() {
  const g = (n) => form.elements[n];
  const periodicite = [...form.querySelectorAll('input[name="periodicite"]')].find((r) => r.checked)?.value ?? 'mois';
  const depuis = g('depuis').value;
  const duree = Number(g('duree').value);
  const finBrute = depuis ? ajouterJours(ajouterMois(depuis, duree), -1) : '';
  const fin = finBrute && finBrute > FIN_VALIDITE ? FIN_VALIDITE : finBrute;
  return { periodicite, debutActivite: g('debutActivite').value, depuis, fin, tronque: finBrute !== fin,
    options: { cfe: g('cfe').checked, fe: g('fe').checked, options: g('options').checked, ir: g('ir').checked },
    rappels: [g('rappel7').checked && 7, g('rappel1').checked && 1, g('rappel0').checked && 0].filter((x) => x !== false) };
}

function rafraichir() {
  const e = lire();
  const liste = $('#liste-echeances'), bilan = $('#bilan'), bouton = $('#telecharger');
  liste.replaceChildren(); bilan.replaceChildren(); courant = null;
  $('#note-validite').textContent = e.tronque ? `Les règles sont vérifiées jusqu’au ${dateLongue(FIN_VALIDITE)} : le calendrier s’arrête à cette date.` : '';
  const r = genererEcheances(e, regles);
  const ok = !r.erreurs.length && r.evenements.length > 0;
  bouton.setAttribute('aria-disabled', ok ? 'false' : 'true');
  if (r.erreurs.length) { bilan.append(h('ul', { class: 'erreurs' }, r.erreurs.map((x) => h('li', {}, x.message)))); return; }
  if (!r.evenements.length) { bilan.append(h('p', { class: 'vide' }, 'Aucune échéance sur cette période.')); return; }
  courant = { e, evenements: r.evenements };
  bilan.append(h('p', { class: 'bilan-titre ok' }, `${r.evenements.length} échéance${r.evenements.length > 1 ? 's' : ''} du ${dateLongue(e.depuis)} au ${dateLongue(e.fin)}.`));
  let moisCourant = '';
  let ul = null;
  for (const ev of r.evenements) {
    const [a, m] = ev.date.split('-'), cle = `${a}-${m}`;
    if (cle !== moisCourant) { moisCourant = cle; liste.append(h('h3', { class: 'mois' }, `${MOIS_FR[Number(m) - 1][0].toUpperCase()}${MOIS_FR[Number(m) - 1].slice(1)} ${a}`)); ul = h('ul', { class: 'echeances' }); liste.append(ul); }
    ul.append(h('li', { class: `echeance cat-${ev.categorie}` }, h('details', {}, h('summary', {}, h('time', { datetime: ev.date }, dateLongue(ev.date)), h('span', { class: 'titre-ev' }, ev.titre)), h('p', {}, ev.description))));
  }
}

function telecharger() {
  if (!courant) { $('#bilan').scrollIntoView({ block: 'nearest' }); return; }
  const n = new Date(), pad = (x) => String(x).padStart(2, '0');
  const dtstamp = `${n.getUTCFullYear()}${pad(n.getUTCMonth() + 1)}${pad(n.getUTCDate())}T${pad(n.getUTCHours())}${pad(n.getUTCMinutes())}${pad(n.getUTCSeconds())}Z`;
  const ics = construireIcs({ nom: 'Échéances micro-entrepreneur', description: 'Calendrier créé avec Compta by glsc. Dates lues sur service-public.gouv.fr.', evenements: courant.evenements, dtstamp, domaine: location.hostname || 'compta.invalid', rappels: courant.e.rappels });
  const lien = h('a', { href: URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' })), download: `echeances-compta-${AUJ}.ics` });
  document.body.append(lien); lien.click(); lien.remove(); setTimeout(() => URL.revokeObjectURL(lien.href), 1000);
}

form.addEventListener('input', rafraichir);
form.addEventListener('change', rafraichir);
form.addEventListener('submit', (ev) => ev.preventDefault());
$('#telecharger').addEventListener('click', telecharger);
document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('button.copier'); if (!b) return;
  const etat = $('#etat-copie');
  try { await navigator.clipboard.writeText(b.dataset.url); etat.textContent = 'Lien copié.'; } catch { etat.textContent = `Copiez ce lien : ${b.dataset.url}`; }
});

// valeurs de départ
form.elements.depuis.value = AUJ;
form.querySelector('input[name="periodicite"][value="mois"]').checked = true;
for (const n of ['cfe', 'fe', 'rappel7', 'rappel1']) form.elements[n].checked = true;
$('#outil-calendrier').hidden = false;
rafraichir();
