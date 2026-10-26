# Données à vérifier

État au 26 octobre 2026. Règle : aucun chiffre n'est publié tant qu'il n'a pas été **lu sur une source officielle** (voir `docs/mise-a-jour-annuelle.md`).

## Vérifié le 26 octobre 2026 (17 données de `data/regles.json`)

Lues directement sur les pages de service-public.gouv.fr (Direction de l'information légale et administrative) :

| Données | Page | Page vérifiée par la DILA le |
| --- | --- | --- |
| Taux de cotisations par activité (12,3 / 21,2 / 25,6 / 23,2 %) et taux globaux avec versement libératoire (13,3 / 22,9 / 27,8 / 25,4 %) | https://entreprendre.service-public.gouv.fr/vosdroits/F36232 | 1er janvier 2026 |
| Plafonds de chiffre d'affaires de la micro-entreprise (203 100 € / 83 600 €) | https://entreprendre.service-public.gouv.fr/vosdroits/F32353 | 21 février 2026 |
| Seuils de franchise en base de TVA, base et majoré (85 000 € / 93 500 € ; 37 500 € / 41 250 €) | https://entreprendre.service-public.gouv.fr/vosdroits/F21746 | 1er janvier 2026 |
| Abattements forfaitaires de l'impôt (71 / 50 / 34 %) | https://entreprendre.service-public.gouv.fr/vosdroits/F23267 | 13 mai 2026 |

Contrôle croisé impossible à ce jour avec urssaf.fr : les domaines `urssaf.fr` et `autoentrepreneur.urssaf.fr` sont refusés par le réseau de l'environnement de développement. À faire dès qu'ils sont accessibles, et pour les valeurs de référence des tests (simulateur officiel de l'Urssaf).

Remarques lues sur les pages :
- Les plafonds de CA ci-dessus sont les seuils du **régime micro-fiscal** (CA de l'année N-1 ou N-2) ; la règle des deux années consécutives s'applique.
- Pour 2026, les seuils de TVA sont inchangés ; la proposition d'un seuil unique de 25 000 € a été abandonnée (page F21746).
- Les seuils de TVA ci-dessus sont ceux de la vente et des prestations de services ; d'autres seuils existent (activités réglementées, auteurs, avocats…) et ne sont pas repris.

## Encore à vérifier avant les outils concernés

À entrer dans `regles.json` au fur et à mesure, avec leur source :

- Textes des mentions légales de facture et de devis. Base lue (https://entreprendre.service-public.gouv.fr/vosdroits/F31808, vérifiée le 11 août 2026) ; à compléter par Légifrance (art. L441-9 et L441-10 du code de commerce, D441-5 pour l'indemnité de 40 €) et le BOFiP.
- Facturation électronique : la page F31808 indique 4 nouvelles mentions obligatoires à compter du 1er septembre 2026 (SIREN du client, adresse de livraison, nature de l'opération, option pour la taxe d'après les débits) et une extension aux micro-entreprises à partir du 1er septembre 2027. À préciser sur impots.gouv.fr avant d'écrire le guide.
- ACRE (conditions et taux réduits), échéances de déclaration, date limite de la CFE.

## Aussi à confirmer par l'éditeur

- **Nom de domaine** : `https://compta.glsc.fr` est utilisé provisoirement (`tools/site.config.json`, champ `origin`, et défaut de `deploy.sh`).
- **Lieu du serveur** : non affirmé sur le site tant que non confirmé dans IONOS.
- **SIREN et adresse du siège** : « en cours d'immatriculation » dans les mentions légales.
- **Licence** : MIT par défaut, à confirmer.
