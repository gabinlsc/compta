import test from 'node:test';
import assert from 'node:assert/strict';
import { chargerRegles } from '../../tools/lib/regles.mjs';
import { creerRegles, analyser, docVide, proposerNumero, ligneVide } from '../../src/assets/js/lib/facture.js';
import { nettoyerDoc, importerEtat, exporterEtat, nettoyerEtat } from '../../src/assets/js/lib/etat.js';

const R = creerRegles(chargerRegles().entrees);
const AUJ = '2026-10-26';
const nbsp = (s) => s.replace(/[  ]/g, ' ');

function docOk(surcharge = {}) {
  const d = docVide(AUJ);
  d.numero = 'F-2026-001'; d.datePrestation = '2026-10-20';
  Object.assign(d.emetteur, { nom: 'Gabin Lescoat', adresse: '1 rue Test', cp: '35000', ville: 'Rennes', siren: '732 829 320', email: 'pro@glsc.fr', iban: 'FR14 2004 1010 0505 0001 3M02 606' });
  Object.assign(d.client, { nom: 'Boulangerie Le Fournil', adresse: '2 rue du Pain', cp: '56100', ville: 'Lorient', siren: '732829320' });
  d.lignes = [{ desc: 'Site vitrine', qty: '1', unite: '', prix: '590', remise: '' }, { desc: 'Fiche Google', qty: '2', unite: 'h', prix: '75', remise: '' }];
  return Object.assign(d, surcharge);
}
const champs = (a) => a.erreurs.map((e) => e.champ);

test('facture complète à un professionnel : aucune erreur, total, échéance et mentions', () => {
  const a = analyser(docOk(), R, AUJ);
  assert.deepEqual(a.erreurs, []);
  assert.equal(a.total, 74000);
  assert.equal(a.echeance, '2026-11-25');
  const m = nbsp(a.mentions.join(' | '));
  assert.match(m, /TVA non applicable, art\. L\. 223 et s\. du code des impositions sur les biens et services \(CIBS\)/);
  assert.match(m, /Escompte pour paiement anticipé : néant/);
  assert.match(m, /taux de refinancement de la Banque centrale européenne .* majoré de 10 points/);
  assert.match(m, /Indemnité forfaitaire pour frais de recouvrement .* : 40 €/);
  assert.match(m, /Nature de l’opération : prestation de services/);
  assert.match(a.identite.join(' | '), /Gabin Lescoat, Entrepreneur individuel \(EI\)/);
  assert.match(a.identite.join(' | '), /SIREN 732 829 320/);
});

test('ancienne mention de TVA (art. 293 B) disponible sur choix', () => {
  assert.match(analyser(docOk({ tvaMention: 'cgi' }), R, AUJ).mentions.join(' '), /TVA non applicable, art\. 293 B du code général des impôts/);
});

test('délai de paiement : 60 jours maximum entre professionnels, pas pour un particulier', () => {
  assert.ok(champs(analyser(docOk({ reglement: { delai: '61', penalites: 'bce', tauxFixe: '' } }), R, AUJ)).includes('reglement.delai'));
  assert.deepEqual(champs(analyser(docOk({ reglement: { delai: '60', penalites: 'bce', tauxFixe: '' } }), R, AUJ)), []);
  const part = docOk({ reglement: { delai: '90', penalites: 'bce', tauxFixe: '' } }); part.client.type = 'particulier';
  assert.deepEqual(champs(analyser(part, R, AUJ)), []);
});

test('particulier : pas d’indemnité de 40 €, garantie de conformité et médiateur sur demande', () => {
  const d = docOk({ garantieConformite: true }); d.client.type = 'particulier'; d.client.mediateur = 'Médiateur X, 1 rue Y';
  const m = nbsp(analyser(d, R, AUJ).mentions.join(' | '));
  assert.doesNotMatch(m, /Indemnité forfaitaire/);
  assert.match(m, /Garantie légale de conformité : 2 ans au minimum/);
  assert.match(m, /Médiateur de la consommation : Médiateur X/);
});

test('SIREN du client : conseillé avant le 1er septembre 2027, exigé à partir de cette date', () => {
  const d = docOk(); d.client.siren = '';
  assert.deepEqual(champs(analyser(d, R, '2027-08-31')), []);
  assert.match(analyser(d, R, '2027-08-31').avertissements.join(' '), /1 septembre 2027/);
  assert.deepEqual(champs(analyser(d, R, '2027-09-01')), ['client.siren']);
  d.client.siren = '123456789';
  assert.deepEqual(champs(analyser(d, R, AUJ)), ['client.siren']);
});

test('entreprise en cours d’immatriculation : « Siret en cours d’attribution », pas de SIREN exigé', () => {
  const d = docOk(); d.emetteur.enCours = true; d.emetteur.siren = '';
  const a = analyser(d, R, AUJ);
  assert.deepEqual(a.erreurs, []);
  assert.match(a.identite.join(' '), /Siret en cours d'attribution/);
  d.emetteur.enCours = false;
  assert.deepEqual(champs(analyser(d, R, AUJ)), ['emetteur.siren']);
});

test('identifiants invalides : SIREN, SIRET, IBAN, BIC, e-mail', () => {
  const d = docOk(); Object.assign(d.emetteur, { siren: '732829321', siret: '12345678901234', iban: 'FR00', bic: 'X', email: 'nope' });
  const c = champs(analyser(d, R, AUJ));
  for (const k of ['emetteur.siren', 'emetteur.siret', 'emetteur.iban', 'emetteur.bic', 'emetteur.email']) assert.ok(c.includes(k), k);
});

test('lignes : désignation sans prix, prix invalide, quantité invalide, document vide', () => {
  const d = docOk(); d.lignes = [{ desc: 'A', qty: '0', unite: '', prix: '10', remise: '' }, { desc: 'B', qty: '1', unite: '', prix: '1,234', remise: '' }, { desc: '', qty: '1', unite: '', prix: '5', remise: '' }];
  const c = champs(analyser(d, R, AUJ));
  assert.ok(c.includes('lignes.0.qty') && c.includes('lignes.1.prix') && c.includes('lignes.2.desc'));
  const vide = docOk(); vide.lignes = [ligneVide()];
  assert.deepEqual(champs(analyser(vide, R, AUJ)), ['lignes']);
});

test('remise sur une ligne', () => {
  const d = docOk(); d.lignes = [{ desc: 'Prestation', qty: '1', unite: '', prix: '1000', remise: '10' }];
  assert.equal(analyser(d, R, AUJ).total, 90000);
});

test('facture d’acompte : montant = pourcentage du total du devis', () => {
  const d = docOk({ type: 'acompte', acomptePct: '30', reference: 'D-2026-004' }); d.datePrestation = AUJ; d.reglement.delai = '0';
  const a = analyser(d, R, AUJ);
  assert.deepEqual(a.erreurs, []);
  assert.equal(a.total, 22200);
  assert.equal(a.acompteInfo.base, 74000);
  assert.match(a.lignes[0].desc, /Acompte de 30 % à la commande — devis D-2026-004/);
  assert.equal(a.echeance, AUJ);
  assert.ok(champs(analyser({ ...d, acomptePct: '100' }, R, AUJ)).includes('acomptePct'));
});

test('facture de solde : déduction des acomptes, refus si aucun acompte ou si dépassement', () => {
  const d = docOk({ type: 'solde' }); d.acomptes = [{ numero: 'F-2026-002', montant: '222' }];
  const a = analyser(d, R, AUJ);
  assert.deepEqual(a.erreurs, []);
  assert.equal(a.total, 74000 - 22200);
  d.acomptes = [{ numero: '', montant: '' }];
  assert.ok(champs(analyser(d, R, AUJ)).includes('acomptes'));
  d.acomptes = [{ numero: 'F-1', montant: '9999' }];
  assert.match(analyser(d, R, AUJ).erreurs.map((e) => e.message).join(' '), /dépassent le total/);
});

test('avoir : total négatif, facture annulée obligatoire', () => {
  const d = docOk({ type: 'avoir', numero: 'A-2026-001', reference: 'F-2026-001' });
  const a = analyser(d, R, AUJ);
  assert.deepEqual(a.erreurs, []);
  assert.equal(a.total, -74000);
  assert.deepEqual(champs(analyser({ ...d, reference: '' }, R, AUJ)), ['reference']);
});

test('devis : validité, aucune mention de pénalités ni d’indemnité, total positif', () => {
  const d = docOk({ type: 'devis', numero: 'D-2026-001', validiteJours: '30' });
  const a = analyser(d, R, AUJ);
  assert.deepEqual(a.erreurs, []);
  assert.equal(a.validJusqua, '2026-11-25');
  assert.equal(a.echeance, null);
  assert.doesNotMatch(nbsp(a.mentions.join(' ')), /Pénalités|Indemnité|Escompte/);
  assert.ok(champs(analyser({ ...d, validiteJours: '0' }, R, AUJ)).includes('validiteJours'));
});

test('pénalités : taux fixe contrôlé par rapport au minimum légal', () => {
  const d = docOk({ reglement: { delai: '30', penalites: 'fixe', tauxFixe: '5' } });
  assert.deepEqual(champs(analyser(d, R, AUJ)), ['reglement.tauxFixe']);
  d.reglement.tauxFixe = '12,4';
  const a = analyser(d, R, AUJ);
  assert.deepEqual(a.erreurs, []);
  assert.match(a.mentions.join(' '), /12,4 % par an/);
  assert.match(analyser(docOk({ reglement: { delai: '30', penalites: 'legal3', tauxFixe: '' } }), R, AUJ).mentions.join(' '), /trois fois le taux de l’intérêt légal/);
});

test('une donnée non vérifiée bloque le document au lieu d’être remplacée par une valeur en dur', () => {
  const entrees = chargerRegles().entrees.map((e) => e.id === 'indemnite_recouvrement' ? { ...e, statut: 'a_verifier', valeur: null } : e);
  const a = analyser(docOk(), creerRegles(entrees), AUJ);
  assert.ok(a.bloque);
  assert.match(a.erreurs[0].message, /indemnite_recouvrement/);
  assert.doesNotMatch(a.mentions.join(' '), /40/);
});

test('numérotation : suite proposée par année et par série', () => {
  assert.equal(proposerNumero('facture', '2026-10-26', []), 'F-2026-001');
  assert.equal(proposerNumero('facture', '2026-10-26', ['F-2026-001', 'F-2026-007', 'D-2026-012', 'F-2025-099']), 'F-2026-008');
  assert.equal(proposerNumero('devis', '2027-01-02', ['D-2026-012']), 'D-2027-001');
  assert.equal(proposerNumero('avoir', '2026-10-26', ['A-2026-001']), 'A-2026-002');
  assert.equal(proposerNumero('acompte', '2026-10-26', ['F-2026-003']), 'F-2026-004'); // acomptes et soldes suivent la série des factures
});

test('sauvegarde : export puis import redonne le même état ; entrées hostiles nettoyées', () => {
  const doc = docOk();
  const etat = nettoyerEtat({ emetteur: doc.emetteur, documents: [doc], modeles: [{ desc: 'Heure de conseil', unite: 'h', prix: '75' }] }, AUJ);
  const relu = importerEtat(exporterEtat(etat), AUJ);
  assert.deepEqual(relu, etat);
  const hostile = nettoyerDoc({ type: '__proto__', client: { nom: '<img src=x onerror=alert(1)>', type: 'x' }, lignes: 'pas un tableau', __proto__: { polluer: true }, emetteur: { nom: 42 } }, AUJ);
  assert.equal(hostile.type, 'facture'); assert.equal(hostile.client.type, 'pro'); assert.equal(hostile.emetteur.nom, '');
  assert.equal(hostile.client.nom, '<img src=x onerror=alert(1)>'); // conservé tel quel : toujours affiché via textContent, jamais interprété
  assert.equal(({}).polluer, undefined);
  assert.throws(() => importerEtat('pas du json', AUJ), /JSON/);
  assert.throws(() => importerEtat('{"format":"autre"}', AUJ), /ne vient pas/);
  assert.throws(() => importerEtat('x'.repeat(2_000_001), AUJ), /volumineux/);
});
