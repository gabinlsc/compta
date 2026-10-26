import test from 'node:test';
import assert from 'node:assert/strict';
import { chargerRegles } from '../../tools/lib/regles.mjs';
import { creerRegles } from '../../src/assets/js/lib/facture.js';
import { modele, analyser, registreVide, traitementVide, nettoyer, exporter, importer, MESURES } from '../../src/assets/js/lib/registre.js';

const R = creerRegles(chargerRegles().entrees);
const complet = () => { const r = registreVide(); r.org = { nom: 'Gabin Lescoat, entrepreneur individuel', adresse: '1 rue Test, 35000 Rennes', email: 'pro@glsc.fr', tel: '', dpo: '' }; const t = modele('facturation', R); t.mesures = [MESURES[0], MESURES[3]]; r.traitements = [t]; return r; };

test('modèle « facturation » : durées tirées de data/regles.json (conservation comptable), rien d’inventé', () => {
  const t = modele('facturation', R);
  assert.match(t.duree, /entre 5 et 10 ans selon la nature du document/); assert.match(t.duree, /10 ans à partir de la clôture de l’exercice comptable/);
  assert.equal(t.base, 'Exécution d’un contrat ou de mesures précontractuelles');
  const sans = creerRegles(chargerRegles().entrees.map((e) => (e.id.startsWith('conservation') || e.id === 'livre_conservation_ans' ? { ...e, statut: 'a_verifier', valeur: null } : e)));
  assert.equal(modele('facturation', sans).duree, ''); // donnée non vérifiée : durée laissée à compléter
});

test('modèles « contact » et « prospection » : durée à définir, pas de valeur inventée', () => {
  assert.equal(modele('contact', R).duree, ''); assert.equal(modele('prospection', R).duree, ''); assert.equal(modele('newsletter', R).duree, 'Jusqu’au désabonnement, puis suppression.');
  assert.deepEqual(modele('vierge', R), traitementVide());
});

test('registre complet : aucune erreur ; manque de contenu : erreurs ciblées avec le nom du traitement', () => {
  assert.deepEqual(analyser(complet()).erreurs, []);
  const r = complet(); r.traitements[0].duree = ''; r.traitements[0].mesures = []; r.org.email = '';
  const a = analyser(r); assert.equal(a.bloque, true);
  assert.deepEqual(a.erreurs.map((e) => e.champ).sort(), ['org.email', 'traitements.0.duree', 'traitements.0.mesures']);
  assert.match(a.erreurs.find((e) => e.champ === 'traitements.0.duree').message, /Facturation et suivi des paiements/);
  assert.equal(analyser(registreVide()).erreurs.some((e) => e.champ === 'traitements'), true);
});

test('transfert hors Union européenne : précision et garanties exigées ; mesure « autre » acceptée', () => {
  const r = complet(); r.traitements[0].transferts = 'oui';
  assert.deepEqual(analyser(r).erreurs.map((e) => e.champ), ['traitements.0.transfertsPrecision']);
  r.traitements[0].transfertsPrecision = 'États-Unis, clauses contractuelles types'; r.traitements[0].mesures = []; r.traitements[0].securiteAutre = 'Coffre-fort numérique';
  assert.deepEqual(analyser(r).erreurs, []);
});

test('conseils : base légale absente, durée vague', () => {
  const r = complet(); r.traitements[0].base = ''; r.traitements[0].duree = 'Tant que nécessaire';
  const c = analyser(r).conseils.join(' '); assert.match(c, /base légale/); assert.match(c, /formule générale/);
});

test('sauvegarde : aller-retour et entrées hostiles nettoyées', () => {
  const r = complet(); assert.deepEqual(importer(exporter(r)), r);
  const sale = nettoyer({ org: { nom: 42 }, traitements: [{ nom: '<img src=x onerror=1>', base: 'inconnue', transferts: 'peut-être', mesures: ['Appareils protégés par mot de passe et verrouillage automatique', 'pirate'] }, null, 'x'], __proto__: { polluer: 1 } });
  assert.equal(sale.org.nom, ''); assert.equal(sale.traitements.length, 3); assert.equal(sale.traitements[0].nom, '<img src=x onerror=1>'); assert.equal(sale.traitements[0].base, ''); assert.equal(sale.traitements[0].transferts, 'non'); assert.deepEqual(sale.traitements[0].mesures, [MESURES[0]]); assert.equal(({}).polluer, undefined);
  assert.throws(() => importer('{"format":"autre"}'), /ne vient pas/);
});
