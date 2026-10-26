// Outil « Mentions légales et confidentialité de site ». Sécurité : jamais d'innerHTML ; aucune requête réseau ; aucun stockage.
import * as M from '../lib/mentions-site.js';

const $ = (s, r = document) => r.querySelector(s);
const h = (tag, attrs = {}, ...enfants) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (v === false || v == null) continue; el.setAttribute(k, v === true ? '' : String(v)); }
  for (const c of enfants.flat(Infinity)) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
};
const form = $('#formulaire');
let essai = false;
const touches = new Set();
let docs = [];

function lire() {
  const d = M.docVide();
  for (const el of form.querySelectorAll('[name]')) {
    const [a, b] = el.name.split('.');
    const cible = b ? d[a] : d; const cle = b ?? a;
    cible[cle] = el.type === 'checkbox' ? el.checked : el.value;
  }
  return d;
}
function ecrire(d) {
  for (const el of form.querySelectorAll('[name]')) {
    const [a, b] = el.name.split('.'); const v = b ? d[a][b] : d[a];
    if (el.type === 'checkbox') el.checked = !!v; else el.value = v ?? '';
  }
}
function dessinerDoc(doc) {
  return h('article', { class: 'texte-genere' }, h('h3', {}, doc.titre), doc.sections.map((s) => [h('h4', {}, s.titre), s.blocs.map((b) => (b.p !== undefined ? h('p', {}, b.p) : h('ul', {}, b.liste.map((x) => h('li', {}, x)))))]));
}
function bilan(a) {
  const zone = $('#bilan'); zone.replaceChildren();
  for (const b of ['#copier-html', '#copier-texte']) { const el = $(b); el.setAttribute('aria-disabled', a.bloque ? 'true' : 'false'); el.classList.toggle('inactif', a.bloque); }
  if (a.bloque) { zone.append(h('p', { class: 'bilan-titre erreur' }, `${a.erreurs.length} point${a.erreurs.length > 1 ? 's' : ''} à compléter avant de copier`)); if (essai) zone.append(h('ul', {}, a.erreurs.map((e) => h('li', {}, e.message)))); }
  else zone.append(h('p', { class: 'bilan-titre ok' }, 'Vos textes contiennent les éléments demandés.'));
  if (a.avertissements.length) zone.append(h('ul', { class: 'avertissements' }, a.avertissements.map((c) => h('li', {}, c))));
}
function marquer(a) {
  for (const el of form.querySelectorAll('[aria-invalid]')) el.removeAttribute('aria-invalid');
  for (const p of form.querySelectorAll('.champ-erreur')) p.remove();
  const vus = new Set();
  for (const e of a.erreurs) {
    if (vus.has(e.champ) || !(essai || touches.has(e.champ))) continue; vus.add(e.champ);
    const el = form.elements[e.champ]; if (!el) continue; const id = `err-${e.champ.replace(/\./g, '-')}`;
    el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', id);
    (el.closest('.champ') ?? el.parentElement).append(h('p', { class: 'champ-erreur', id }, e.message));
  }
}
function rafraichir() {
  const d = lire(), a = M.analyser(d);
  docs = [M.mentionsLegales(d), M.confidentialite(d)];
  $('#textes-zone').replaceChildren(...docs.map(dessinerDoc)); marquer(a); bilan(a);
  return a;
}
async function copier(texte, libelle) {
  const a = rafraichir();
  if (a.bloque) { essai = true; rafraichir(); form.querySelector('[aria-invalid="true"]')?.focus(); return; }
  const sortie = texte(); const etat = $('#etat-copie');
  try { await navigator.clipboard.writeText(sortie); etat.textContent = `${libelle} copié dans le presse-papiers.`; } catch { etat.textContent = 'Copie impossible : sélectionnez le texte affiché ci-dessous et copiez-le.'; }
}
form.addEventListener('input', rafraichir);
form.addEventListener('change', rafraichir);
form.addEventListener('focusout', (ev) => { if (ev.target.name) { touches.add(ev.target.name); rafraichir(); } });
form.addEventListener('submit', (ev) => ev.preventDefault());
$('#copier-html').addEventListener('click', () => copier(() => docs.map(M.enHtml).join('\n\n'), 'Le code HTML'));
$('#copier-texte').addEventListener('click', () => copier(() => docs.map(M.enTexte).join('\n'), 'Le texte'));

{
  const d = M.docVide(); d.editeur.directeur = true; ecrire(d);
  $('#outil-mentions').hidden = false; rafraichir();
}
