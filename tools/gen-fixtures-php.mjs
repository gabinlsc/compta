// Génère tests/fixtures/php-billing.json : mêmes entrées passées à la logique PHP du dépôt portfolio (admin/lib/billing.php), sorties enregistrées.
// Les tests unitaires comparent ensuite le JavaScript à ces sorties (tests croisés), sans PHP ni dépôt portfolio nécessaires en CI.
//   node tools/gen-fixtures-php.mjs /chemin/vers/portfolio/admin/lib/billing.php
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ROOT } from './lib/regles.mjs';

const billing = process.argv[2];
if (!billing) { console.error('Usage : node tools/gen-fixtures-php.mjs /chemin/vers/portfolio/admin/lib/billing.php'); process.exit(1); }
let seed = 20261026;
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }; // générateur à graine fixe : fixtures reproductibles
const ent = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const lignes = [];
for (const [q, u] of [[1, 59000], [2.5, 4500], [1.5, 333], [1, -5000], [0.01, 1], [0.5, 1], [0.5, 3], [9999, 99999999], [0.33, 100], [1.15, 1], [3, 1], [0.75, 199]]) lignes.push({ qty: q, unit: u });
for (let i = 0; i < 400; i++) lignes.push({ qty: ent(1, 999900) / 100, unit: ent(-2_000_000, 50_000_000) });
const montants = [0, 1, 99, 100, 101, 59000, 123456, 100000, 99999999, -1, -100, -123456, -5, 1000000000].concat(Array.from({ length: 60 }, () => ent(-50_000_000, 900_000_000)));
const nombres = [];
const chiffresAlea = (n) => Array.from({ length: n }, () => ent(0, 9)).join('');
for (const v of ['732829320', '732829321', '12345', '73282932000074', '73282932000075', '', '000000000', '12345678a']) nombres.push(v);
for (let i = 0; i < 150; i++) nombres.push(chiffresAlea(9), chiffresAlea(14));
const entree = join(mkdtempSync(join(tmpdir(), 'fx-')), 'in.json');
writeFileSync(entree, JSON.stringify({ lignes, montants, nombres }));
const php = `<?php declare(strict_types=1);
require ${JSON.stringify(billing)};
$in = json_decode(file_get_contents($argv[1]), true);
$out = ['lignes' => [], 'montants' => [], 'nombres' => []];
foreach ($in['lignes'] as $l) $out['lignes'][] = bill_line_total($l);
foreach ($in['montants'] as $m) $out['montants'][] = str_replace(["\\u{202F}", "\\u{00A0}"], ['NNBSP', 'NBSP'], bill_eur((int) $m));
foreach ($in['nombres'] as $n) $out['nombres'][] = ['luhn' => bill_luhn((string) $n), 'siren' => bill_siren_ok((string) $n), 'siret' => bill_siret_ok((string) $n)];
echo json_encode($out);`;
const script = join(mkdtempSync(join(tmpdir(), 'fx-')), 'run.php');
writeFileSync(script, php);
const sortie = JSON.parse(execFileSync('php', [script, entree], { encoding: 'utf8' }));
writeFileSync(join(ROOT, 'tests/fixtures/php-billing.json'), JSON.stringify({ source: 'admin/lib/billing.php (dépôt portfolio)', genere_le: '2026-10-26', entrees: { lignes, montants, nombres }, sorties: sortie }) + '\n');
console.log(`${lignes.length} lignes, ${montants.length} montants, ${nombres.length} nombres comparés`);
