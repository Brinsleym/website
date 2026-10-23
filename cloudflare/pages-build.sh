#!/usr/bin/env bash
# Cloudflare Pages build command: bash cloudflare/pages-build.sh
#
# Downloads a pinned Hugo extended rather than relying on whatever the Pages
# build image ships, so the site is built the same way every time. Go, which
# Hugo needs to fetch the Bookshop module, comes with the build image.
set -euo pipefail

HUGO_VERSION="${HUGO_VERSION:-0.158.0}"
dir="$(mktemp -d)"
curl -fsSL "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz" \
  | tar -xz -C "$dir" hugo
"$dir/hugo" version

"$dir/hugo" --environment production
