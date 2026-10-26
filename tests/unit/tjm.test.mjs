import test from 'node:test';
import assert from 'node:assert/strict';
import { chargerRegles } from '../../tools/lib/regles.mjs';
import { creerRegles } from '../../src/assets/js/lib/facture.js';
import { calculerTarif, HYPOTHESES } from '../../src/assets/js/lib/tjm.js';

const R = creerRegles(chargerRegles().entrees);
const e = (o = {}) => ({ net: '2000', activite: 'bic_services', acre: false, debutActivite: '', vl: false, ...HYPOTHESES, ...o });
const calc = (o) => calculerTarif(e(o), R, '2026-10-26');

test('le chiffre d’affaires trouvé redonne exactement le revenu visé après cotisations et frais (contrôle par le simulateur)', () => {
  for (const [act, net, frais] of [['bic_services', '2000', '0'], ['bnc_ssi', '3500', '200'], ['vente', '1500', '50'], ['bnc_cipav', '4000', '0']]) {
    const r = calc({ activite: act, net, fraisMensuels: frais });
    assert.equal(r.bloque, false);
    const attendu = Number(net) * 100 * 12;
    assert.ok(r.controle.net >= attendu && r.controle.net - attendu <= 2, `${act} : net annuel ${r.controle.net} pour un objectif de ${attendu}`); // jamais en dessous, au centime près
  }
});

test('calcul à la main : 2 000 € net par mois en prestations BIC, sans frais', () => {
  const r = calc();
  assert.equal(r.tauxBp, 2120);                       // 21,2 %
  assert.equal(r.caAnnuel, Math.ceil(2400000 / 0.788)); // 24 000 € / (1 − 0,212) = 30 456,85 €
  assert.equal(r.joursDispo, 5 * 47 - 8);             // 235 − 8 = 227 jours disponibles
  assert.equal(r.joursFacturables, 158.9);            // 227 × 70 %
  assert.equal(r.tjm, Math.ceil(r.caAnnuel / 100 / 158.9));
  assert.equal(r.tauxHoraire, Math.ceil(r.caAnnuel / 100 / (158.9 * 7)));
});

test('versement libératoire et Acre modifient le taux comme dans le simulateur', () => {
  assert.equal(calc({ vl: true }).tauxBp, 2290);
  assert.equal(calc({ acre: true }).tauxBp, 1590);
  assert.equal(calc({ acre: true, vl: true }).tauxBp, 1590 + 170);
  assert.ok(calc({ acre: true }).tjm < calc().tjm);
});

test('plus de jours non facturés ou de frais : tarif plus élevé ; plus de congés aussi', () => {
  const base = calc().tjm;
  assert.ok(calc({ pourcentNonFacture: '50' }).tjm > base); assert.ok(calc({ fraisMensuels: '300' }).tjm > base);
  assert.ok(calc({ semainesConges: '8' }).tjm > base); assert.ok(calc({ joursSemaine: '4' }).tjm > base);
});

test('alertes de plafond : un objectif très élevé dépasse le plafond et la franchise de TVA', () => {
  const r = calc({ net: '6000' });
  assert.ok(r.alertes.some((a) => a.niveau === 'danger' && /Plafond/.test(a.texte))); assert.ok(r.alertes.some((a) => /franchise de TVA/.test(a.texte)));
  assert.deepEqual(calc({ net: '1000' }).alertes.filter((a) => a.niveau === 'danger'), []);
});

test('saisies invalides', () => {
  for (const [o, champ] of [[{ net: '' }, 'net'], [{ net: '-5' }, 'net'], [{ joursSemaine: '0' }, 'joursSemaine'], [{ semainesConges: '53' }, 'semainesConges'], [{ pourcentNonFacture: '100' }, 'pourcentNonFacture'], [{ heuresJour: '0' }, 'heuresJour'], [{ fraisMensuels: 'x' }, 'fraisMensuels']])
    assert.ok(calc(o).erreurs.some((x) => x.champ === champ), champ);
  assert.equal(calc({ joursSemaine: '1', semainesConges: '52' }).bloque, true);
});

test('donnée non vérifiée : le calcul est bloqué', () => {
  const entrees = chargerRegles().entrees.map((x) => (x.id === 'taux_bic_services' ? { ...x, statut: 'a_verifier', valeur: null } : x));
  assert.equal(calculerTarif(e(), creerRegles(entrees), '2026-10-26').bloque, true);
});
