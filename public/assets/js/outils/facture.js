// Outil « Devis et factures » : relie le formulaire à src/assets/js/lib/facture.js et dessine l'aperçu.
// Règles de sécurité : jamais d'innerHTML ; tout texte saisi passe par textContent ; aucune requête réseau ; rien n'est stocké sans clic sur « Enregistrer ».
import { creerRegles, analyser, docVide, ligneVide, proposerNumero, TYPES } from '../lib/facture.js?v=6f339342';
import { nettoyerDoc, nettoyerEtat, exporterEtat, importerEtat, CLE } from '../lib/etat.js?v=6f339342';
import { formaterEuros, formaterQuantite } from '../lib/money.js?v=6f339342';
import { dateLongue, aujourdhui } from '../lib/dates.js?v=6f339342';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const AUJ = aujourdhui();
const eur = (c) => formaterEuros(c, { decimales: 2 });

function h(tag, attrs = {}, ...enfants) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (v === false || v == null) continue; if (k === 'class') el.className = v; else if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else el.setAttribute(k, v === true ? '' : String(v)); }
  for (const c of enfants.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
}

// ---------------------------------------------------------------- données réglementaires (embarquées dans la page, jamais saisies en dur ici)
const regles = creerRegles(JSON.parse($('#regles-data').textContent));

// ---------------------------------------------------------------- état
let doc = docVide(AUJ);
let modeles = [];
let documents = [];
const touches = new Set();
let essaiImpression = false;
let numeroAuto = true;

const form = $('#formulaire');
const lectureSeule = (el) => el.type === 'file';
const chemin = (nom) => nom.split('.');
function lire(o, nom) { return chemin(nom).reduce((a, k) => (a == null ? a : a[k]), o); }
function ecrire(o, nom, valeur) { const p = chemin(nom); let a = o; p.slice(0, -1).forEach((k) => { a = a[k]; }); a[p.at(-1)] = valeur; }

/** Formulaire → document (les champs nommés par chemin : « emetteur.nom », « lignes.0.desc »…). */
function depuisFormulaire() {
  const d = nettoyerDoc(doc, AUJ);
  for (const el of $$('[name]', form)) {
    if (lectureSeule(el)) continue;
    const nom = el.name;
    if (el.type === 'radio') { if (el.checked) ecrire(d, nom, el.value); continue; }
    try { ecrire(d, nom, el.type === 'checkbox' ? el.checked : el.value); } catch { /* ligne supprimée entre-temps */ }
  }
  return d;
}
/** Document → formulaire. */
function versFormulaire(d) {
  doc = d;
  dessinerLignes(); dessinerAcomptes();
  for (const el of $$('[name]', form)) {
    const v = lire(d, el.name);
    if (el.type === 'radio') el.checked = v === el.value;
    else if (el.type === 'checkbox') el.checked = v === true;
    else if (!lectureSeule(el)) el.value = v ?? '';
  }
}

// ---------------------------------------------------------------- lignes et acomptes dynamiques
function champLigne(i, nom, label, attrs = {}, classe = '') {
  const id = `l-${i}-${nom}`;
  return h('div', { class: 'champ ' + classe }, h('label', { for: id }, label), h('input', { id, name: `lignes.${i}.${nom}`, type: 'text', maxlength: attrs.maxlength ?? 300, inputmode: attrs.inputmode, autocomplete: 'off', ...attrs }));
}
function dessinerLignes() {
  const zone = $('#lignes'); zone.replaceChildren();
  doc.lignes.forEach((_, i) => {
    zone.append(h('fieldset', { class: 'ligne' }, h('legend', {}, `Ligne ${i + 1}`),
      champLigne(i, 'desc', 'Désignation', { maxlength: 300 }, 'desc'),
      champLigne(i, 'qty', 'Quantité', { inputmode: 'decimal', maxlength: 8 }),
      champLigne(i, 'unite', 'Unité', { maxlength: 20, placeholder: 'h, jour…' }),
      champLigne(i, 'prix', 'Prix unitaire (€)', { inputmode: 'decimal', maxlength: 14 }),
      champLigne(i, 'remise', 'Remise (%)', { inputmode: 'decimal', maxlength: 6 }),
      h('p', { class: 'ligne-total', id: `lt-${i}` }, ''),
      h('div', { class: 'ligne-actions' },
        h('button', { type: 'button', class: 'btn ghost petit', 'data-act': 'modele', 'data-i': i, 'aria-label': `Mémoriser la ligne ${i + 1} comme modèle` }, 'Mémoriser'),
        h('button', { type: 'button', class: 'btn ghost petit danger', 'data-act': 'supprimer', 'data-i': i, 'aria-label': `Supprimer la ligne ${i + 1}`, disabled: doc.lignes.length < 2 }, 'Supprimer'))));
  });
}
function dessinerAcomptes() {
  const zone = $('#acomptes'); zone.replaceChildren();
  doc.acomptes.forEach((_, i) => zone.append(h('fieldset', { class: 'ligne acompte' }, h('legend', {}, `Acompte ${i + 1}`),
    h('div', { class: 'champ' }, h('label', { for: `a-${i}-numero` }, 'N° de la facture d’acompte'), h('input', { id: `a-${i}-numero`, name: `acomptes.${i}.numero`, type: 'text', maxlength: 40, autocomplete: 'off' })),
    h('div', { class: 'champ' }, h('label', { for: `a-${i}-montant` }, 'Montant payé (€)'), h('input', { id: `a-${i}-montant`, name: `acomptes.${i}.montant`, type: 'text', inputmode: 'decimal', maxlength: 14, autocomplete: 'off' })),
    h('div', { class: 'ligne-actions' }, h('button', { type: 'button', class: 'btn ghost petit danger', 'data-act': 'supprimer-acompte', 'data-i': i, disabled: doc.acomptes.length < 2 }, 'Supprimer')))));
}

// ---------------------------------------------------------------- visibilité selon le type et le client
function visibilite(d) {
  const facturier = ['facture', 'acompte', 'solde'].includes(d.type);
  for (const el of $$('[data-pour]')) el.hidden = !el.dataset.pour.split(' ').includes(d.type);
  for (const el of $$('[data-client]')) el.hidden = el.dataset.client !== d.client.type;
  // un champ à la fois pro/particulier et facturier (ex. garantie) doit satisfaire les deux conditions
  for (const el of $$('[data-pour][data-client]')) el.hidden = !(el.dataset.pour.split(' ').includes(d.type) && el.dataset.client === d.client.type);
  $('.si-fixe').hidden = !(facturier && d.reglement.penalites === 'fixe');
  for (const l of $$('label[data-etiquettes]')) { const e = JSON.parse(l.dataset.etiquettes); l.textContent = e[d.type] ?? l.textContent; }
  $('#bloc-reglement').hidden = false;
  $('#bloc-modeles').hidden = modeles.length === 0;
}

// ---------------------------------------------------------------- aperçu
const ligneInfo = (t) => (t ? h('div', {}, t) : null);
function feuille(a, d) {
  const e = d.emetteur, c = d.client, devis = d.type === 'devis';
  const rows = a.lignes.map((l) => h('tr', {}, h('td', {}, l.desc), h('td', { class: 'num' }, `${formaterQuantite(l.qty100)}${l.unite ? ' ' + l.unite : ''}`), h('td', { class: 'num' }, eur(l.unit)),
    h('td', { class: 'num' }, l.remise100 ? `${String(l.remise100 / 100).replace('.', ',')} %` : ''), h('td', { class: 'num' }, eur(l.total * a.signe))));
  const adresseClient = [c.adresse.trim(), [c.cp.trim(), c.ville.trim()].filter(Boolean).join(' ')].filter(Boolean);
  const totalLibelle = d.type === 'avoir' ? 'Total de l’avoir' : devis ? 'Total du devis' : d.type === 'solde' ? 'Solde à payer' : d.type === 'acompte' ? 'Acompte à payer' : 'Total à payer';
  return h('article', { class: 'feuille', 'aria-label': 'Aperçu du document' },
    a.bloque ? h('p', { class: 'brouillon' }, 'BROUILLON : à compléter avant impression') : null,
    h('header', { class: 'feuille-tete' },
      h('div', { class: 'feuille-emetteur' }, a.identite.map((t, i) => (i === 0 ? h('div', {}, h('b', {}, t)) : ligneInfo(t))), ligneInfo(e.email.trim()), ligneInfo(e.tel.trim())),
      h('div', { class: 'feuille-titre' }, h('h3', {}, a.titre.toUpperCase()), h('p', {}, h('b', {}, `N° ${d.numero.trim() || '…'}`)), h('p', {}, `Date : ${dateLongue(d.dateEmission)}`),
        d.datePrestation ? h('p', {}, d.type === 'acompte' ? `Acompte versé le ${dateLongue(d.datePrestation)}` : `Prestation ou livraison : ${dateLongue(d.datePrestation)}`) : null,
        a.validJusqua ? h('p', {}, `Valable jusqu’au ${dateLongue(a.validJusqua)}`) : null,
        a.echeance ? h('p', {}, a.echeance === d.dateEmission ? 'Échéance : à réception' : `Échéance : ${dateLongue(a.echeance)}`) : null,
        d.reference.trim() ? h('p', {}, `${d.type === 'avoir' ? 'Facture annulée' : 'Devis'} : ${d.reference.trim()}`) : null,
        d.bonCommande.trim() ? h('p', {}, `Bon de commande : ${d.bonCommande.trim()}`) : null)),
    h('section', { class: 'feuille-client' }, h('small', {}, devis ? 'Destinataire' : 'Facturé à'), h('b', {}, c.nom.trim() || 'Nom du client'), adresseClient.map((t) => ligneInfo(t)),
      ligneInfo(c.siren.trim() ? `SIREN ${c.siren.trim()}` : null), ligneInfo(c.tvaIntra.trim() ? `TVA intracommunautaire ${c.tvaIntra.trim()}` : null),
      c.adresseLivraison.trim() ? h('div', { class: 'livraison' }, h('small', {}, 'Adresse de livraison'), h('div', {}, c.adresseLivraison.trim())) : null),
    d.objet.trim() ? h('p', { class: 'feuille-objet' }, h('b', {}, 'Objet : '), d.objet.trim()) : null,
    h('table', { class: 'feuille-table' },
      h('thead', {}, h('tr', {}, ['Désignation', 'Qté', 'Prix unitaire', 'Remise', 'Total'].map((t, i) => h('th', { scope: 'col', class: i ? 'num' : '' }, t)))),
      h('tbody', {}, rows.length ? rows : h('tr', {}, h('td', { colspan: 5, class: 'vide' }, 'Ajoutez une ligne pour la voir ici.')))),
    a.acompteInfo ? h('p', { class: 'feuille-note' }, `Total convenu : ${eur(a.acompteInfo.base)}. Acompte de ${a.acompteInfo.pct} %.`) : null,
    a.deductions.length ? h('div', { class: 'feuille-deductions' }, h('div', { class: 'ligne-total-simple' }, h('span', {}, 'Total de la commande'), h('span', {}, eur(a.sousTotal))),
      a.deductions.map((x) => h('div', { class: 'ligne-total-simple' }, h('span', {}, `Acompte déjà facturé (${x.numero})`), h('span', {}, `− ${eur(x.montant)}`)))) : null,
    h('div', { class: 'feuille-total' }, h('span', {}, totalLibelle), h('b', {}, eur(a.total))),
    h('p', { class: 'feuille-note' }, devis ? 'Prix nets : TVA non applicable.' : 'Total net à payer : TVA non applicable.'),
    !devis && d.type !== 'avoir' && (a.iban || a.bic) ? h('p', { class: 'feuille-paiement' }, h('b', {}, 'Règlement par virement : '), [e.banque.trim(), a.iban && `IBAN ${a.iban}`, a.bic && `BIC ${a.bic}`].filter(Boolean).join(' · '), d.numero.trim() ? ` · référence ${d.numero.trim()}` : '') : null,
    devis ? h('div', { class: 'feuille-signature' }, h('b', {}, 'Bon pour accord'), h('p', {}, 'Date, nom et signature du client, précédés de la mention « Bon pour accord » :'), h('div', { class: 'feuille-signature-case' })) : null,
    h('footer', { class: 'feuille-mentions' }, a.mentions.map((m) => h('p', {}, m))));
}

function marquerChamps(a) {
  for (const el of $$('[name]', form)) { el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); }
  for (const p of $$('.champ-erreur', form)) p.remove();
  const parChamp = new Map();
  for (const er of a.erreurs) if (!parChamp.has(er.champ)) parChamp.set(er.champ, er.message);
  for (const [champ, message] of parChamp) {
    if (!(essaiImpression || touches.has(champ))) continue;
    const el = form.elements[champ] ?? $(`[name^="${champ}."]`, form);
    if (!el || el.closest('[hidden]')) continue;
    const id = `err-${champ.replace(/\./g, '-')}`;
    el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', id);
    (el.closest('.champ') ?? el.parentElement).append(h('p', { class: 'champ-erreur', id }, message));
  }
}

function bilan(a) {
  const zone = $('#bilan'); zone.replaceChildren();
  const bouton = $('#imprimer');
  bouton.setAttribute('aria-disabled', a.bloque ? 'true' : 'false'); bouton.classList.toggle('inactif', a.bloque);
  if (a.bloque) {
    const montrer = essaiImpression;
    zone.append(h('p', { class: 'bilan-titre erreur' }, `${a.erreurs.length} point${a.erreurs.length > 1 ? 's' : ''} à compléter avant l’impression`));
    if (montrer) zone.append(h('ul', {}, a.erreurs.map((er) => h('li', {}, h('button', { type: 'button', class: 'lien', 'data-champ': er.champ }, er.message)))));
  } else zone.append(h('p', { class: 'bilan-titre ok' }, 'Le document est complet : vous pouvez l’imprimer ou l’enregistrer en PDF.'));
  if (a.avertissements.length) zone.append(h('ul', { class: 'avertissements' }, a.avertissements.map((t) => h('li', {}, t))));
}

function rafraichir() {
  const d = depuisFormulaire();
  doc = d;
  visibilite(d);
  const a = analyser(d, regles, AUJ);
  // total de chaque ligne saisie
  for (const l of a.lignesSaisies) { const p = $(`#lt-${l.i}`); if (p) p.textContent = `Total de la ligne : ${eur(l.total)}`; }
  d.lignes.forEach((_, i) => { if (!a.lignesSaisies.some((l) => l.i === i)) { const p = $(`#lt-${i}`); if (p) p.textContent = ''; } });
  $('#total-live').textContent = a.lignes.length ? `Total : ${eur(a.total)}` : '';
  $('#feuille-zone').replaceChildren(feuille(a, d));
  marquerChamps(a); bilan(a);
  return a;
}

// ---------------------------------------------------------------- stockage explicite (navigateur) et fichiers
let stockage = null;
try { stockage = window.localStorage; stockage.getItem(CLE); } catch { stockage = null; }
const message = (t) => { $('#etat-stockage').textContent = t; };
function lireStockage() {
  if (!stockage) return null;
  try { const brut = stockage.getItem(CLE); return brut ? nettoyerEtat(JSON.parse(brut), AUJ) : null; } catch { return null; }
}
function etatCourant() { return { emetteur: doc.emetteur, modeles, documents }; }
function ecrireStockage() { stockage.setItem(CLE, exporterEtat(nettoyerEtat(etatCourant(), AUJ))); }
function listeDocuments() {
  const ul = $('#liste-documents'); ul.replaceChildren();
  $('#documents-enregistres').hidden = documents.length === 0;
  documents.forEach((x, i) => ul.append(h('li', {}, h('span', {}, `${TYPES[x.type].titre} ${x.numero || '(sans numéro)'} · ${x.client.nom || 'client non renseigné'}`),
    h('button', { type: 'button', class: 'btn ghost petit', 'data-act': 'ouvrir', 'data-i': i }, 'Ouvrir'), h('button', { type: 'button', class: 'btn ghost petit danger', 'data-act': 'retirer', 'data-i': i }, 'Supprimer'))));
}
const cle = (x) => `${x.type}|${x.numero}`;
const aDuContenu = (d) => d.numero.trim() && (d.client.nom.trim() || d.lignes.some((l) => l.desc.trim())); // un formulaire vierge n'est pas un document à garder

$('#enregistrer').addEventListener('click', () => {
  if (!stockage) { message('L’enregistrement dans ce navigateur n’est pas disponible (navigation privée ou stockage bloqué). Utilisez « Exporter (JSON) ».'); return; }
  const d = depuisFormulaire();
  if (aDuContenu(d)) { const i = documents.findIndex((x) => cle(x) === cle(d)); if (i >= 0) documents[i] = d; else documents.push(d); }
  try { ecrireStockage(); listeDocuments(); message(`Enregistré dans ce navigateur (${documents.length} document${documents.length > 1 ? 's' : ''}, ${modeles.length} modèle${modeles.length > 1 ? 's' : ''} de ligne). Rien n’a quitté votre appareil.`); }
  catch { message('Impossible d’enregistrer (espace de stockage plein ou bloqué).'); }
});
$('#exporter').addEventListener('click', () => {
  const d = depuisFormulaire();
  const etat = nettoyerEtat({ emetteur: d.emetteur, modeles, documents: aDuContenu(d) && !documents.some((x) => cle(x) === cle(d)) ? [...documents, d] : documents }, AUJ);
  const lien = h('a', { href: URL.createObjectURL(new Blob([exporterEtat(etat)], { type: 'application/json' })), download: `compta-by-glsc-${AUJ}.json` });
  document.body.append(lien); lien.click(); lien.remove(); setTimeout(() => URL.revokeObjectURL(lien.href), 1000);
  message('Fichier exporté : gardez-le précieusement, il contient vos informations.');
});
$('#importer').addEventListener('change', async (ev) => {
  const f = ev.target.files[0]; ev.target.value = '';
  if (!f) return;
  try {
    const etat = importerEtat(await f.text(), AUJ);
    modeles = etat.modeles; documents = etat.documents;
    const d = depuisFormulaire(); d.emetteur = etat.emetteur; versFormulaire(d); listeDocuments(); rafraichir();
    message(`Importé : ${documents.length} document${documents.length > 1 ? 's' : ''}, ${modeles.length} modèle${modeles.length > 1 ? 's' : ''}. Cliquez sur « Enregistrer dans ce navigateur » pour les conserver ici.`);
    majModeles();
  } catch (e) { message(e.message); }
});
$('#effacer').addEventListener('click', () => {
  if (!window.confirm('Effacer tout ce qui est enregistré dans ce navigateur et vider le formulaire ?')) return;
  try { stockage?.removeItem(CLE); } catch { /* rien à effacer */ }
  modeles = []; documents = []; numeroAuto = true;
  versFormulaire(docVide(AUJ)); proposer(); listeDocuments(); majModeles(); touches.clear(); essaiImpression = false; rafraichir();
  message('Tout a été effacé.');
});
$('#nouveau').addEventListener('click', () => {
  const d = docVide(AUJ); d.emetteur = depuisFormulaire().emetteur; d.type = doc.type; numeroAuto = true;
  versFormulaire(d); proposer(); touches.clear(); essaiImpression = false; rafraichir(); message('Nouveau document : vos informations sont conservées.');
});
$('#liste-documents').addEventListener('click', (ev) => {
  const b = ev.target.closest('button[data-act]'); if (!b) return;
  const i = Number(b.dataset.i);
  if (b.dataset.act === 'ouvrir') { numeroAuto = false; versFormulaire(nettoyerDoc(documents[i], AUJ)); touches.clear(); rafraichir(); message('Document ouvert.'); }
  else if (window.confirm('Supprimer ce document enregistré ?')) { documents.splice(i, 1); try { ecrireStockage(); } catch { /* ignoré */ } listeDocuments(); }
});

// ---------------------------------------------------------------- modèles de lignes
function majModeles() {
  const sel = $('#modeles'); sel.replaceChildren(h('option', { value: '' }, 'Insérer un modèle de ligne…'));
  modeles.forEach((m, i) => sel.append(h('option', { value: i }, `${m.desc}${m.prix ? ` (${m.prix} €)` : ''}`)));
  $('#bloc-modeles').hidden = modeles.length === 0;
}
$('#modeles').addEventListener('change', (ev) => {
  const m = modeles[Number(ev.target.value)]; ev.target.value = ''; if (!m) return;
  const d = depuisFormulaire(); const vide = d.lignes.length === 1 && !d.lignes[0].desc && !d.lignes[0].prix;
  const l = { ...ligneVide(), desc: m.desc, unite: m.unite, prix: m.prix }; d.lignes = vide ? [l] : [...d.lignes, l]; versFormulaire(d); rafraichir();
});

// ---------------------------------------------------------------- numéros
function proposer() {
  const d = depuisFormulaire();
  d.numero = proposerNumero(d.type, d.dateEmission || AUJ, documents.map((x) => x.numero));
  const champ = $('#f-numero'); champ.value = d.numero; doc = d;
}
$('#proposer-numero').addEventListener('click', () => { numeroAuto = true; proposer(); rafraichir(); });

// ---------------------------------------------------------------- événements du formulaire
form.addEventListener('input', (ev) => { if (ev.target.name === 'numero') numeroAuto = false; rafraichir(); });
form.addEventListener('change', (ev) => {
  if (ev.target.name === 'type' || ev.target.name === 'dateEmission') { const d = depuisFormulaire(); if (ev.target.name === 'type' && (numeroAuto || /^[DFA]-\d{4}-\d{3}$/.test(d.numero))) proposer(); if (ev.target.name === 'type' && ev.target.value === 'acompte') $('#f-reglement-delai').value = '0'; }
  rafraichir();
});
// Un champ « touché » (quitté) peut afficher son erreur ; les erreurs de groupe (adresse, lignes, acomptes) s'affichent dès qu'un de leurs champs l'est.
const GROUPES = { 'emetteur.cp': 'emetteur.adresse', 'emetteur.ville': 'emetteur.adresse', 'client.cp': 'client.adresse', 'client.ville': 'client.adresse' };
form.addEventListener('focusout', (ev) => {
  const nom = ev.target.name; if (!nom) return;
  touches.add(nom); if (GROUPES[nom]) touches.add(GROUPES[nom]);
  if (nom.startsWith('lignes.')) touches.add('lignes'); if (nom.startsWith('acomptes.')) touches.add('acomptes');
  rafraichir();
});
form.addEventListener('click', (ev) => {
  const b = ev.target.closest('button[data-act]'); if (!b) return;
  const i = Number(b.dataset.i), d = depuisFormulaire();
  if (b.dataset.act === 'supprimer') { d.lignes.splice(i, 1); versFormulaire(d); }
  else if (b.dataset.act === 'supprimer-acompte') { d.acomptes.splice(i, 1); versFormulaire(d); }
  else if (b.dataset.act === 'modele') {
    const l = d.lignes[i]; if (!l.desc.trim()) { message('Écrivez d’abord une désignation pour pouvoir mémoriser la ligne.'); return; }
    modeles.push({ desc: l.desc.trim(), unite: l.unite.trim(), prix: l.prix.trim() }); majModeles(); message('Modèle mémorisé pour cette visite. Cliquez sur « Enregistrer dans ce navigateur » pour le conserver.');
  }
  rafraichir();
});
$('#ajouter-ligne').addEventListener('click', () => { const d = depuisFormulaire(); if (d.lignes.length >= 40) return; d.lignes.push(ligneVide()); versFormulaire(d); rafraichir(); $$('[name$=".desc"]', form).at(-1).focus(); });
$('#ajouter-acompte').addEventListener('click', () => { const d = depuisFormulaire(); if (d.acomptes.length >= 10) return; d.acomptes.push({ numero: '', montant: '' }); versFormulaire(d); rafraichir(); });

$('#bilan').addEventListener('click', (ev) => {
  const b = ev.target.closest('button[data-champ]'); if (!b) return;
  const el = form.elements[b.dataset.champ] ?? $(`[name^="${b.dataset.champ}"]`, form);
  if (el) { el.closest('details')?.setAttribute('open', ''); el.focus(); }
});
$('#imprimer').addEventListener('click', () => {
  const a = rafraichir();
  if (a.bloque) { essaiImpression = true; rafraichir(); const premier = $('[aria-invalid="true"]', form); premier?.closest('details')?.setAttribute('open', ''); premier?.focus(); $('#bilan').scrollIntoView({ block: 'nearest' }); return; }
  const titre = document.title; document.title = `${TYPES[doc.type].titre} ${doc.numero}`.trim(); // nom proposé pour le fichier PDF
  window.print(); setTimeout(() => { document.title = titre; }, 500);
});

// ---------------------------------------------------------------- démarrage
{
  const sauve = lireStockage();
  const d = docVide(AUJ);
  if (sauve) { d.emetteur = sauve.emetteur; modeles = sauve.modeles; documents = sauve.documents; }
  versFormulaire(d); proposer(); listeDocuments(); majModeles();
  $('#outil-facture').hidden = false;
  rafraichir();
  message(sauve ? 'Vos informations enregistrées sur cet appareil ont été chargées.' : stockage ? '' : 'Le stockage du navigateur n’est pas disponible : utilisez l’export JSON pour garder vos données.');
}
