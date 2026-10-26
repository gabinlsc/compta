import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseMontant, parseQuantite, parsePourcent, totalLigne, somme, partEnPourcent, formaterEuros } from '../../src/assets/js/lib/money.js';
import { luhn, sirenValide, siretValide, ibanValide, bicValide, formaterIban } from '../../src/assets/js/lib/valid.js';

const fx = JSON.parse(readFileSync(new URL('../fixtures/php-billing.json', import.meta.url), 'utf8'));

test('croisé PHP : total de ligne identique sur toutes les entrées (arrondi au centime)', () => {
  fx.entrees.lignes.forEach((l, i) => {
    const qty100 = Math.round(l.qty * 100);
    assert.equal(totalLigne({ qty100, unit: l.unit }), fx.sorties.lignes[i], `qté ${l.qty} × ${l.unit} centimes`);
  });
});

test('croisé PHP : format des montants identique', () => {
  fx.entrees.montants.forEach((m, i) => assert.equal(formaterEuros(m).replaceAll('\u202f', 'NNBSP').replaceAll('\u00a0', 'NBSP'), fx.sorties.montants[i], String(m)));
});

test('croisé PHP : clé de Luhn, SIREN et SIRET identiques', () => {
  fx.entrees.nombres.forEach((n, i) => {
    const o = fx.sorties.nombres[i];
    assert.equal(luhn(n), o.luhn, `luhn ${n}`);
    assert.equal(sirenValide(n), o.siren, `siren ${n}`);
    if (!n.startsWith('356000000')) assert.equal(siretValide(n), o.siret, `siret ${n}`); // exception La Poste prise en compte en JS seulement
  });
});

test('arrondis : demi vers l’extérieur, jamais de flottant', () => {
  assert.equal(totalLigne({ qty100: 150, unit: 333 }), 500);      // 499,5 → 500
  assert.equal(totalLigne({ qty100: 250, unit: 4500 }), 11250);
  assert.equal(totalLigne({ qty100: 100, unit: -5000 }), -5000);
  assert.equal(totalLigne({ qty100: 50, unit: 1 }), 1);           // 0,5 → 1
  assert.equal(totalLigne({ qty100: 999900, unit: 10_000_000_00 }), 9_999_000_000_000); // sans perte de précision (au-delà de 2^53)
  assert.equal(somme([{ qty100: 100, unit: 59000 }, { qty100: 100, unit: 15000 }]), 74000);
});

test('remise : appliquée sur le total de ligne, arrondie au centime', () => {
  assert.equal(totalLigne({ qty100: 100, unit: 10000, remise100: 1000 }), 9000);    // 10 %
  assert.equal(totalLigne({ qty100: 300, unit: 333, remise100: 1250 }), 874);       // 999 − 12,5 % = 874,125
  assert.equal(totalLigne({ qty100: 100, unit: 10000, remise100: 10000 }), 0);
});

test('acompte : pourcentage arrondi comme billing.php', () => {
  assert.equal(partEnPourcent(74000, 50), 37000);
  assert.equal(partEnPourcent(74001, 50), 37001); // 37000,5 → 37001
  assert.equal(partEnPourcent(10000, 30), 3000);
});

test('saisie des montants : virgule, espaces, euro, refus des décimales en trop', () => {
  assert.equal(parseMontant('1 234,56 €'), 123456);
  assert.equal(parseMontant('45'), 4500);
  assert.equal(parseMontant('45.5'), 4550);
  assert.equal(parseMontant('-5,00'), -500);
  assert.equal(parseMontant('0,5'), 50);
  assert.equal(parseMontant('12,345'), null);
  assert.equal(parseMontant(''), null);
  assert.equal(parseMontant('abc'), null);
  assert.equal(parseQuantite('2,5'), 250);
  assert.equal(parseQuantite('0'), null);
  assert.equal(parseQuantite('-1'), null);
  assert.equal(parseQuantite('1,234'), null);
  assert.equal(parsePourcent(''), 0);
  assert.equal(parsePourcent('12,5 %'), 1250);
  assert.equal(parsePourcent('101'), null);
});

test('format : espaces insécables, centimes seulement s’il y en a, ou toujours avec decimales: 2', () => {
  assert.equal(formaterEuros(123456), '1 234,56 €');
  assert.equal(formaterEuros(59000), '590 €');
  assert.equal(formaterEuros(59000, { decimales: 2 }), '590,00 €');
  assert.equal(formaterEuros(-5), '−0,05 €');
});

test('identifiants : SIREN, SIRET, IBAN, BIC', () => {
  assert.ok(sirenValide('732 829 320') && !sirenValide('732829321') && !sirenValide('12345'));
  assert.ok(siretValide('73282932000074') && !siretValide('73282932000075'));
  assert.ok(ibanValide('FR14 2004 1010 0505 0001 3M02 606') && !ibanValide('FR14 2004 1010 0505 0001 3M02 607') && !ibanValide('FR14 2004'));
  assert.ok(ibanValide('DE89 3704 0044 0532 0130 00') && ibanValide('GB82 WEST 1234 5698 7654 32'));
  assert.equal(formaterIban('fr1420041010050500013m02606'), 'FR14 2004 1010 0505 0001 3M02 606');
  assert.ok(bicValide('BNPAFRPP') && bicValide('BNPAFRPPXXX') && !bicValide('BNPA'));
});
