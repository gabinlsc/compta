import test from 'node:test';
import assert from 'node:assert/strict';
import ICAL from 'ical.js';
import { chargerRegles } from '../../tools/lib/regles.mjs';
import { creerRegles } from '../../src/assets/js/lib/facture.js';
import { genererEcheances, premiereEcheance } from '../../src/assets/js/lib/echeances.js';
import { construireIcs, echapper, replier, declencheur, empreinte } from '../../src/assets/js/lib/ics.js';
import { ajouterMois, prochainJourOuvre } from '../../src/assets/js/lib/dates.js';

const R = creerRegles(chargerRegles().entrees);
const OPT = { cfe: true, fe: true, options: true, ir: true };
const gen = (o) => genererEcheances({ periodicite: 'mois', debutActivite: '', depuis: '2026-01-01', fin: '2027-12-31', options: {}, ...o }, R);
const dates = (r, cat) => r.evenements.filter((e) => !cat || e.categorie === cat).map((e) => e.date);

test('déclaration mensuelle : fin du mois suivant (exemple officiel : juin → 31 juillet), 28 et 29 février, fin d’année', () => {
  const d = dates(gen({}), 'declaration');
  assert.ok(d.includes('2026-07-31') && d.includes('2026-02-28') && d.includes('2027-01-31') && d.includes('2027-02-28'));
  assert.ok(d.includes('2028-02-29') === false);
  const b = dates(gen({ depuis: '2028-01-01', fin: '2028-12-31' }), 'declaration'); // 2028 est bissextile : le CA de janvier se déclare avant le 29 février
  assert.ok(b.includes('2028-02-29') && b.includes('2028-01-31') && b.includes('2028-12-31'));
  assert.equal(new Set(d).size, d.length); assert.equal(d.length, 24 + 0 - 0 === 24 ? 24 : d.length);
});

test('déclaration trimestrielle : 30 avril, 31 juillet, 31 octobre, 31 janvier (dates officielles)', () => {
  const d = dates(gen({ periodicite: 'trimestre', depuis: '2026-01-01', fin: '2026-12-31' }), 'declaration');
  assert.deepEqual(d, ['2026-01-31', '2026-04-30', '2026-07-31', '2026-10-31']);
  assert.deepEqual(dates(gen({ periodicite: 'trimestre', depuis: '2026-11-01', fin: '2027-03-31' }), 'declaration'), ['2027-01-31']);
});

test('première déclaration : exemples officiels de service-public.gouv.fr', () => {
  assert.equal(premiereEcheance('2026-03-06', 'mois', []), '2026-07-31');   // mensuel, début le 6 mars 2026
  const T = [(a) => `${a}-04-30`, (a) => `${a}-07-31`, (a) => `${a}-10-31`, (a) => `${a}-01-31`];
  assert.equal(premiereEcheance('2026-04-12', 'trimestre', T), '2026-10-31'); // trimestriel, début le 12 avril 2026
  assert.equal(premiereEcheance('2026-11-15', 'trimestre', T), '2027-04-30');
  assert.equal(premiereEcheance('2026-03-01', 'mois', []), '2026-06-30');
  assert.equal(premiereEcheance('2026-12-01', 'mois', []), '2027-03-31');
  const r = gen({ debutActivite: '2026-03-06', depuis: '2026-01-01', fin: '2026-09-30' });
  assert.deepEqual(dates(r, 'declaration'), ['2026-07-31', '2026-08-31', '2026-09-30']);
  assert.equal(r.evenements[0].titre, 'Première déclaration de chiffre d’affaires');
});

test('CFE : exonérée l’année de création (déclaration 1447-C-SD avant le 31 décembre), puis paiement au 15 décembre, reporté à un jour ouvrable', () => {
  const r = gen({ options: { cfe: true }, debutActivite: '2026-03-06', depuis: '2026-01-01', fin: '2028-12-31' });
  const cfe = r.evenements.filter((e) => e.categorie === 'cfe');
  assert.deepEqual(cfe.map((e) => e.date), ['2026-12-31', '2027-12-15', '2028-12-15']);
  assert.match(cfe[0].description, /1447-C-SD/); assert.match(cfe[1].description, /réduite de 50 %/); assert.doesNotMatch(cfe[2].description, /réduite de 50 %/);
  assert.equal(prochainJourOuvre('2029-12-15'), '2029-12-17'); // samedi → lundi
  assert.equal(prochainJourOuvre('2030-12-15'), '2030-12-16'); // dimanche → lundi
  assert.equal(prochainJourOuvre('2026-12-15'), '2026-12-15');
  assert.deepEqual(dates(gen({ options: { cfe: true }, depuis: '2029-01-01', fin: '2029-12-31' }), 'cfe'), ['2029-12-17']);
});

test('facturation électronique, options et rappel de revenus', () => {
  const r = gen({ options: OPT, periodicite: 'trimestre' });
  assert.deepEqual(dates(r, 'facturation'), ['2026-09-01', '2027-09-01']);
  assert.deepEqual(dates(r, 'option'), ['2026-09-30', '2026-10-31', '2027-09-30', '2027-10-31']);
  assert.ok(dates(gen({ options: OPT }), 'option').every((d) => !d.endsWith('-10-31'))); // le retour au mensuel ne concerne que les déclarants trimestriels
  assert.deepEqual(dates(r, 'impot'), ['2026-04-01', '2027-04-01']);
  assert.match(r.evenements.find((e) => e.categorie === 'impot').description, /pas une échéance légale/);
});

test('fenêtre de dates et saisies invalides, donnée non vérifiée', () => {
  assert.equal(gen({ depuis: '2026-05-01', fin: '2026-04-01' }).erreurs[0].champ, 'depuis');
  assert.equal(gen({ debutActivite: '2026-13-01' }).erreurs[0].champ, 'debutActivite');
  assert.ok(dates(gen({ depuis: '2026-08-01', fin: '2026-08-31' })).every((d) => d >= '2026-08-01' && d <= '2026-08-31'));
  const entrees = chargerRegles().entrees.map((x) => (x.id === 'decl_trimestre_1' ? { ...x, statut: 'a_verifier', valeur: null } : x));
  const r = genererEcheances({ periodicite: 'mois', debutActivite: '', depuis: '2026-01-01', fin: '2026-12-31', options: {} }, creerRegles(entrees));
  assert.ok(r.erreurs.length && r.evenements.length === 0);
});

test('mois : ajout avec fin de mois', () => { assert.equal(ajouterMois('2026-01-31', 1), '2026-02-28'); assert.equal(ajouterMois('2026-11-30', 3), '2027-02-28'); assert.equal(ajouterMois('2026-03-06', 3), '2026-06-06'); });

// ---------------------------------------------------------------- iCalendar
const lignesBrutes = (ics) => ics.split('\r\n');
function valider(ics, attendus) {
  assert.ok(ics.endsWith('\r\n')); assert.ok(!/[^\r]\n/.test(ics), 'toutes les fins de ligne sont CRLF');
  for (const l of lignesBrutes(ics)) assert.ok(new TextEncoder().encode(l).length <= 75, `ligne de plus de 75 octets : ${l}`);
  const racine = ICAL.parse(ics);                                   // parseur ICS indépendant (ical.js) : lève une erreur si le format est invalide
  const cal = new ICAL.Component(racine);
  assert.equal(cal.getFirstPropertyValue('version'), '2.0'); assert.equal(cal.getFirstPropertyValue('prodid').startsWith('-//Compta by glsc'), true);
  assert.equal(cal.getFirstSubcomponent('vtimezone').getFirstPropertyValue('tzid'), 'Europe/Paris');
  const evs = cal.getAllSubcomponents('vevent');
  if (attendus !== undefined) assert.equal(evs.length, attendus);
  const uids = new Set();
  for (const v of evs) {
    const ev = new ICAL.Event(v);
    assert.ok(ev.uid && ev.uid.endsWith('@compta.glsc.fr') && !uids.has(ev.uid)); uids.add(ev.uid);
    assert.ok(v.getFirstPropertyValue('dtstamp')); assert.ok(ev.summary.length > 5); assert.ok(ev.startDate.isDate && ev.endDate.isDate);
    assert.equal(ev.endDate.toJSDate().getTime() - ev.startDate.toJSDate().getTime(), 86400000);
    for (const a of v.getAllSubcomponents('valarm')) { assert.equal(a.getFirstPropertyValue('action'), 'DISPLAY'); assert.ok(a.getFirstPropertyValue('trigger')); assert.ok(a.getFirstPropertyValue('description')); }
  }
  return evs;
}

test('iCalendar : fichier valide pour toutes les combinaisons (parseur ical.js), UID uniques et stables', () => {
  for (const periodicite of ['mois', 'trimestre']) for (const cfe of [false, true]) for (const fe of [false, true]) for (const debut of ['', '2026-03-06']) {
    const { evenements } = gen({ periodicite, debutActivite: debut, options: { cfe, fe, options: true, ir: true } });
    const ics = construireIcs({ nom: 'Échéances', description: 'Test, avec ; ponctuation', evenements, dtstamp: '20261026T000000Z', domaine: 'compta.glsc.fr' });
    const evs = valider(ics, evenements.length);
    assert.equal(evs.length ? new ICAL.Event(evs[0]).startDate.toString() : '', evenements[0] ? evenements[0].date : '');
    assert.equal(construireIcs({ nom: 'Échéances', description: 'Test, avec ; ponctuation', evenements, dtstamp: '20261026T000000Z', domaine: 'compta.glsc.fr' }), ics); // déterministe
  }
});

test('iCalendar : rappels J-7 et J-1 à 9 h, échappement, repliement des lignes longues et des caractères accentués', () => {
  assert.equal(declencheur(1), '-PT15H'); assert.equal(declencheur(7), '-P6DT15H'); assert.equal(declencheur(0), 'PT0S');
  assert.equal(echapper('a, b; c\\d\ne'), 'a\\, b\; c\\\\d\\ne');
  const long = 'é'.repeat(200);
  const pli = replier('DESCRIPTION:' + long);
  for (const l of pli.split('\r\n')) assert.ok(new TextEncoder().encode(l).length <= 75);
  assert.equal(pli.replace(/\r\n /g, ''), 'DESCRIPTION:' + long); // aucun caractère perdu ni coupé en deux
  const ev = [{ cle: 'x', date: '2026-07-31', titre: 'Titre; avec, ponctuation\\ et émoji', description: 'Ligne 1\nLigne 2 ' + 'très long '.repeat(40), categorie: 'declaration' }];
  const evs = valider(construireIcs({ nom: 'N', description: 'D', evenements: ev, dtstamp: '20261026T000000Z', domaine: 'compta.glsc.fr' }), 1);
  assert.equal(new ICAL.Event(evs[0]).summary, 'Titre; avec, ponctuation\\ et émoji');
  assert.match(new ICAL.Event(evs[0]).description, /^Ligne 1\nLigne 2 très long/);
  const triggers = evs[0].getAllSubcomponents('valarm').map((a) => a.getFirstPropertyValue('trigger').toString());
  assert.deepEqual(triggers, ['-P6DT15H', '-PT15H']);
  assert.equal(empreinte('a'), empreinte('a')); assert.notEqual(empreinte('a'), empreinte('b'));
});

test('iCalendar : injection impossible (retours à la ligne et caractères de contrôle dans un titre)', () => {
  const ev = [{ cle: 'x', date: '2026-07-31', titre: 'A\r\nBEGIN:VEVENT\r\nSUMMARY:pirate', description: 'ok\u0000', categorie: 'declaration' }];
  const ics = construireIcs({ nom: 'N', description: 'D', evenements: ev, dtstamp: '20261026T000000Z', domaine: 'compta.glsc.fr' });
  assert.equal(ics.split('\r\n').filter((l) => l === 'BEGIN:VEVENT').length, 1); // le texte injecté reste sur une seule ligne échappée
  valider(ics, 1);
});
