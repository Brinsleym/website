#!/usr/bin/env bash
# One-off setup of the Hong Kong VPS (Debian), run as root:
#
#   bash setup.sh <deploy-public-key-file> <cert-method>
#
# It downloads its config files from this repo's branch, so it can be run
# from anywhere. It prepares nginx alongside the Apache that serves the site
# today, without starting it: switch-to-nginx.sh does the switch.
#
# <cert-method> is how Let's Encrypt checks we own the domain:
#   cloudflare  through Cloudflare's DNS API (needs CF_Token exported, with
#               Zone:DNS:Edit on brinsleymorrison.com). Only works while
#               Cloudflare still runs the domain's DNS: use it before the move.
#   webroot     through http://brinsleymorrison.com/.well-known/acme-challenge/
#               (www's challenge reaches it through a redirect from Pages).
#               Only works once AliDNS points the bare domain here.
#   none        skip the certificate for now.
# Renewals reuse the method, so after the move re-run with `webroot` once.
#
# Safe to re-run.
set -euo pipefail

key_file="${1:?deploy public key file}"
method="${2:?cert method: cloudflare or webroot}"
branch="${BRANCH:-master}"
raw="https://raw.githubusercontent.com/Brinsleym/website/$branch/deploy/hk"
site=/var/www/brinsleymorrison
email="contact@brinsleymorrison.com"

# Install nginx without letting it start: Apache holds ports 80 and 443
# until the switch.
if ! command -v nginx >/dev/null || ! command -v rsync >/dev/null; then
  printf '#!/bin/sh\nexit 101\n' > /usr/sbin/policy-rc.d
  chmod +x /usr/sbin/policy-rc.d
  trap 'rm -f /usr/sbin/policy-rc.d' EXIT
  apt-get update -q
  DEBIAN_FRONTEND=noninteractive apt-get install -y -q nginx rsync
  rm -f /usr/sbin/policy-rc.d
  systemctl is-active --quiet apache2 && systemctl disable nginx
fi
rm -f /etc/nginx/sites-enabled/default

# The user GitHub Actions deploys as: no password, no sudo, owns the site.
id deploy >/dev/null 2>&1 || useradd --create-home --shell /bin/bash deploy
install -d -m 700 -o deploy -g deploy ~deploy/.ssh
install -m 600 -o deploy -g deploy "$key_file" ~deploy/.ssh/authorized_keys
install -d -o deploy -g deploy "$site" "$site/releases"
install -d /var/www/acme/.well-known/acme-challenge
install -d -m 700 /etc/nginx/ssl/brinsleymorrison

curl -fsSL "$raw/headers.conf" -o /etc/nginx/snippets/brinsleymorrison-headers.conf
curl -fsSL "$raw/tls.conf" -o /etc/nginx/snippets/brinsleymorrison-tls.conf
curl -fsSL "$raw/nginx.conf" -o /etc/nginx/sites-available/brinsleymorrison.conf
ln -sfn /etc/nginx/sites-available/brinsleymorrison.conf /etc/nginx/sites-enabled/brinsleymorrison.conf

# get.acme.sh refuses requests it places in China, which includes this
# server, so install from the GitHub tarball instead.
acme=~/.acme.sh/acme.sh
if [ ! -x "$acme" ]; then
  src="$(mktemp -d)"
  curl -fsSL https://github.com/acmesh-official/acme.sh/archive/refs/heads/master.tar.gz | tar -xz -C "$src"
  (cd "$src"/acme.sh-master && ./acme.sh --install -m "$email")
  rm -rf "$src"
fi

case "$method" in
  none)       exit 0 ;;
  cloudflare) how=(--dns dns_cf) ;;
  webroot)    how=(--webroot /var/www/acme) ;;
  *) echo "unknown cert method: $method" >&2; exit 1 ;;
esac

"$acme" --issue --server letsencrypt --keylength ec-256 --force \
  -d brinsleymorrison.com -d www.brinsleymorrison.com "${how[@]}"
# try-reload: a no-op while Apache is still serving.
"$acme" --install-cert --ecc -d brinsleymorrison.com \
  --key-file /etc/nginx/ssl/brinsleymorrison/key.pem \
  --fullchain-file /etc/nginx/ssl/brinsleymorrison/fullchain.pem \
  --reloadcmd "systemctl try-reload-or-restart nginx"

nginx -t
