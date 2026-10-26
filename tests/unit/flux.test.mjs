import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import ICAL from 'ical.js';
import { chargerRegles } from '../../tools/lib/regles.mjs';
import { FIN_VALIDITE } from '../../src/assets/js/lib/echeances.js';
import { genererFlux, FLUX } from '../../src/content/ics-flux.mjs';

const dossier = new URL('../../public/ics/', import.meta.url);

test('les 8 calendriers publiés dans public/ics/ sont valides, à jour et complets', () => {
  const fichiers = readdirSync(dossier).filter((f) => f.endsWith('.ics')).sort();
  assert.deepEqual(fichiers, FLUX.map((f) => f.fichier).sort());
  const attendus = new Map(genererFlux(chargerRegles()).map((f) => [f.fichier, f.contenu]));
  for (const f of fichiers) {
    const texte = readFileSync(new URL(f, dossier), 'utf8');
    assert.equal(texte, attendus.get(f), `${f} n’est pas à jour : lancer npm run build`);
    const cal = new ICAL.Component(ICAL.parse(texte));
    const evs = cal.getAllSubcomponents('vevent');
    assert.ok(evs.length >= 5, `${f} : ${evs.length} événements`);
    for (const v of evs) assert.equal(v.getAllSubcomponents('valarm').length, 2);
    for (const l of texte.split('\r\n')) assert.ok(Buffer.byteLength(l) <= 75);
  }
});

test('chaque donnée utilisée par le calendrier est valable jusqu’à la fin de la période couverte', () => {
  const ids = ['decl_trimestre_1', 'decl_trimestre_2', 'decl_trimestre_3', 'decl_trimestre_4', 'decl_retour_mensuel_limite', 'decl_penalite_euros', 'cfe_paiement', 'cfe_declaration_creation', 'cfe_exoneration_ca_max', 'cfe_reduction_deuxieme_annee', 'fe_reception_obligatoire', 'fe_emission_micro', 'vfl_option_limite'];
  const par = new Map(chargerRegles().entrees.map((e) => [e.id, e]));
  for (const id of ids) assert.ok(par.get(id).valable_au >= FIN_VALIDITE, id);
});
