# Données à vérifier

État au 26 octobre 2026. Règle : aucun chiffre n'est publié tant qu'il n'a pas été **lu sur une source officielle** (voir `docs/mise-a-jour-annuelle.md`).

## Vérifié le 26 octobre 2026 (59 données de `data/regles.json`)

Lues directement sur les pages de service-public.gouv.fr (Direction de l'information légale et administrative) :

| Données | Page | Page vérifiée par la DILA le |
| --- | --- | --- |
| Taux de cotisations par activité (12,3 / 21,2 / 25,6 / 23,2 %) et taux globaux avec versement libératoire (13,3 / 22,9 / 27,8 / 25,4 %) | https://entreprendre.service-public.gouv.fr/vosdroits/F36232 | 1er janvier 2026 |
| Plafonds de chiffre d'affaires de la micro-entreprise (203 100 € / 83 600 €) | https://entreprendre.service-public.gouv.fr/vosdroits/F32353 | 21 février 2026 |
| Seuils de franchise en base de TVA, base et majoré (85 000 € / 93 500 € ; 37 500 € / 41 250 €) | https://entreprendre.service-public.gouv.fr/vosdroits/F21746 | 1er janvier 2026 |
| Abattements forfaitaires de l'impôt (71 / 50 / 34 %) | https://entreprendre.service-public.gouv.fr/vosdroits/F23267 | 13 mai 2026 |

| Mentions de facture : mention de franchise de TVA (nouveau texte CIBS depuis le 1er septembre 2026 et ancien texte tolérée jusqu'au 31 décembre 2027), mention EI, « Siret en cours d'attribution », escompte « néant », association agréée, garantie de conformité (2 ans), date d'exigibilité du SIREN du client pour les micro-entreprises (1er septembre 2027) | https://entreprendre.service-public.gouv.fr/vosdroits/F36008 | 8 décembre 2025 |
| Pénalités de retard : minimum légal (8,25 %), majoration de 10 points, taux des semestres 2026 (12,15 % et 12,40 %), indemnité de 40 €, délai de paiement maximal de 60 jours | https://entreprendre.service-public.gouv.fr/vosdroits/F23211 | 7 août 2026 |
| Liste des mentions obligatoires d'une facture et nouvelles mentions de la facturation électronique | https://entreprendre.service-public.gouv.fr/vosdroits/F31808 | 11 août 2026 |
| Acre des micro-entreprises créées à partir du 1er juillet 2026 : exonération de 25 % (taux minoré à 75 %), durée (fin du 3e trimestre civil suivant le début d'activité), délai de demande de 60 jours | https://entreprendre.service-public.gouv.fr/vosdroits/F11677 (et l'actualité https://entreprendre.service-public.gouv.fr/actualites/A18795, décret n° 2026-69 du 6 février 2026) | 1er juillet 2026 |
| Versement libératoire : seuils de revenu fiscal de référence (N-2) et date limite d'option | https://entreprendre.service-public.gouv.fr/vosdroits/F36244 | 13 mars 2026 |
| Abattement minimal de 305 € | https://entreprendre.service-public.gouv.fr/vosdroits/F23267 | 13 mai 2026 |
| Dates de déclaration du chiffre d'affaires (30 avril, 31 juillet, 31 octobre, 31 janvier ; fin du mois suivant), première déclaration, option et retour au mensuel avant le 31 octobre, pénalité de 60,10 €, majorations de 5 % et 15 %, bases forfaitaires | https://entreprendre.service-public.gouv.fr/vosdroits/F23257 | 1er janvier 2026 |
| CFE : paiement au 15 décembre (reporté au jour ouvrable suivant), acompte au-delà de 3 000 € | https://entreprendre.service-public.gouv.fr/vosdroits/F23547 | 2 avril 2026 |
| CFE du micro-entrepreneur : exonération la première année avec déclaration 1447-C-SD avant le 31 décembre, seuil de 5 000 €, réduction de 50 % l'année suivante | https://entreprendre.service-public.gouv.fr/vosdroits/F23999 | 26 mars 2026 |
| Facturation électronique : réception pour toutes les entreprises le 1er septembre 2026, émission pour les micro-entreprises le 1er septembre 2027 | https://entreprendre.service-public.gouv.fr/actualites/A15683 | mise à jour du 27 février 2026 |

Contrôle croisé impossible à ce jour avec urssaf.fr : les domaines `urssaf.fr` et `autoentrepreneur.urssaf.fr` sont refusés par le réseau de l'environnement de développement. À faire dès qu'ils sont accessibles, et pour les valeurs de référence des tests (simulateur officiel de l'Urssaf).

Remarques lues sur les pages :
- Les plafonds de CA ci-dessus sont les seuils du **régime micro-fiscal** (CA de l'année N-1 ou N-2) ; la règle des deux années consécutives s'applique.
- Pour 2026, les seuils de TVA sont inchangés ; la proposition d'un seuil unique de 25 000 € a été abandonnée (page F21746).
- Les seuils de TVA ci-dessus sont ceux de la vente et des prestations de services ; d'autres seuils existent (activités réglementées, auteurs, avocats…) et ne sont pas repris.

## Encore à vérifier avant les outils concernés

À entrer dans `regles.json` au fur et à mesure, avec leur source :

- Mentions de facture : recoupement avec Légifrance (art. L441-9 et L441-10 du code de commerce, D441-5 pour l'indemnité de 40 €), dont l'accès est encore refusé (403) depuis l'environnement de développement.
- Taux de refinancement de la BCE pour les semestres suivants : à ajouter dans `regles.json` (série `penalite_bce`) au 1er janvier et au 1er juillet.
- Facturation électronique : calendrier complet à préciser sur impots.gouv.fr avant d'écrire le guide dédié (la page F31808 indique 4 nouvelles mentions à partir du 1er septembre 2026 pour les grandes entreprises et ETI, et du 1er septembre 2027 pour les micro-entreprises).
- Acre des créations **avant le 1er juillet 2026** (exonération de 50 % d'après l'actualité A18795, mais durée et règles non lues sur une page de référence) : le simulateur ne les calcule pas et renvoie vers l'Urssaf.
- Arrondi appliqué par l'Urssaf aux cotisations déclarées (le simulateur arrondit au centime).
- Valeurs de référence du simulateur officiel de l'Urssaf pour les tests (accès refusé) : les tests utilisent les exemples chiffrés publiés par service-public.gouv.fr (électricien en Acre : 21,2 % devient 15,9 % ; exemples d'abattements).
- Dates de la déclaration annuelle de revenus (publiées chaque printemps sur impots.gouv.fr) : l'outil ne propose qu'un rappel de Compta by glsc, clairement présenté comme tel.
- Dates de la CFE pour des cas particuliers (CFE supérieure à 3 000 €, acompte de juin) : non gérées, la date de l'avis d'imposition fait foi.
- Jours fériés : seuls les week-ends sont pris en compte pour reporter la CFE ; le 15 décembre n'est jamais férié en France.

## Écarts avec le cahier des charges initial

- Le cahier des charges citait l'article 293 B du CGI et le 1er septembre 2026 pour le SIREN du client. Les pages officielles indiquent que la mention est désormais « art. L. 223 et s. du CIBS » (293 B toléré jusqu'au 31 décembre 2027) et que le SIREN du client n'est obligatoire pour les micro-entreprises qu'à partir du 1er septembre 2027. L'outil suit les pages officielles.

## Aussi à confirmer par l'éditeur

- **Nom de domaine** : `https://compta.glsc.fr` est utilisé provisoirement (`tools/site.config.json`, champ `origin`, et défaut de `deploy.sh`).
- **Lieu du serveur** : non affirmé sur le site tant que non confirmé dans IONOS.
- **SIREN et adresse du siège** : « en cours d'immatriculation » dans les mentions légales.
- **Licence** : MIT par défaut, à confirmer.
