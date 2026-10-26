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
npm test             # unitaires (dont tests croisés avec la logique PHP) + parcours, outil, CSP, accessibilité
```

`public/` est généré **et commité** : après toute modification de `src/`, `data/` ou `tools/`, lancer `npm run build`.

## Organisation

| Dossier | Contenu |
| --- | --- |
| `src/` | pages (`src/content/`), styles, scripts, polices |
| `data/regles.json` | source unique des chiffres réglementaires (+ `regles.schema.json`) |
| `tools/` | build, contrôles (liens, SEO, poids), gabarit |
| `tests/` | tests unitaires et de navigateur |
| `deploy.sh`, `deploy/` | script de déploiement, en-têtes nginx (CSP, cache) |
| `docs/` | procédures (mise à jour annuelle, données à vérifier) |

## Marque

Le site suit le kit de marque StudioGLSC (https://studio.glsc.fr/marque/) : monogramme du kit tel quel (jamais redessiné ni recoloré), palette (bleu #2447D6, encre, bleu pâle, fonds), Inter Display 700 pour les titres et Inter 400/500/600 pour les textes. En thème sombre, le bleu reste le même ; les liens et textes bleus passent au bleu pâle de la palette pour rester lisibles.

## Déployer

Sur un serveur Debian ou Ubuntu, en une commande (nginx, HTTPS, en-têtes, sauvegarde, retour arrière) :

```sh
curl -fsSL https://raw.githubusercontent.com/gabinlsc/compta/main/deploy.sh | sudo bash
```

Détails et options : [`docs/deploiement.md`](docs/deploiement.md).

## Données réglementaires

Voir [`docs/mise-a-jour-annuelle.md`](docs/mise-a-jour-annuelle.md) et [`docs/a-verifier.md`](docs/a-verifier.md).

## Licence

MIT. Polices Inter : SIL Open Font License (`src/assets/fonts/LICENSE-Inter-OFL.txt`).

## Tests croisés avec la logique PHP

`tests/fixtures/php-billing.json` contient les sorties de `admin/lib/billing.php` (dépôt portfolio) pour 412 lignes, 74 montants et 308 identifiants ; les tests comparent le JavaScript à ces valeurs. Pour régénérer : `node tools/gen-fixtures-php.mjs /chemin/vers/portfolio/admin/lib/billing.php` (nécessite PHP).
