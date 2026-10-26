import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chargerRegles } from '../../tools/lib/regles.mjs';
import { creerRegles } from '../../src/assets/js/lib/facture.js';
import { etatVide, validerSaisie, ajouter, corriger, chronologie, total, totauxMensuels, periodes, totauxPeriodes, prochainePeriode, alertes, celluleCsv, csv, exporterCsv, nettoyerEtat, exporterEtat, importerEtat } from '../../src/assets/js/lib/livre.js';

const R = creerRegles(chargerRegles().entrees);
const fx = JSON.parse(readFileSync(new URL('../fixtures/php-billing.json', import.meta.url), 'utf8'));
const saisie = (o = {}) => ({ date: '2026-03-10', origine: 'Boulangerie Le Fournil', nature: 'Site vitrine', montant: '450', mode: 'virement', piece: 'F-2026-001', global: false, ...o });
const avec = (...ss) => ss.reduce((etat, s) => { const v = validerSaisie(s); assert.deepEqual(v.erreurs, []); return ajouter(etat, v.entree); }, etatVide());

test('croisé PHP : neutralisation des formules dans les cellules CSV identique à acct_csv_cell', () => {
  fx.entrees.cellules.forEach((c, i) => assert.equal(celluleCsv(c), fx.sorties.cellules[i], JSON.stringify(c)));
  assert.equal(csv(['N°', 'Montant (€)'], [[1, '=1+1'], [2, '12,50'], [3, 'a"b;c']]), fx.sorties.csv);
});

test('croisé PHP : périodes de déclaration et échéances identiques à acct_periods (années bissextiles comprises)', () => {
  const mapFreq = { month: 'mois', quarter: 'trimestre' };
  for (const a of fx.entrees.annees) for (const f of ['month', 'quarter']) {
    const attendu = fx.sorties.periodes.filter((p) => p.annee === a && p.freq === f);
    const obtenu = periodes(a, mapFreq[f], R);
    assert.equal(obtenu.length, attendu.length);
    obtenu.forEach((p, i) => { assert.equal(p.du, attendu[i].from); assert.equal(p.au, attendu[i].to); assert.equal(p.echeance, attendu[i].due, `${a} ${f} ${i}`); });
  }
});

test('saisie : champs obligatoires, montant strictement positif, mode de règlement', () => {
  assert.deepEqual(validerSaisie(saisie()).erreurs, []);
  const champs = (o) => validerSaisie(saisie(o)).erreurs.map((e) => e.champ);
  assert.deepEqual(champs({ date: '' }), ['date']); assert.deepEqual(champs({ origine: '  ' }), ['origine']); assert.deepEqual(champs({ montant: '0' }), ['montant']);
  assert.deepEqual(champs({ montant: '-5' }), ['montant']); assert.deepEqual(champs({ montant: '1,234' }), ['montant']); assert.deepEqual(champs({ mode: 'bitcoin' }), ['mode']);
  assert.equal(validerSaisie(saisie({ montant: '1 234,50 €' })).entree.montant, 123450);
});

test('écritures numérotées, chronologiques et non modifiables : correction par écriture inverse', () => {
  let etat = avec(saisie({ date: '2026-05-02', montant: '100' }), saisie({ date: '2026-03-10', montant: '450' }), saisie({ date: '2026-03-10', montant: '50' }));
  assert.deepEqual(chronologie(etat, 2026).map((e) => e.id), [2, 3, 1]);   // par date, puis ordre de saisie
  assert.equal(total(chronologie(etat, 2026)), 60000);
  const r = corriger(etat, 2, '2026-06-01');
  assert.equal(r.etat.entrees.at(-1).montant, -45000); assert.equal(r.etat.entrees.at(-1).corrige, 2); assert.match(r.etat.entrees.at(-1).nature, /Correction de l’écriture n° 2/);
  assert.equal(total(chronologie(r.etat, 2026)), 15000);
  assert.ok(corriger(r.etat, 2, '2026-06-02').erreur); assert.ok(corriger(r.etat, 4, '2026-06-02').erreur); assert.ok(corriger(r.etat, 99, '2026-06-02').erreur);
  assert.equal(etat.entrees.length, 3); // l'état d'origine n'est jamais modifié
});

test('totaux mensuels, périodes et échéances (mensuel et trimestriel)', () => {
  const etat = { ...avec(saisie({ date: '2026-01-15', montant: '100' }), saisie({ date: '2026-03-31', montant: '200' }), saisie({ date: '2026-04-01', montant: '300' }), saisie({ date: '2025-12-31', montant: '999' })), periodicite: 'trimestre' };
  assert.deepEqual(totauxMensuels(etat, 2026).slice(0, 4), [10000, 0, 20000, 30000]);
  const t = totauxPeriodes(etat, 2026, R);
  assert.deepEqual(t.map((p) => [p.libelle, p.total, p.echeance]), [['1er trimestre 2026', 30000, '2026-04-30'], ['2e trimestre 2026', 30000, '2026-07-31'], ['3e trimestre 2026', 0, '2026-10-31'], ['4e trimestre 2026', 0, '2027-01-31']]);
  assert.equal(totauxPeriodes({ ...etat, periodicite: 'mois' }, 2026, R)[2].echeance, '2026-04-30');
});

test('période à déclarer : la période terminée dont l’échéance approche, sinon la période en cours', () => {
  const t = totauxPeriodes({ ...etatVide(), periodicite: 'trimestre' }, 2026, R);
  assert.equal(prochainePeriode(t, '2026-04-10').libelle, '1er trimestre 2026');
  assert.equal(prochainePeriode(t, '2026-05-10').libelle, '2e trimestre 2026');
  assert.equal(prochainePeriode(t, '2026-04-30').libelle, '1er trimestre 2026');
});

test('alertes de plafond sur le total encaissé de l’année', () => {
  const etat = { ...avec(saisie({ montant: '90000' })), activite: 'bic_services' };
  assert.ok(alertes(etat, 2026, R).some((a) => a.niveau === 'danger' && /Plafond/.test(a.texte)));
  assert.deepEqual(alertes({ ...etat, activite: 'vente' }, 2026, R).filter((a) => a.niveau === 'danger'), [{ niveau: 'danger', texte: alertes({ ...etat, activite: 'vente' }, 2026, R)[0]?.texte }].filter((x) => /majoré/.test(x.texte)));
  assert.deepEqual(alertes(avec(saisie({ montant: '1000' })), 2026, R), []);
});

test('export CSV : BOM, point-virgule, virgule décimale, CRLF, formules neutralisées, total', () => {
  const etat = avec(saisie({ origine: '=HYPERLINK("http://x")', nature: '+cmd', montant: '1234,5' }), saisie({ date: '2026-04-02', montant: '100', mode: 'especes', global: true }));
  const sortie = exporterCsv(etat, 2026), lignes = sortie.split('\r\n');
  assert.ok(sortie.startsWith('﻿"N°";"Date d’encaissement"')); assert.ok(!/[^\r]\n/.test(sortie));
  assert.match(lignes[1], /^"1";"2026-03-10";"'=HYPERLINK\(""http:\/\/x""\)";"'\+cmd";"Virement";"F-2026-001";"1234,50"$/);
  assert.match(lignes[2], /"Espèces".*"100,00"/); assert.match(lignes[2], /écriture globale de fin de journée/);
  assert.match(lignes[3], /"Total";"1334,50"$/);
  assert.equal(exporterCsv(corriger(etat, 1, '2026-06-01').etat, 2026).split('\r\n')[3], '"3";"2026-06-01";"\'=HYPERLINK(""http://x"")";"Correction de l’écriture n° 1";"Virement";"F-2026-001";"-1234,50"');
});

test('sauvegarde : aller-retour, entrées hostiles ou incohérentes écartées', () => {
  const etat = { ...avec(saisie(), saisie({ date: '2026-04-02', montant: '75,5' })), activite: 'bnc_ssi', periodicite: 'trimestre', auto: true };
  assert.deepEqual(importerEtat(exporterEtat(etat)), etat);
  const sale = nettoyerEtat({ activite: 'x', periodicite: 'y', entrees: [{ id: 1, date: '2026-01-01', montant: 100, mode: 'cb', origine: '<img src=x onerror=1>' }, { id: 1, date: '2026-01-02', montant: 5, mode: 'cb' }, { id: 2, date: 'nope', montant: 5, mode: 'cb' }, { id: 3, date: '2026-01-01', montant: 1.5, mode: 'cb' }, { id: 4, date: '2026-01-01', montant: 0, mode: 'cb' }, { id: 5, date: '2026-01-01', montant: 5, mode: 'inconnu' }, null, 'x'], __proto__: { polluer: 1 } });
  assert.equal(sale.entrees.length, 1); assert.equal(sale.activite, 'bic_services'); assert.equal(sale.periodicite, 'mois'); assert.equal(sale.suivant, 2); assert.equal(({}).polluer, undefined);
  assert.equal(sale.entrees[0].origine, '<img src=x onerror=1>');
  assert.throws(() => importerEtat('{"format":"autre"}'), /ne vient pas/); assert.throws(() => importerEtat('x'), /JSON/);
});
