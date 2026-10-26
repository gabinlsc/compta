# Mise à jour annuelle des données réglementaires

Tout chiffre ou date réglementaire vit dans `data/regles.json`. Le site, les outils, les guides (jetons `{{identifiant}}`) et les tests lisent ce fichier.

## Garde-fous

- Une entrée `a_verifier` n'a **pas de valeur** : elle s'affiche « en cours de vérification » et rien n'est calculé avec.
- Une entrée `verifie` exige : une valeur, une `source_url` d'un site officiel (urssaf.fr, autoentrepreneur.urssaf.fr, service-public.fr, entreprendre.service-public.fr, impots.gouv.fr, bofip.impots.gouv.fr, legifrance.gouv.fr, cnil.fr) et une date `verifie_le`.
- Le **build échoue** si une entrée vérifiée a plus de 6 mois ou si l'année dépasse `valable_au`. Pour publier quand même (avec un bandeau « mise à jour annuelle en cours ») : `COMPTA_ALLOW_STALE=1 npm run build`.
- Un workflow GitHub (`rappel-annuel.yml`) ouvre une issue chaque 2 janvier.

## Procédure (chaque début d'année, et à toute annonce officielle)

1. Pour chaque entrée, ouvrir la source officielle, relever la valeur et la période de validité.
2. Mettre à jour `valeur`, `statut: "verifie"`, `source_url`, `source_titre`, `verifie_le` (date du jour), `valable_du`, `valable_au`.
3. Pour une nouvelle année : dupliquer les entrées concernées, ajuster les périodes. Ne jamais laisser une valeur de l'année précédente sous une période de l'année en cours.
4. Ajouter ou mettre à jour les **valeurs de référence** des tests (cas dorés) à partir du simulateur officiel de l'Urssaf, avec la date du relevé.
5. `npm run build`, puis `npm run check` et `npm test`.
6. Relire les guides qui citent des chiffres : `Mise à jour` en bas de page.
7. PR « Données réglementaires AAAA », relue par une personne qui n'a pas fait la saisie.

## Qui

Gabin Lescoat (éditeur). Dates à surveiller : début janvier (taux, plafonds), annonces de la loi de finances, calendrier de la facturation électronique.
