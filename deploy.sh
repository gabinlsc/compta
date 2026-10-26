#!/usr/bin/env bash
# Déploie Compta by glsc sur un serveur Debian ou Ubuntu : nginx, certificat HTTPS Let's Encrypt, site, en-têtes de sécurité, rotation des journaux.
# À lancer en root. Relançable à volonté (mise à jour du site, du snippet nginx et des journaux ; le vhost et le certificat déjà en place ne sont pas touchés).
#
#   curl -fsSL https://raw.githubusercontent.com/gabinlsc/compta/main/deploy.sh | sudo bash
#   curl -fsSL https://raw.githubusercontent.com/gabinlsc/compta/main/deploy.sh | sudo bash -s -- --domain compta.exemple.fr --email moi@exemple.fr
#   curl -fsSL https://raw.githubusercontent.com/gabinlsc/compta/main/deploy.sh | sudo bash -s -- --ref feature/ma-branche --no-tls
#
# Options (ou variables d'environnement) :
#   --domain  nom de domaine            (COMPTA_DOMAIN, défaut compta.glsc.fr)
#   --email   e-mail pour Let's Encrypt (COMPTA_EMAIL,  défaut pro@glsc.fr)
#   --ref     branche, tag ou commit    (COMPTA_REF,    défaut main)
#   --root    dossier du site           (COMPTA_ROOT,   défaut /var/www/<domaine>)
#   --no-tls  ne pas demander de certificat (site en HTTP seulement, pour un essai)
#   --dry-run affiche ce qui serait fait sans rien modifier
# Pour tester une copie locale du dépôt : COMPTA_SRC=/chemin/du/depot (au lieu du téléchargement).
#
# Ce que fait le script : installe nginx et certbot si besoin ; télécharge la version demandée ; sauvegarde l'existant (5 dernières) ;
# installe le site par échange atomique ; vérifie que les pages répondent et remet l'ancienne version sinon ; installe le snippet d'en-têtes
# (CSP stricte, HSTS, cache) ; crée le vhost nginx au premier lancement ; obtient le certificat ; limite les journaux à 35 jours.
set -euo pipefail

DOMAIN="${COMPTA_DOMAIN:-compta.glsc.fr}"
EMAIL="${COMPTA_EMAIL:-pro@glsc.fr}"
REF="${COMPTA_REF:-main}"
ROOT="${COMPTA_ROOT:-}"
TLS=1
DRY=0
REPO=gabinlsc/compta
BACKUPS=/var/backups/compta
LOGDIR=/var/log/nginx/compta

while [ $# -gt 0 ]; do
  case "$1" in
    --domain) DOMAIN="${2:?valeur manquante pour --domain}"; shift 2 ;;
    --email) EMAIL="${2:?valeur manquante pour --email}"; shift 2 ;;
    --ref) REF="${2:?valeur manquante pour --ref}"; shift 2 ;;
    --root) ROOT="${2:?valeur manquante pour --root}"; shift 2 ;;
    --no-tls) TLS=0; shift ;;
    --dry-run) DRY=1; shift ;;
    -h|--help) sed -n '2,22p' "$0" 2>/dev/null | sed 's/^# \{0,1\}//' || true; exit 0 ;;
    *) echo "Option inconnue : $1" >&2; exit 2 ;;
  esac
done

c() { printf '\033[%sm%s\033[0m\n' "$1" "$2"; }
info() { c 36 "▸ $*"; }
ok() { c 32 "  ✓ $*"; }
warn() { c 33 "  ! $*"; }
die() { c 31 "  ✗ $*"; exit 1; }
run() { if [ "$DRY" = 1 ]; then echo "  (dry-run) $*"; else "$@"; fi; }

[[ "$DOMAIN" =~ ^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?$ ]] || die "Nom de domaine invalide : $DOMAIN"
[[ "$EMAIL" =~ ^[^[:space:]@]+@[^[:space:]@]+$ ]] || die "E-mail invalide : $EMAIL"
[[ "$REF" =~ ^[A-Za-z0-9._/-]+$ ]] || die "Référence git invalide : $REF"
[ "$DRY" = 1 ] || [ "$(id -u)" = 0 ] || die "À lancer en root (sudo)."
ROOT="${ROOT:-/var/www/$DOMAIN}"
info "Site : $DOMAIN · dossier : $ROOT · version : ${COMPTA_SRC:+copie locale}${COMPTA_SRC:-$REF}"

# ---- paquets
need=()
command -v nginx >/dev/null || need+=(nginx)
command -v curl >/dev/null || need+=(curl)
if [ "$TLS" = 1 ] && ! command -v certbot >/dev/null; then need+=(certbot python3-certbot-nginx); fi
if [ "${#need[@]}" -gt 0 ]; then
  command -v apt-get >/dev/null || die "Installer à la main : ${need[*]} (ce script gère apt, Debian/Ubuntu)."
  info "Installation : ${need[*]}"
  run env DEBIAN_FRONTEND=noninteractive apt-get update -qq
  run env DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "${need[@]}"
  ok "paquets installés"
fi

# ---- téléchargement
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
if [ -n "${COMPTA_SRC:-}" ]; then SRC="$COMPTA_SRC"
else
  info "Téléchargement de $REPO@$REF"
  [ "$DRY" = 1 ] && { echo "  (dry-run) curl codeload.github.com/$REPO/tar.gz/$REF"; SRC=""; } || {
    curl -fsSL --retry 3 --max-time 120 "https://codeload.github.com/$REPO/tar.gz/$REF" | tar -xz -C "$WORK" || die "Téléchargement impossible (dépôt privé, branche inconnue ou réseau)."
    SRC="$(find "$WORK" -mindepth 1 -maxdepth 1 -type d | head -1)"
  }
fi
if [ "$DRY" = 0 ]; then
  [ -s "$SRC/public/index.html" ] || die "public/index.html introuvable dans la version téléchargée : le site n'a pas été généré (npm run build)."
  [ -s "$SRC/deploy/compta-security.conf" ] || die "deploy/compta-security.conf introuvable."
  ok "archive complète"
fi

# ---- sauvegarde
if [ -d "$ROOT" ] && [ -n "$(ls -A "$ROOT" 2>/dev/null)" ]; then
  run install -d -m 700 "$BACKUPS"
  BK="$BACKUPS/$DOMAIN-$(date +%Y%m%d-%H%M%S).tar.gz"
  run tar -czf "$BK" -C "$ROOT" .
  [ "$DRY" = 1 ] || { ok "sauvegarde : $BK"; ls -1t "$BACKUPS"/"$DOMAIN"-*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm -f; }
else BK=""; fi

# ---- installation du site (échange atomique)
rollback() {
  c 31 "  ↩ retour à la version précédente"
  rm -rf "$ROOT.failed"; [ -d "$ROOT" ] && mv "$ROOT" "$ROOT.failed"
  mkdir -p "$ROOT"; [ -n "$BK" ] && tar -xzf "$BK" -C "$ROOT"
  rm -rf "$ROOT.failed"; exit 1
}
if [ "$DRY" = 0 ]; then
  rm -rf "$ROOT.new" "$ROOT.old"
  mkdir -p "$(dirname "$ROOT")"
  cp -r "$SRC/public" "$ROOT.new"
  find "$ROOT.new" -type d -exec chmod 755 {} + ; find "$ROOT.new" -type f -exec chmod 644 {} +
  [ -d "$ROOT" ] && mv "$ROOT" "$ROOT.old"
  mv "$ROOT.new" "$ROOT"
  chown -R root:root "$ROOT" 2>/dev/null || true
  ok "fichiers en place"
else echo "  (dry-run) installation de public/ dans $ROOT"; fi

# ---- nginx : snippet d'en-têtes, journaux, vhost
SNIP=/etc/nginx/snippets/compta-security.conf
VHOST_AVAIL=/etc/nginx/sites-available/$DOMAIN
VHOST_ENAB=/etc/nginx/sites-enabled/$DOMAIN
if [ "$DRY" = 0 ]; then
  install -d /etc/nginx/snippets "$LOGDIR"
  install -m 644 "$SRC/deploy/compta-security.conf" "$SNIP"
  ok "en-têtes de sécurité : $SNIP"
  # Journaux : 35 jours au plus, comme annoncé dans la politique de confidentialité (dossier à part : pas de conflit avec la rotation de nginx).
  cat > /etc/logrotate.d/compta <<LOGROTATE
$LOGDIR/*.log {
    daily
    rotate 35
    maxage 35
    missingok
    notifempty
    compress
    delaycompress
    sharedscripts
    postrotate
        [ ! -f /run/nginx.pid ] || kill -USR1 \$(cat /run/nginx.pid)
    endscript
}
LOGROTATE
  ok "journaux : conservés 35 jours au plus ($LOGDIR)"
  if [ ! -e "$VHOST_AVAIL" ]; then
    V6LISTEN=''; [ -e /proc/net/if_inet6 ] && V6LISTEN='listen [::]:80;'
    cat > "$VHOST_AVAIL" <<VHOST
# Compta by glsc : généré par deploy.sh. Certbot y ajoute le bloc HTTPS et la redirection ; ce fichier n'est plus réécrit ensuite.
server {
    listen 80;
    $V6LISTEN
    server_name $DOMAIN;
    root $ROOT;
    index index.html;
    access_log $LOGDIR/access.log;
    error_log $LOGDIR/error.log;

    include snippets/compta-security.conf;

    location / { try_files \$uri \$uri/ =404; }
    error_page 404 /404.html;
}
VHOST
    ln -sf "$VHOST_AVAIL" "$VHOST_ENAB"
    ok "vhost créé : $VHOST_AVAIL"
  else
    grep -q 'snippets/compta-security.conf' "$VHOST_AVAIL" && ok "vhost existant : inchangé (snippet déjà inclus)" || warn "vhost existant sans « include snippets/compta-security.conf; » : à ajouter dans le bloc server de $VHOST_AVAIL"
  fi
  nginx -t 2>/dev/null || { nginx -t; die "Configuration nginx invalide."; }
  if systemctl is-active --quiet nginx 2>/dev/null; then systemctl reload nginx; else systemctl enable --now nginx 2>/dev/null || nginx; fi
  ok "nginx rechargé"
else echo "  (dry-run) snippet, logrotate, vhost $VHOST_AVAIL, rechargement de nginx"; fi

# ---- vérification (avant le certificat : en local, avec l'en-tête Host)
if [ "$DRY" = 0 ]; then
  for path in / /outils/ /sources/ /mentions-legales/ /assets/style.css /assets/app.js /assets/fonts/inter-400.woff2 /sitemap.xml; do
    code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 -H "Host: $DOMAIN" "http://127.0.0.1$path" || echo 000)"
    case "$code" in 200) ok "$path → 200" ;; 301|308) ok "$path → $code (redirection HTTPS)" ;; *) c 31 "  ✗ $path → $code"; rollback ;; esac
  done
  hdr="$(curl -sI --max-time 15 -H "Host: $DOMAIN" http://127.0.0.1/ | tr -d '\r' | grep -i '^content-security-policy' || true)"
  [ -n "$hdr" ] && ok "en-tête Content-Security-Policy présent" || warn "en-tête Content-Security-Policy absent (page servie par un autre vhost ?)"
fi

# ---- DNS et certificat
if [ "$DRY" = 0 ] && command -v getent >/dev/null; then
  dns="$(getent ahostsv4 "$DOMAIN" | awk '{print $1; exit}' || true)"
  me="$(curl -s4 --max-time 8 https://api.ipify.org 2>/dev/null || true)"
  if [ -z "$dns" ]; then warn "Le domaine $DOMAIN ne pointe vers rien (créer l'enregistrement DNS A, voir docs/deploiement.md)."
  elif [ -n "$me" ] && [ "$dns" != "$me" ]; then warn "$DOMAIN pointe vers $dns, ce serveur est $me : vérifier le DNS avant de demander le certificat."
  else ok "DNS : $DOMAIN → $dns"; fi
fi
if [ "$TLS" = 1 ]; then
  if [ "$DRY" = 1 ]; then echo "  (dry-run) certbot --nginx -d $DOMAIN"
  elif [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then ok "certificat Let's Encrypt déjà en place (renouvellement automatique par certbot)"
  else
    info "Demande du certificat HTTPS"
    if certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect; then ok "HTTPS activé"; else warn "Certificat non obtenu (DNS pas encore propagé ?). Relancer le script ensuite : le site reste en HTTP en attendant."; fi
  fi
fi

c 32 "Terminé : http$([ "$TLS" = 1 ] && echo s)://$DOMAIN/"
