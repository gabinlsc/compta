import test from 'node:test';
import assert from 'node:assert/strict';
import { ajouterJours, dateIsoValide, dernierJourDuMois, dateLongue } from '../../src/assets/js/lib/dates.js';

test('ajout de jours : changement de mois, d’année, bissextile, heure d’été', () => {
  assert.equal(ajouterJours('2026-01-31', 30), '2026-03-02');
  assert.equal(ajouterJours('2026-12-15', 30), '2027-01-14');
  assert.equal(ajouterJours('2028-02-28', 1), '2028-02-29');
  assert.equal(ajouterJours('2027-02-28', 1), '2027-03-01');
  assert.equal(ajouterJours('2026-03-28', 2), '2026-03-30'); // passage à l'heure d'été le 29 mars 2026
  assert.equal(ajouterJours('2026-10-24', 2), '2026-10-26'); // retour à l'heure d'hiver le 25 octobre 2026
  assert.equal(ajouterJours('2026-05-10', 0), '2026-05-10');
});
test('dates valides, fins de mois', () => {
  assert.ok(dateIsoValide('2028-02-29') && !dateIsoValide('2027-02-29') && !dateIsoValide('2026-13-01') && !dateIsoValide('26-01-01') && !dateIsoValide(''));
  assert.equal(dernierJourDuMois(2028, 2), '2028-02-29');
  assert.equal(dernierJourDuMois(2027, 2), '2027-02-28');
  assert.equal(dernierJourDuMois(2026, 12), '2026-12-31');
  assert.equal(dateLongue('2026-03-05'), '5 mars 2026');
});
