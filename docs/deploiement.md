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

## Déploiement automatique au merge

Le serveur qui héberge déjà glsc.fr sait se mettre à jour tout seul quand un dépôt reçoit un push sur `main` : GitHub appelle un webhook signé (`https://admin.glsc.fr/hooks/github`), qui dépose une demande traitée par `glsc-deploy.service`. Le dépôt `gabinlsc/compta` rejoint cette liste via la pull request [gabinlsc/portfolio#52](https://github.com/gabinlsc/portfolio/pull/52). Une fois cette PR fusionnée :

1. **Créer le webhook** dans le dépôt `gabinlsc/compta` : *Settings → Webhooks → Add webhook*. URL `https://admin.glsc.fr/hooks/github`, type de contenu `application/json`, secret : celui de `/etc/glsc-admin/github-webhook.secret`, événement « Just the push event ».
2. **Mettre le serveur à jour** pour qu'il connaisse la nouvelle cible : lancer « Déployer maintenant » dans l'admin (GitHub & déploiements), ou `deploy5`.
3. **Vérifier** : le `ping` du webhook apparaît dans l'admin ; au merge suivant sur `main` de compta, un déploiement « compta » démarre, avec son journal et, en cas d'échec, le retour arrière.

Le script `deploy/deploy-compta.sh` du dépôt portfolio télécharge la branche `main` de compta et lance son `deploy.sh`. Le domaine par défaut est `compta.glsc.fr` (variable `GLSC_COMPTA_DOMAIN`). **Le premier lancement reste manuel** (commande du début de cette page) : il crée le vhost nginx et le certificat ; les suivants sont automatiques. Code de sortie 3 : la nouvelle version ne répondait pas et l'ancienne a été remise en service.

Aucune commande ne transite par le webhook : seules les cibles de la liste blanche sont exécutées.
