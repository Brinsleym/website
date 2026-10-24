#!/usr/bin/env bash
# Switches the Hong Kong VPS from Apache (the old setup) to nginx, run as root
# after setup.sh and a first deploy. `bash switch-to-nginx.sh back` undoes it;
# the Apache config is left untouched.
set -euo pipefail

if [ "${1:-}" = back ]; then
  systemctl disable --now nginx
  systemctl enable --now apache2
  exit
fi

[ -e /var/www/brinsleymorrison/current ] || { echo "no release deployed yet" >&2; exit 1; }
nginx -t
systemctl disable --now apache2
systemctl enable --now nginx
