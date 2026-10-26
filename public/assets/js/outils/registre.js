// Outil « Registre RGPD simplifié ». Sécurité : jamais d'innerHTML ; aucune requête réseau ; stockage uniquement sur action explicite.
import { creerRegles } from '../lib/facture.js?v=0a2b4039';
import * as R from '../lib/registre.js?v=0a2b4039';

const $ = (s, r = document) => r.querySelector(s);
const h = (tag, attrs = {}, ...enfants) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (v === false || v == null) continue; if (k === 'class') el.className = v; else el.setAttribute(k, v === true ? '' : String(v)); }
  for (const c of enfants.flat(Infinity)) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
};
const regles = creerRegles(JSON.parse($('#regles-data').textContent));
const form = $('#formulaire');
let reg = R.registreVide();
let essai = false;
const touches = new Set();
let stockage = null;
try { stockage = window.localStorage; stockage.getItem(R.CLE); } catch { stockage = null; }
const message = (t) => { $('#etat-stockage').textContent = t; };

function champTexte(i, k, label, { long = false, aide = '' } = {}) {
  const id = `t-${i}-${k}`, nom = `traitements.${i}.${k}`;
  return h('div', { class: 'champ large' }, h('label', { for: id }, label), long ? h('textarea', { id, name: nom, rows: 3, maxlength: 600 }) : h('input', { id, name: nom, type: 'text', maxlength: k === 'nom' ? 120 : 600 }), aide ? h('p', { class: 'aide' }, aide) : null);
}
function dessiner() {
  const zone = $('#traitements'); zone.replaceChildren();
  reg.traitements.forEach((t, i) => {
    zone.append(h('fieldset', { class: 'ligne traitement', 'data-i': i }, h('legend', {}, `Activité ${i + 1}`),
      champTexte(i, 'nom', 'Nom de l’activité *'),
      champTexte(i, 'finalite', 'Finalité : à quoi servent ces données ? *', { long: true }),
      champTexte(i, 'personnes', 'Catégories de personnes concernées *', { long: true }),
      champTexte(i, 'donnees', 'Catégories de données *', { long: true }),
      champTexte(i, 'destinataires', 'Destinataires, prestataires compris *', { long: true }),
      h('div', { class: 'champ large' }, h('label', { for: `t-${i}-base` }, 'Base légale (recommandée)'), h('select', { id: `t-${i}-base`, name: `traitements.${i}.base` }, R.BASES.map((b) => h('option', { value: b }, b || 'À choisir')))),
      h('div', { class: 'champ large' }, h('label', { for: `t-${i}-transferts` }, 'Transfert hors de l’Union européenne ?'), h('select', { id: `t-${i}-transferts`, name: `traitements.${i}.transferts` }, h('option', { value: 'non' }, 'Non'), h('option', { value: 'oui' }, 'Oui'))),
      champTexte(i, 'transfertsPrecision', 'Si oui : pays ou organisation, et garanties prévues'),
      champTexte(i, 'duree', 'Durée de conservation (ou critères pour la fixer) *', { long: true, aide: 'Soyez concret : par exemple « 3 ans après le dernier contact ».' }),
      h('fieldset', { class: 'options' }, h('legend', {}, 'Mesures de sécurité *'), R.MESURES.map((m, j) => h('div', { class: 'champ coche' }, h('label', {}, h('input', { type: 'checkbox', name: `traitements.${i}.mesures`, value: m, id: `m-${i}-${j}` }), ' ', h('span', {}, m))))),
      champTexte(i, 'securiteAutre', 'Autres mesures de sécurité'),
      h('div', { class: 'ligne-actions' }, h('button', { type: 'button', class: 'btn ghost petit danger', 'data-supprimer': i, 'aria-label': `Supprimer l’activité ${i + 1}` }, 'Supprimer cette fiche'))));
  });
}
function ecrire() {
  for (const el of form.querySelectorAll('[name^="org."]')) el.value = reg.org[el.name.slice(4)] ?? '';
  reg.traitements.forEach((t, i) => {
    for (const el of form.querySelectorAll(`[name^="traitements.${i}."]`)) {
      const k = el.name.split('.')[2];
      if (el.type === 'checkbox') el.checked = t.mesures.includes(el.value); else el.value = t[k] ?? '';
    }
  });
}
function lire() {
  const r = R.nettoyer(reg);
  for (const el of form.querySelectorAll('[name^="org."]')) r.org[el.name.slice(4)] = el.value;
  r.traitements = reg.traitements.map((_, i) => {
    const t = R.traitementVide(); t.mesures = [];
    for (const el of form.querySelectorAll(`[name^="traitements.${i}."]`)) {
      const k = el.name.split('.')[2];
      if (el.type === 'checkbox') { if (el.checked) t.mesures.push(el.value); } else t[k] = el.value;
    }
    return t;
  });
  return r;
}

function feuille(r) {
  const o = r.org;
  return h('article', { class: 'feuille registre', 'aria-label': 'Aperçu du registre' },
    h('header', { class: 'feuille-tete' }, h('div', {}, h('h3', {}, 'REGISTRE DES ACTIVITÉS DE TRAITEMENT'), h('p', {}, 'Responsable de traitement (article 30 du RGPD)')), h('div', { class: 'feuille-titre' }, h('p', {}, `Mis à jour le ${new Date().toLocaleDateString('fr-FR')}`))),
    h('section', { class: 'feuille-client' }, h('small', {}, 'Organisme'), h('b', {}, o.nom.trim() || 'Nom de votre organisme'), h('div', {}, o.adresse.trim()), h('div', {}, [o.email.trim(), o.tel.trim()].filter(Boolean).join(' · ')), o.dpo.trim() ? h('div', {}, `Délégué ou point de contact : ${o.dpo.trim()}`) : null),
    r.traitements.length ? r.traitements.map((t, i) => h('section', { class: 'fiche' }, h('h4', {}, `${i + 1}. ${t.nom.trim() || 'Activité sans nom'}`),
      h('dl', {}, [['Finalité', t.finalite], ['Personnes concernées', t.personnes], ['Catégories de données', t.donnees], ['Destinataires', t.destinataires], ['Base légale', t.base],
        ['Transfert hors Union européenne', t.transferts === 'oui' ? `Oui : ${t.transfertsPrecision}` : 'Non'], ['Durée de conservation', t.duree], ['Mesures de sécurité', [...t.mesures, t.securiteAutre.trim()].filter(Boolean).join(' ; ')]]
        .filter(([, v]) => String(v).trim()).map(([k, v]) => [h('dt', {}, k), h('dd', {}, v)])))) : h('p', { class: 'vide' }, 'Ajoutez une fiche pour la voir ici.'));
}
function bilan(a) {
  const zone = $('#bilan'); zone.replaceChildren();
  const bouton = $('#imprimer'); bouton.setAttribute('aria-disabled', a.bloque ? 'true' : 'false'); bouton.classList.toggle('inactif', a.bloque);
  if (a.bloque) { zone.append(h('p', { class: 'bilan-titre erreur' }, `${a.erreurs.length} point${a.erreurs.length > 1 ? 's' : ''} à compléter avant l’impression`)); if (essai) zone.append(h('ul', {}, a.erreurs.map((e) => h('li', {}, e.message)))); }
  else zone.append(h('p', { class: 'bilan-titre ok' }, 'Le registre contient les éléments minimaux demandés par la CNIL.'));
  if (a.conseils.length) zone.append(h('ul', { class: 'avertissements' }, a.conseils.map((c) => h('li', {}, c))));
}
function marquer(a) {
  for (const el of form.querySelectorAll('[aria-invalid]')) el.removeAttribute('aria-invalid');
  for (const p of form.querySelectorAll('.champ-erreur')) p.remove();
  const vus = new Set();
  for (const e of a.erreurs) {
    if (vus.has(e.champ) || !(essai || touches.has(e.champ))) continue; vus.add(e.champ);
    const el = form.elements[e.champ] ?? form.querySelector(`[name^="${e.champ}"]`); if (!el) continue;
    const cible = el.length ? el[0] : el; const id = `err-${e.champ.replace(/\./g, '-')}`;
    cible.setAttribute('aria-invalid', 'true'); cible.setAttribute('aria-describedby', id);
    (cible.closest('.champ') ?? cible.parentElement).append(h('p', { class: 'champ-erreur', id }, e.message));
  }
}
function rafraichir() {
  reg = lire();
  const a = R.analyser(reg);
  $('#feuille-zone').replaceChildren(feuille(reg)); marquer(a); bilan(a);
  if (reg.auto) sauver();
  return a;
}
const sauver = () => { if (!stockage) return false; try { stockage.setItem(R.CLE, R.exporter(reg)); return true; } catch { message('Impossible d’enregistrer (stockage plein ou bloqué).'); return false; } };

form.addEventListener('input', rafraichir);
form.addEventListener('change', rafraichir);
form.addEventListener('focusout', (ev) => { const n = ev.target.name; if (n) { touches.add(n); if (/\.mesures$/.test(n)) touches.add(n); rafraichir(); } });
form.addEventListener('submit', (ev) => ev.preventDefault());
form.addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-supprimer]'); if (!b) return;
  if (!window.confirm('Supprimer cette fiche ?')) return;
  reg = lire(); reg.traitements.splice(Number(b.dataset.supprimer), 1); dessiner(); ecrire(); rafraichir();
});
$('#ajouter-traitement').addEventListener('click', () => {
  reg = lire(); if (reg.traitements.length >= 40) return;
  reg.traitements.push(R.modele($('#modele-choix').value, regles)); dessiner(); ecrire(); rafraichir();
  form.querySelector(`[name="traitements.${reg.traitements.length - 1}.nom"]`)?.focus();
});
$('#imprimer').addEventListener('click', () => {
  const a = rafraichir();
  if (a.bloque) { essai = true; rafraichir(); form.querySelector('[aria-invalid="true"]')?.focus(); return; }
  const t = document.title; document.title = 'Registre des activités de traitement'; window.print(); setTimeout(() => { document.title = t; }, 500);
});
$('#enregistrer').addEventListener('click', () => { if (!stockage) { message('L’enregistrement dans ce navigateur n’est pas disponible : utilisez l’export JSON.'); return; } reg = lire(); if (sauver()) message('Enregistré dans ce navigateur. Rien n’a quitté votre appareil.'); });
$('#exporter').addEventListener('click', () => {
  reg = lire(); const lien = h('a', { href: URL.createObjectURL(new Blob([R.exporter(reg)], { type: 'application/json' })), download: 'registre-rgpd.json' });
  document.body.append(lien); lien.click(); lien.remove(); setTimeout(() => URL.revokeObjectURL(lien.href), 1000); message('Fichier exporté : il contient vos informations, gardez-le précieusement.');
});
$('#importer').addEventListener('change', async (ev) => {
  const f = ev.target.files[0]; ev.target.value = ''; if (!f) return;
  try { reg = R.importer(await f.text()); dessiner(); ecrire(); rafraichir(); message('Registre importé. Cliquez sur « Enregistrer dans ce navigateur » pour le conserver ici.'); } catch (e) { message(e.message); }
});
$('#effacer').addEventListener('click', () => {
  if (!window.confirm('Effacer le registre enregistré dans ce navigateur et vider le formulaire ?')) return;
  try { stockage?.removeItem(R.CLE); } catch { /* rien à effacer */ }
  reg = R.registreVide(); dessiner(); ecrire(); touches.clear(); essai = false; rafraichir(); message('Tout a été effacé.');
});

{
  let sauve = null;
  try { const brut = stockage?.getItem(R.CLE); if (brut) sauve = R.importer(brut); } catch { sauve = null; }
  if (sauve) { reg = sauve; message('Votre registre enregistré sur cet appareil a été chargé.'); }
  dessiner(); ecrire(); $('#outil-registre').hidden = false; rafraichir();
}
