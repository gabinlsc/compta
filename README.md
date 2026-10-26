# Compta by glsc

La boîte à outils gratuite du micro-entrepreneur français : devis et factures, simulateur de revenu net, calendrier des échéances, tarif journalier, livre des recettes.

- **Sans compte, sans publicité, sans cookie, sans traceur, sans service tiers.** Tout se calcule dans le navigateur ; rien de ce que l'on saisit n'est envoyé.
- **Chiffres sourcés.** Tout taux, plafond ou date réglementaire vient de `data/regles.json`, avec sa source officielle et sa date de vérification. Un chiffre non vérifié n'est pas publié.
- Site statique (HTML, CSS, JS), aucun framework, aucune dépendance à l'exécution.

## Développer

```sh
npm ci
npm run build        # génère public/ à partir de src/, data/ et tools/
npm run check        # build + vérification que public/ est à jour + liens, SEO, poids
npm run test:unit    # tests unitaires (node:test)
npx playwright install chromium   # une fois
npm test             # unitaires + parcours, CSP, accessibilité
```

`public/` est généré **et commité** : après toute modification de `src/`, `data/` ou `tools/`, lancer `npm run build`.

## Organisation

| Dossier | Contenu |
| --- | --- |
| `src/` | pages (`src/content/`), styles, scripts, polices |
| `data/regles.json` | source unique des chiffres réglementaires (+ `regles.schema.json`) |
| `tools/` | build, contrôles (liens, SEO, poids), gabarit |
| `tests/` | tests unitaires et de navigateur |
| `deploy/` | en-têtes nginx (CSP, cache) |
| `docs/` | procédures (mise à jour annuelle, données à vérifier) |

## Données réglementaires

Voir [`docs/mise-a-jour-annuelle.md`](docs/mise-a-jour-annuelle.md) et [`docs/a-verifier.md`](docs/a-verifier.md).

## Licence

MIT. Polices Inter : SIL Open Font License (`src/assets/fonts/LICENSE-Inter-OFL.txt`).
