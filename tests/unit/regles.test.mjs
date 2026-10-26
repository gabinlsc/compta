import test from 'node:test';
import assert from 'node:assert/strict';
import { chargerRegles, validerRegles, remplirJetons, formaterValeur } from '../../tools/lib/regles.mjs';

const verifie = (o = {}) => ({ id: 'taux_test', libelle: 'Taux de test', unite: 'pourcent', valeur: 12.3, statut: 'verifie', source_url: 'https://www.urssaf.fr/page', source_titre: 'Urssaf', verifie_le: '2026-10-01', valable_du: '2026-01-01', valable_au: '2026-12-31', ...o });
const jeu = (...entrees) => ({ version: 1, entrees });

test('le fichier data/regles.json réel est valide', () => {
  const { erreurs } = validerRegles(chargerRegles(), '2026-10-26');
  assert.deepEqual(erreurs, []);
});

test('aucune valeur n’est publiée sans statut « verifie »', () => {
  for (const e of chargerRegles().entrees) if (e.statut === 'a_verifier') assert.equal(e.valeur, null, e.id);
});

test('une entrée vérifiée correcte est acceptée', () => {
  assert.deepEqual(validerRegles(jeu(verifie()), '2026-10-26'), { erreurs: [], perimees: [] });
});

test('une entrée « a_verifier » avec valeur est refusée', () => {
  const { erreurs } = validerRegles(jeu(verifie({ statut: 'a_verifier' })), '2026-10-26');
  assert.match(erreurs[0], /ne doit pas avoir de valeur/);
});

test('source non officielle refusée, sous-domaine officiel accepté', () => {
  assert.match(validerRegles(jeu(verifie({ source_url: 'https://blog.example.com/taux' })), '2026-10-26').erreurs[0], /non officielle/);
  assert.match(validerRegles(jeu(verifie({ source_url: 'https://evil-urssaf.fr/x' })), '2026-10-26').erreurs[0], /non officielle/);
  assert.deepEqual(validerRegles(jeu(verifie({ source_url: 'https://www.autoentrepreneur.urssaf.fr/x' })), '2026-10-26').erreurs, []);
});

test('source absente ou date de vérification absente : refus', () => {
  assert.ok(validerRegles(jeu(verifie({ source_url: null })), '2026-10-26').erreurs.length);
  assert.ok(validerRegles(jeu(verifie({ verifie_le: null })), '2026-10-26').erreurs.length);
});

test('garde-fou : plus de 6 mois ou période terminée = périmée', () => {
  assert.equal(validerRegles(jeu(verifie({ verifie_le: '2026-04-25' })), '2026-10-26').perimees.length, 1);
  assert.equal(validerRegles(jeu(verifie({ verifie_le: '2026-04-26' })), '2026-10-26').perimees.length, 0);
  assert.equal(validerRegles(jeu(verifie({ valable_au: '2026-12-31', verifie_le: '2026-12-30' })), '2027-01-01').perimees.length, 1);
});

test('identifiants en double et dates incohérentes refusés', () => {
  assert.ok(validerRegles(jeu(verifie(), verifie()), '2026-10-26').erreurs.some((e) => /double/.test(e)));
  assert.ok(validerRegles(jeu(verifie({ valable_du: '2027-01-01', valable_au: '2026-01-01' })), '2026-10-26').erreurs.length);
});

test('jetons : valeur formatée si vérifiée, « en cours de vérification » sinon, jeton inconnu = erreur', () => {
  const data = jeu(verifie(), verifie({ id: 'autre', statut: 'a_verifier', valeur: null }));
  assert.equal(remplirJetons('Taux : {{taux_test}}', data), 'Taux : 12,3 %');
  assert.equal(remplirJetons('{{autre}}', data), 'en cours de vérification');
  assert.throws(() => remplirJetons('{{absent}}', data), /Jeton inconnu/);
  assert.equal(formaterValeur(verifie({ unite: 'euro', valeur: 83600 })), '83 600 €');
});

test('les données publiées sont lues sur service-public.gouv.fr ou une autre source officielle', () => {
  for (const e of chargerRegles().entrees) if (e.statut === 'verifie') assert.match(e.source_url, /^https:\/\/(entreprendre\.service-public\.gouv\.fr|www\.urssaf\.fr|www\.impots\.gouv\.fr|www\.legifrance\.gouv\.fr|bofip\.impots\.gouv\.fr)\//, e.id);
});

test('cohérence des seuils : majoré supérieur au seuil de base, taux global avec versement libératoire supérieur au taux de cotisations', () => {
  const v = Object.fromEntries(chargerRegles().entrees.map((e) => [e.id, e.valeur]));
  assert.ok(v.tva_majore_vente > v.tva_franchise_vente && v.tva_majore_services > v.tva_franchise_services);
  for (const a of ['vente', 'bic_services', 'bnc_ssi', 'bnc_cipav']) assert.ok(v['taux_vl_' + a] > v['taux_' + a], a);
});

test('formats : dates complètes, jour et mois, jours, ans', () => {
  assert.equal(formaterValeur(verifie({ unite: 'date', valeur: '2026-09-01' })), '1er septembre 2026');
  assert.equal(formaterValeur(verifie({ unite: 'date', valeur: '2027-12-31' })), '31 décembre 2027');
  assert.equal(formaterValeur(verifie({ unite: 'jour_mois', valeur: '04-30' })), '30 avril');
  assert.equal(formaterValeur(verifie({ unite: 'jour_mois', valeur: '01-31' })), '31 janvier');
  assert.equal(formaterValeur(verifie({ unite: 'jours', valeur: 60 })), '60 jours');
  assert.equal(formaterValeur(verifie({ unite: 'ans', valeur: 10 })), '10 ans');
  assert.match(validerRegles(jeu(verifie({ unite: 'jour_mois', valeur: '13-45' })), '2026-10-26').erreurs[0], /MM-JJ/);
});
