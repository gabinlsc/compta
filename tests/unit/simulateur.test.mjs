import test from 'node:test';
import assert from 'node:assert/strict';
import { chargerRegles } from '../../tools/lib/regles.mjs';
import { creerRegles } from '../../src/assets/js/lib/facture.js';
import { simuler, finAcre, formaterBp } from '../../src/assets/js/lib/simulateur.js';

const R = creerRegles(chargerRegles().entrees);
const AUJ = '2026-10-26';
const e = (o = {}) => ({ ca: '10000', periode: 'annee', activite: 'vente', acre: false, debutActivite: '', vl: false, depenses: '', ...o });
const sim = (o) => simuler(e(o), R, AUJ);

test('cotisations : taux publiés sur service-public.gouv.fr pour chaque activité', () => {
  assert.equal(sim({ activite: 'vente' }).social, 123000);        // 12,3 %
  assert.equal(sim({ activite: 'bic_services' }).social, 212000); // 21,2 %
  assert.equal(sim({ activite: 'bnc_ssi' }).social, 256000);      // 25,6 %
  assert.equal(sim({ activite: 'bnc_cipav' }).social, 232000);    // 23,2 %
});

test('versement libératoire : taux globaux publiés (13,3 / 22,9 / 27,8 / 25,4 %)', () => {
  for (const [act, global] of [['vente', 133000], ['bic_services', 229000], ['bnc_ssi', 278000], ['bnc_cipav', 254000]]) {
    const r = sim({ activite: act, vl: true });
    assert.equal(r.total, global, act);
    assert.equal(r.social + r.impotVl, global);
  }
  assert.equal(sim({ activite: 'bic_services', vl: true }).impotVl, 17000); // 1,7 % de 10 000 €
});

test('Acre : exemple officiel d’un électricien (21,2 % devient 15,9 %) et exonération de 25 %', () => {
  const r = sim({ activite: 'bic_services', acre: true, debutActivite: '2026-09-03' });
  assert.equal(r.social, 159000);
  assert.equal(r.tauxEffectifBp, 1590);
  assert.equal(formaterBp(r.tauxEffectifBp), '15,9 %');
  assert.equal(sim({ activite: 'vente', acre: true }).social, 92250); // 12,3 % × 75 % = 9,225 %
});

test('Acre avec versement libératoire : seule la part cotisations est réduite', () => {
  const r = sim({ activite: 'bic_services', acre: true, vl: true });
  assert.equal(r.social, 159000); assert.equal(r.impotVl, 17000); assert.equal(r.total, 176000);
});

test('fin de l’Acre : fin du 3e trimestre civil suivant le début (exemples officiels)', () => {
  assert.equal(finAcre('2026-09-03', 3), '2027-06-30'); // 10 mois seulement
  assert.equal(finAcre('2026-07-01', 3), '2027-06-30'); // 12 mois
  assert.equal(finAcre('2026-10-15', 3), '2027-09-30');
  assert.equal(finAcre('2026-12-31', 3), '2027-09-30');
  assert.equal(finAcre('2027-01-01', 3), '2027-12-31');
});

test('Acre : créations avant le 1er juillet 2026 refusées (autre taux), Acre terminée signalée', () => {
  assert.equal(sim({ acre: true, debutActivite: '2026-03-01' }).bloque, true);
  assert.equal(sim({ acre: true, debutActivite: '2026-03-01' }).erreurs[0].champ, 'debutActivite');
  const fini = simuler(e({ acre: true, debutActivite: '2026-07-01' }), R, '2027-07-15');
  assert.match(fini.alertes[0].texte, /terminée le 30 juin 2027/);
});

test('net : chiffre d’affaires − cotisations − dépenses, arrondi au centime', () => {
  const r = sim({ ca: '2 500,50', periode: 'mois', activite: 'bnc_ssi', depenses: '300' });
  assert.equal(r.social, 64013);       // 250050 × 25,6 % = 640,128 → 640,13
  assert.equal(r.net, 250050 - 64013 - 30000);
  assert.equal(sim({ ca: '0' }).total, 0);
});

test('plafond de chiffre d’affaires et seuils de TVA : alertes selon l’activité', () => {
  const niveaux = (o) => sim(o).alertes.map((a) => a.niveau + ':' + a.texte.slice(0, 30));
  assert.ok(sim({ ca: '90000', activite: 'bic_services' }).alertes.some((a) => a.niveau === 'danger' && /Plafond/.test(a.texte)));
  assert.ok(!sim({ ca: '90000', activite: 'vente' }).alertes.some((a) => /Plafond/.test(a.texte))); // le plafond de la vente est plus haut
  assert.ok(sim({ ca: '40000', activite: 'bic_services' }).alertes.some((a) => a.niveau === 'attention' && /franchise de TVA/.test(a.texte)));
  assert.ok(sim({ ca: '42000', activite: 'bnc_ssi' }).alertes.some((a) => a.niveau === 'danger' && /majoré/.test(a.texte)));
  assert.ok(sim({ ca: '80000', activite: 'vente' }).alertes.some((a) => a.niveau === 'info' && /approchez du seuil de franchise de TVA/.test(a.texte)));
  assert.deepEqual(sim({ ca: '10000', activite: 'bic_services' }).alertes.filter((a) => a.niveau !== 'info'), []);
  assert.ok(niveaux({ ca: '90000', activite: 'bic_services' }).length);
});

test('projection annuelle : un mois à 4 000 € représente 48 000 € par an', () => {
  const r = sim({ ca: '4000', periode: 'mois', activite: 'bic_services' });
  assert.equal(r.annuel, 4_800_000); assert.equal(r.projection, true);
  assert.ok(r.alertes.some((a) => /estimation sur l’année/.test(a.texte)));
  assert.equal(sim({ ca: '1000', periode: 'trimestre' }).annuel, 400_000);
});

test('revenu imposable avant barème : abattements officiels (exemples service-public.gouv.fr) et minimum de 305 €', () => {
  assert.equal(sim({ ca: '175000', activite: 'vente' }).imposable.base, 5_075_000);        // 175 000 − 71 % = 50 750 €
  assert.equal(sim({ ca: '65000', activite: 'bic_services' }).imposable.base, 3_250_000);  // − 50 % = 32 500 €
  assert.equal(sim({ ca: '65000', activite: 'bnc_ssi' }).imposable.base, 4_290_000);       // − 34 % = 42 900 €
  const petit = sim({ ca: '400', activite: 'bnc_ssi' });
  assert.equal(petit.imposable.abattement, 30500); assert.equal(petit.imposable.base, 9500);
  assert.equal(sim({ ca: '10000', vl: true }).imposable, null);                              // avec versement libératoire : pas de revenu imposable à calculer
});

test('saisies invalides et données non vérifiées', () => {
  assert.equal(sim({ ca: 'abc' }).erreurs[0].champ, 'ca');
  assert.equal(sim({ ca: '' }).bloque, true);
  assert.equal(sim({ depenses: '12,345' }).erreurs[0].champ, 'depenses');
  assert.equal(sim({ ca: '-5' }).bloque, true);
  const entrees = chargerRegles().entrees.map((x) => (x.id === 'taux_vente' ? { ...x, statut: 'a_verifier', valeur: null } : x));
  const r = simuler(e(), creerRegles(entrees), AUJ);
  assert.equal(r.bloque, true); assert.match(r.erreurs[0].message, /taux_vente/);
});

test('part du net dans le chiffre d’affaires : le total des parts égale le chiffre d’affaires', () => {
  const r = sim({ ca: '3000', activite: 'bic_services', vl: true, depenses: '200' });
  assert.equal(r.parts.reduce((a, p) => a + p.montant, 0), r.ca);
});
