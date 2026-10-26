# Données à vérifier avant publication

Aucun de ces chiffres n'est publié tant qu'il n'a pas été **contrôlé sur la source officielle** (voir `docs/mise-a-jour-annuelle.md`). Les valeurs candidates ci-dessous viennent de **résumés de moteur de recherche** pointant vers des pages officielles ; la page elle-même n'a pas pu être ouverte depuis l'environnement de développement (accès réseau refusé aux sites officiels). Ce sont donc des pistes de vérification, pas des données.

État au 26 octobre 2026.

| Identifiant | Valeur candidate | Page à ouvrir pour confirmer |
| --- | --- | --- |
| `taux_vente` | 12,3 % | https://www.autoentrepreneur.urssaf.fr/portail/accueil/sinformer-sur-le-statut/lessentiel-du-statut.html |
| `taux_bic_services` | 21,2 % | idem |
| `taux_bnc_ssi` | 25,6 % (hausse annoncée de 24,6 % au 1er janvier 2026 ; une ancienne page mentionne 26,1 %) | idem + https://entreprendre.service-public.gouv.fr/vosdroits/F36232 |
| `taux_bnc_cipav` | 23,2 % | idem |
| `vl_vente` / `vl_bic_services` / `vl_bnc` | 1 % / 1,7 % / 2,2 % | idem |
| `plafond_ca_vente` | 203 100 € | source officielle à retrouver (service-public.gouv.fr ou urssaf.fr) |
| `plafond_ca_services` | 83 600 € | idem |
| `tva_franchise_vente` / `tva_majore_vente` | 85 000 € / 93 500 € | service-public.gouv.fr ou impots.gouv.fr (seuils susceptibles d'avoir changé : vérifier) |
| `tva_franchise_services` / `tva_majore_services` | 37 500 € / 41 250 € | idem |

À vérifier aussi, hors `regles.json` pour l'instant (ajoutés avec les outils concernés) : textes des mentions légales de facture (pénalités, indemnité de 40 €, art. 293 B, escompte, médiation), obligation du SIREN du client au 1er septembre 2026, calendrier de la facturation électronique, règles de l'ACRE, échéances de déclaration, date limite de la CFE.

## Aussi à confirmer par l'éditeur

- **Nom de domaine** : `https://compta.glsc.fr` est utilisé provisoirement (`tools/site.config.json`, champ `origin`) ; à confirmer ou remplacer, puis `npm run build`.
- **Lieu du serveur** : non affirmé sur le site tant que non confirmé dans IONOS.
- **Journaux serveur 35 jours** : annoncé dans la politique de confidentialité ; la rotation nginx correspondante est décrite dans `docs/deploiement.md` (livrée avec le déploiement).
- **SIREN et adresse du siège** : « en cours d'immatriculation » dans les mentions légales.
- **Licence** : MIT par défaut (code ouvert), à confirmer.
