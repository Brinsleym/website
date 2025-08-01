#!/bin/bash

# Usage: ./release_and_deploy.sh v1.2.3 "Release message"
# Example: ./release_and_deploy.sh v1.2.3 "Add blog section and fix image paths"

set -e

TAG="$1"
MESSAGE="$2"

if [ -z "$TAG" ] || [ -z "$MESSAGE" ]; then
  echo "Usage: $0 <tag> <release commit message>"
  exit 1
fi

CONFIG_FILE="config.prod.toml"
CDN_URL="https://cdn.jsdelivr.net/gh/Brinsleym/website@$TAG/"

# 1. Update the CDN tag in config.prod.toml (assumes [params] asset_base_url exists)
if grep -q 'asset_base_url' "$CONFIG_FILE"; then
  sed -i.bak -E "s|asset_base_url = \".*\"|asset_base_url = \"$CDN_URL\"|g" "$CONFIG_FILE"
else
  echo "[params]" >> "$CONFIG_FILE"
  echo "asset_base_url = \"$CDN_URL\"" >> "$CONFIG_FILE"
fi

echo "Updated $CONFIG_FILE with CDN URL: $CDN_URL"

# 2. Commit the change
git add "$CONFIG_FILE"
git commit -m "$MESSAGE"
echo "Committed config changes."

# 3. Tag the release
git tag "$TAG"
git push origin "$TAG"
git push
echo "Tagged release as $TAG and pushed to origin."

# 4. Build the site with production config
hugo --config config.toml,config.prod.toml
echo "Site built with production config."

# 5. Deploy step (customize for your host—here is a placeholder)
# Uncomment and modify the following line for your deployment method:
# rsync -avz --delete public/ <user>@<host>:/path/to/site/

echo "Build complete. Deploy manually or add your deployment command."