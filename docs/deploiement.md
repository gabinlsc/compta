# Déploiement

Le site est statique : le déploiement copie `public/` derrière nginx. Tout est automatisé par `deploy.sh` (nginx, HTTPS Let's Encrypt, en-têtes de sécurité, sauvegarde, retour arrière, journaux limités à 35 jours).

## En une commande

Sur le serveur (Debian ou Ubuntu), après avoir créé le DNS (étape 1) :

```sh
curl -fsSL https://raw.githubusercontent.com/gabinlsc/compta/main/deploy.sh | sudo bash
```

Options : `--domain compta.exemple.fr`, `--email moi@exemple.fr`, `--ref une-branche`, `--root /var/www/mon-dossier`, `--no-tls` (essai en HTTP), `--dry-run` (n'exécute rien). Exemple :

```sh
curl -fsSL https://raw.githubusercontent.com/gabinlsc/compta/main/deploy.sh | sudo bash -s -- --domain compta.exemple.fr --email moi@exemple.fr
```

Le script est relançable à volonté : à chaque lancement il met à jour le site et le snippet d'en-têtes. Le vhost nginx et le certificat, une fois en place, ne sont plus touchés.

## Pas à pas

1. **DNS** : chez votre registrar, créer un enregistrement `A` (et `AAAA` si le serveur a une IPv6) pour le domaine, qui pointe vers l'adresse IP du serveur. Attendre la propagation (`getent hosts compta.glsc.fr`).
2. **Ports** : ouvrir 80 et 443 (pare-feu IONOS et `ufw` si activé). Le port 80 sert à la validation Let's Encrypt.
3. **Lancer la commande** ci-dessus. Le script :
   - installe `nginx`, `certbot` et `python3-certbot-nginx` si absents ;
   - télécharge la version demandée (branche `main` par défaut) ;
   - sauvegarde l'existant dans `/var/backups/compta` (5 dernières) ;
   - installe le site dans `/var/www/<domaine>` par échange atomique ;
   - installe `/etc/nginx/snippets/compta-security.conf` (CSP stricte, HSTS, cache, `.ics`) ;
   - crée `/etc/nginx/sites-available/<domaine>` au premier lancement, puis demande le certificat avec `certbot --nginx` (HTTPS et redirection ajoutés par certbot) ;
   - vérifie que les pages répondent ; sinon **remet l'ancienne version** ;
   - limite les journaux à 35 jours (`/etc/logrotate.d/compta`, journaux dans `/var/log/nginx/compta/`).
4. **Vérifier** : ouvrir le site en HTTPS, puis contrôler les en-têtes : `curl -sI https://<domaine>/ | grep -i content-security`.
5. **Renouvellement du certificat** : automatique (minuteur `certbot.timer` installé avec le paquet). Test : `sudo certbot renew --dry-run`.

## Mettre à jour le site

Relancer la même commande. Pour revenir en arrière à la main : `tar -xzf /var/backups/compta/<domaine>-<date>.tar.gz -C /var/www/<domaine>`.

## Cas particuliers

- **Un autre site tourne déjà sur le serveur** (par exemple studio.glsc.fr) : le script ne touche qu'au vhost du domaine demandé. Chaque site garde son propre vhost.
- **Vhost existant sans le snippet** : le script le signale ; ajouter `include snippets/compta-security.conf;` dans le bloc `server`, puis `nginx -t && systemctl reload nginx`.
- **Certificat refusé** : presque toujours un DNS pas encore propagé. Le site reste en HTTP ; relancer le script plus tard.
- **Lieu du serveur** : à confirmer dans l'espace IONOS avant d'écrire « hébergé en France » quelque part.

## Déploiement automatique au merge (étape 8 du plan)

Prévu ensuite : ajouter `gabinlsc/compta` à la liste blanche du webhook de `gabinlsc/portfolio` (PR séparée sur ce dépôt), pour déployer à chaque merge sur `main`.
