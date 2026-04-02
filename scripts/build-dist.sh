#!/usr/bin/env bash
# Build a Hostinger / VPS–ready folder under ./dist/app (Node.js required on the server).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Clean previous dist + .next"
rm -rf "$ROOT/dist"
rm -rf "$ROOT/.next"

echo "==> prisma generate + next build (standalone)"
npm run build

STAND="$ROOT/.next/standalone"
if [[ ! -f "$STAND/server.js" ]]; then
  echo "ERROR: .next/standalone/server.js missing — fix build errors above."
  exit 1
fi

echo "==> Assemble dist/app"
mkdir -p "$ROOT/dist/app"
cp -R "$STAND"/. "$ROOT/dist/app/"

mkdir -p "$ROOT/dist/app/.next/static"
cp -R "$ROOT/.next/static"/. "$ROOT/dist/app/.next/static/"

mkdir -p "$ROOT/dist/app/public"
cp -R "$ROOT/public"/. "$ROOT/dist/app/public/" 2>/dev/null || true

mkdir -p "$ROOT/dist/app/prisma"
cp "$ROOT/prisma/schema.prisma" "$ROOT/dist/app/prisma/"

mkdir -p "$ROOT/dist/mysql-scripts"
cp "$ROOT/scripts/mysql/"*.sql "$ROOT/dist/mysql-scripts/" 2>/dev/null || true

cp "$ROOT/.env.example" "$ROOT/dist/.env.example"
cp "$ROOT/scripts/HOSTINGER-DEPLOY.md" "$ROOT/dist/README-HOSTINGER.md"
cp "$ROOT/scripts/standalone-start.sh" "$ROOT/dist/app/start.sh"
chmod +x "$ROOT/dist/app/start.sh"

echo ""
echo "Done. Upload the contents of: $ROOT/dist/app"
echo "Start with: ./start.sh   (or see README-HOSTINGER.md)"
echo "Read: $ROOT/dist/README-HOSTINGER.md"
