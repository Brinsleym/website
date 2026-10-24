#!/usr/bin/env bash
# One-off setup of the Hong Kong VPS (Debian/Ubuntu with nginx), run as root
# from a checkout of this repo:
#
#   sudo bash deploy/hk/setup.sh <deploy-public-key-file> <cert-method>
#
# <cert-method> is how Let's Encrypt checks we own the domain:
#   cloudflare  through Cloudflare's DNS API (needs CF_Token exported, with
#               Zone:DNS:Edit on brinsleymorrison.com). Only works while
#               Cloudflare still runs the domain's DNS: use it before the move.
#   webroot     through http://brinsleymorrison.com/.well-known/acme-challenge/
#               (www's challenge reaches it through a redirect from Pages).
#               Only works once AliDNS points the bare domain here.
# Renewals reuse the method, so after the move re-run with `webroot` once.
#
# Safe to re-run.
set -euo pipefail

key_file="${1:?deploy public key file}"
method="${2:?cert method: cloudflare or webroot}"
here="$(cd "$(dirname "$0")" && pwd)"
site=/var/www/brinsleymorrison
email="contact@brinsleymorrison.com"

# The user GitHub Actions deploys as: no password, no sudo, owns the site.
id deploy >/dev/null 2>&1 || useradd --create-home --shell /bin/bash deploy
install -d -m 700 -o deploy -g deploy ~deploy/.ssh
install -m 600 -o deploy -g deploy "$key_file" ~deploy/.ssh/authorized_keys
command -v rsync >/dev/null || apt-get install -y rsync

install -d -o deploy -g deploy "$site" "$site/releases"
install -d /var/www/acme/.well-known/acme-challenge
install -d -m 700 /etc/nginx/ssl/brinsleymorrison

install -m 644 "$here/headers.conf" /etc/nginx/snippets/brinsleymorrison-headers.conf
install -m 644 "$here/tls.conf" /etc/nginx/snippets/brinsleymorrison-tls.conf
install -m 644 "$here/nginx.conf" /etc/nginx/sites-available/brinsleymorrison.conf

# nginx refuses to start without the certificate files, so until the real
# certificate is issued the site runs on a throwaway self-signed one.
if [ ! -s /etc/nginx/ssl/brinsleymorrison/fullchain.pem ]; then
  openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -nodes -days 7 \
    -subj /CN=brinsleymorrison.com \
    -keyout /etc/nginx/ssl/brinsleymorrison/key.pem \
    -out /etc/nginx/ssl/brinsleymorrison/fullchain.pem
fi

ln -sfn /etc/nginx/sites-available/brinsleymorrison.conf /etc/nginx/sites-enabled/brinsleymorrison.conf
nginx -t
systemctl reload nginx

acme=~/.acme.sh/acme.sh
[ -x "$acme" ] || curl -fsSL https://get.acme.sh | sh -s email="$email"

case "$method" in
  cloudflare) how=(--dns dns_cf) ;;
  webroot)    how=(--webroot /var/www/acme) ;;
  *) echo "unknown cert method: $method" >&2; exit 1 ;;
esac

"$acme" --issue --server letsencrypt --keylength ec-256 --force \
  -d brinsleymorrison.com -d www.brinsleymorrison.com "${how[@]}"
"$acme" --install-cert --ecc -d brinsleymorrison.com \
  --key-file /etc/nginx/ssl/brinsleymorrison/key.pem \
  --fullchain-file /etc/nginx/ssl/brinsleymorrison/fullchain.pem \
  --reloadcmd "systemctl reload nginx"
