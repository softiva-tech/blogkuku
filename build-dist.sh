#!/usr/bin/env bash
# Build production folder: dist/ (upload contents to Hostinger public_html)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
SRC="$ROOT"
DST="$ROOT/dist"

echo "Cleaning $DST ..."
rm -rf "$DST"
mkdir -p "$DST"

echo "Copying project files ..."
rsync -a \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude '.gitignore' \
  --exclude '.cursor' \
  --exclude '.DS_Store' \
  --exclude '*.zip' \
  --exclude 'build-dist.sh' \
  --exclude 'deploy' \
  "$SRC/" "$DST/"

echo "Adding Apache .htaccess and DEPLOY.txt ..."
cp "$ROOT/deploy/htaccess.root" "$DST/.htaccess"
cp "$ROOT/deploy/DEPLOY.txt" "$DST/DEPLOY.txt"

# Ensure uploads tree exists (empty posts dir is fine; images go here in production)
mkdir -p "$DST/uploads/posts"
if [[ ! -f "$DST/uploads/posts/.htaccess" ]]; then
  echo "Warning: uploads/posts/.htaccess missing after copy" >&2
fi

echo "Done. Upload everything inside: $DST"
echo "See: $DST/DEPLOY.txt"
