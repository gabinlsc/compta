// Outil « Livre des recettes ». Sécurité : jamais d'innerHTML ; aucune requête réseau ; stockage seulement sur action explicite (bouton ou case « enregistrement automatique »).
import { creerRegles } from '../lib/facture.js?v=4fe9bb99';
import { ACTIVITES } from '../lib/simulateur.js?v=4fe9bb99';
import * as L from '../lib/livre.js?v=4fe9bb99';
import { formaterEuros } from '../lib/money.js?v=4fe9bb99';
import { dateLongue, aujourdhui } from '../lib/dates.js?v=4fe9bb99';

const $ = (s, r = document) => r.querySelector(s);
const AUJ = aujourdhui();
const eur = (c) => formaterEuros(c, { decimales: 2 });
const h = (tag, attrs = {}, ...enfants) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (v === false || v == null) continue; if (k === 'class') el.className = v; else el.setAttribute(k, v === true ? '' : String(v)); }
  for (const c of enfants.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
};
const regles = creerRegles(JSON.parse($('#regles-data').textContent));
const form = $('#formulaire');
const reglages = { annee: $('[name="annee"]'), activite: $('[name="activite"]'), periodicite: $('[name="periodicite"]'), auto: $('[name="auto"]') };
let etat = L.etatVide();
let stockage = null;
try { stockage = window.localStorage; stockage.getItem(L.CLE); } catch { stockage = null; }
const message = (t) => { $('#etat-stockage').textContent = t; };
const annee = () => Number(reglages.annee.value);

function sauver() {
  if (!stockage) return false;
  try { stockage.setItem(L.CLE, L.exporterEtat(etat)); return true; } catch { message('Impossible d’enregistrer (espace de stockage plein ou bloqué).'); return false; }
}
const auto = () => { if (etat.auto) sauver(); };

function remplirAnnees(garder) {
  const annees = new Set([Number(AUJ.slice(0, 4)), ...etat.entrees.map((e) => Number(e.date.slice(0, 4)))]);
  const liste = [...annees].sort((a, b) => b - a);
  reglages.annee.replaceChildren(...liste.map((a) => h('option', { value: a }, String(a))));
  reglages.annee.value = String(liste.includes(garder) ? garder : liste[0]);
}

function rendre() {
  const a = annee(), lignes = L.chronologie(etat, a), totalAnnee = L.total(lignes);
  const zone = $('#tableau-zone'), synthese = $('#synthese');
  zone.replaceChildren(); synthese.replaceChildren();
  const act = ACTIVITES[etat.activite], plafond = regles.valeur(act.plafond);
  const periodes = L.totauxPeriodes(etat, a, regles), prochaine = L.prochainePeriode(periodes, AUJ);

  // ---- synthèse : total, jauge, période à déclarer, alertes
  synthese.append(h('div', { class: 'carte-net' }, h('p', { class: 'etiquette' }, `Chiffre d’affaires encaissé en ${a}`), h('p', { class: 'grand' }, eur(totalAnnee)),
    plafond !== null ? h('div', { class: 'jauge' }, h('progress', { max: plafond * 100, value: Math.max(0, Math.min(totalAnnee, plafond * 100)), 'aria-label': 'Part du plafond de chiffre d’affaires utilisée' }),
      h('p', { class: 'muted' }, `${Math.round((Math.max(totalAnnee, 0) / (plafond * 100)) * 1000) / 10} % du plafond de ${eur(plafond * 100)} (${act.libelle.toLowerCase()})`.replace('.', ','))) : null));
  if (prochaine) synthese.append(h('p', { class: 'a-declarer' }, h('strong', {}, 'À déclarer : '), `${eur(prochaine.total)} pour ${prochaine.libelle.toLowerCase()}, avant le ${dateLongue(prochaine.echeance)}.`));
  const al = L.alertes(etat, a, regles);
  if (al.length) synthese.append(h('ul', { class: 'alertes' }, al.map((x) => h('li', { class: `alerte ${x.niveau}` }, h('strong', {}, x.niveau === 'danger' ? 'Attention : ' : x.niveau === 'attention' ? 'À surveiller : ' : 'Bon à savoir : '), x.texte))));

  // ---- périodes de déclaration
  zone.append(h('h3', {}, 'Par période de déclaration'));
  zone.append(h('div', { class: 'table-wrap' }, h('table', { class: 'resume periodes' }, h('thead', {}, h('tr', {}, ['Période', 'Chiffre d’affaires', 'À déclarer avant le'].map((t, i) => h('th', { scope: 'col', class: i === 1 ? 'num' : '' }, t)))),
    h('tbody', {}, periodes.map((p) => h('tr', { class: p === prochaine ? 'total' : '' }, h('th', { scope: 'row' }, p.libelle), h('td', { class: 'num' }, eur(p.total)), h('td', {}, dateLongue(p.echeance))))))));

  // ---- écritures
  zone.append(h('h3', {}, `Écritures de ${a}`));
  if (!lignes.length) zone.append(h('p', { class: 'vide' }, 'Aucune recette pour cette année. Ajoutez votre première recette avec le formulaire.'));
  else zone.append(h('div', { class: 'table-wrap' }, h('table', { class: 'resume ecritures' }, h('caption', { class: 'sr-only' }, `Livre des recettes ${a}`),
    h('thead', {}, h('tr', {}, ['N°', 'Date', 'Origine', 'Nature', 'Règlement', 'Pièce', 'Montant', ''].map((t, i) => h('th', { scope: 'col', class: i === 6 ? 'num' : i === 7 ? 'no-print' : '' }, t)))),
    h('tbody', {}, lignes.map((e, i) => {
      const dejaCorrigee = etat.entrees.some((x) => x.corrige === e.id);
      return h('tr', { class: e.montant < 0 ? 'correction' : '' }, h('td', {}, String(i + 1)), h('td', {}, dateLongue(e.date)), h('td', {}, e.origine + (e.global ? ' (globale)' : '')), h('td', {}, e.nature), h('td', {}, L.MODES[e.mode]), h('td', {}, e.piece), h('td', { class: 'num' }, eur(e.montant)),
        h('td', { class: 'no-print' }, e.montant > 0 && !dejaCorrigee ? h('button', { type: 'button', class: 'lien', 'data-corriger': e.id, 'aria-label': `Corriger l’écriture ${i + 1} (${e.origine}, ${eur(e.montant)})` }, 'Corriger') : dejaCorrigee ? h('span', { class: 'muted' }, 'corrigée') : ''));
    })),
    h('tfoot', {}, h('tr', {}, h('th', { scope: 'row', colspan: 6 }, 'Total'), h('td', { class: 'num' }, eur(totalAnnee)), h('td', { class: 'no-print' }))))));
  // ---- totaux mensuels
  const mois = L.totauxMensuels(etat, a);
  zone.append(h('h3', {}, 'Par mois'));
  zone.append(h('div', { class: 'table-wrap' }, h('table', { class: 'resume mensuel' }, h('caption', { class: 'sr-only' }, 'Totaux mensuels'), h('tbody', {}, mois.map((m, i) => h('tr', {}, h('th', { scope: 'row' }, new Date(Date.UTC(a, i, 1)).toLocaleDateString('fr-FR', { month: 'long', timeZone: 'UTC' })), h('td', { class: 'num' }, eur(m))))))));
  $('#csv').disabled = lignes.length === 0;
}

function ajouter(ev) {
  ev.preventDefault();
  const g = (n) => form.elements[n];
  const v = L.validerSaisie({ date: g('date').value, origine: g('origine').value, nature: g('nature').value, montant: g('montant').value, mode: g('mode').value, piece: g('piece').value, global: g('global').checked });
  const erreur = $('#erreur-saisie');
  for (const el of form.elements) el.removeAttribute?.('aria-invalid');
  if (v.erreurs.length) { erreur.textContent = v.erreurs.map((e) => e.message).join(' '); const premier = form.elements[v.erreurs[0].champ]; premier?.setAttribute('aria-invalid', 'true'); premier?.focus(); return; }
  erreur.textContent = '';
  etat = L.ajouter(etat, v.entree);
  remplirAnnees(Number(v.entree.date.slice(0, 4)));
  for (const n of ['montant', 'origine', 'nature', 'piece']) g(n).value = ''; g('global').checked = false;
  auto(); rendre(); g('origine').focus();
  $('#statut-saisie').textContent = `Recette ajoutée au livre (${eur(v.entree.montant)}).`;
}

function telecharger(contenu, nom, type) {
  const lien = h('a', { href: URL.createObjectURL(new Blob([contenu], { type })), download: nom });
  document.body.append(lien); lien.click(); lien.remove(); setTimeout(() => URL.revokeObjectURL(lien.href), 1000);
}

form.addEventListener('submit', ajouter);
$('#tableau-zone').addEventListener('click', (ev) => {
  const b = ev.target.closest('button[data-corriger]'); if (!b) return;
  const r = L.corriger(etat, Number(b.dataset.corriger), AUJ);
  if (r.erreur) { $('#statut-saisie').textContent = r.erreur; return; }
  etat = r.etat; auto(); remplirAnnees(annee()); rendre(); $('#statut-saisie').textContent = 'Écriture inverse ajoutée. Saisissez maintenant la bonne recette.'; form.elements.origine.focus();
});
for (const n of ['annee']) reglages[n].addEventListener('change', rendre);
for (const n of ['activite', 'periodicite']) reglages[n].addEventListener('change', () => { etat = { ...etat, [n]: reglages[n].value }; auto(); rendre(); });
reglages.auto.addEventListener('change', () => {
  etat = { ...etat, auto: reglages.auto.checked };
  if (etat.auto) { if (stockage && sauver()) message('Enregistrement automatique activé : vos recettes sont gardées sur cet appareil.'); else { etat = { ...etat, auto: false }; reglages.auto.checked = false; message('L’enregistrement dans ce navigateur n’est pas disponible : utilisez l’export JSON.'); } }
  else { try { stockage?.setItem(L.CLE, L.exporterEtat(etat)); } catch { /* ignoré */ } message('Enregistrement automatique désactivé. Ce qui est déjà enregistré reste sur cet appareil jusqu’à « Tout effacer ».'); }
});
$('#enregistrer').addEventListener('click', () => { if (!stockage) { message('L’enregistrement dans ce navigateur n’est pas disponible : utilisez l’export JSON.'); return; } if (sauver()) message(`Enregistré dans ce navigateur (${etat.entrees.length} écriture${etat.entrees.length > 1 ? 's' : ''}). Rien n’a quitté votre appareil.`); });
$('#exporter-json').addEventListener('click', () => { telecharger(L.exporterEtat(etat), `livre-des-recettes-${AUJ}.json`, 'application/json'); message('Fichier exporté : gardez-le précieusement, il contient vos recettes.'); });
$('#csv').addEventListener('click', () => telecharger(L.exporterCsv(etat, annee()), `livre-des-recettes-${annee()}.csv`, 'text/csv;charset=utf-8'));
$('#imprimer').addEventListener('click', () => { const t = document.title; document.title = `Livre des recettes ${annee()}`; window.print(); setTimeout(() => { document.title = t; }, 500); });
$('#importer').addEventListener('change', async (ev) => {
  const f = ev.target.files[0]; ev.target.value = ''; if (!f) return;
  try { etat = L.importerEtat(await f.text()); reglages.activite.value = etat.activite; reglages.periodicite.value = etat.periodicite; reglages.auto.checked = etat.auto; remplirAnnees(annee()); rendre(); message(`Importé : ${etat.entrees.length} écriture${etat.entrees.length > 1 ? 's' : ''}. Cliquez sur « Enregistrer dans ce navigateur » pour les conserver ici.`); }
  catch (e) { message(e.message); }
});
$('#effacer').addEventListener('click', () => {
  if (!window.confirm('Effacer toutes les recettes de ce navigateur et vider le livre ?')) return;
  try { stockage?.removeItem(L.CLE); } catch { /* rien à effacer */ }
  etat = L.etatVide(); reglages.activite.value = etat.activite; reglages.periodicite.value = etat.periodicite; reglages.auto.checked = false; remplirAnnees(); rendre(); message('Tout a été effacé.');
});

// démarrage : on relit ce que l'utilisateur a lui-même enregistré
{
  let sauve = null;
  try { const brut = stockage?.getItem(L.CLE); if (brut) sauve = L.importerEtat(brut); } catch { sauve = null; }
  if (sauve) { etat = sauve; message(`Votre livre enregistré sur cet appareil a été chargé (${etat.entrees.length} écriture${etat.entrees.length > 1 ? 's' : ''}).`); }
  reglages.activite.value = etat.activite; reglages.periodicite.value = etat.periodicite; reglages.auto.checked = etat.auto;
  remplirAnnees(); form.elements.date.value = AUJ;
  $('#outil-livre').hidden = false;
  rendre();
}
