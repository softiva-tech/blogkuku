#!/usr/bin/env bash
# Creates the empty MySQL database defined in scripts/mysql/01-create-database.sql
# Requires: mysql client on PATH (e.g. brew install mysql-client, or XAMPP mysql/bin)

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SQL="$ROOT/scripts/mysql/01-create-database.sql"

if ! command -v mysql >/dev/null 2>&1; then
  echo "mysql CLI not found. Either:"
  echo "  1. Open phpMyAdmin → SQL → paste contents of: $SQL"
  echo "  2. Or add MySQL client to PATH (XAMPP: .../xamppfiles/bin/mysql)"
  exit 1
fi

echo "Creating database (root, no password on 127.0.0.1:3306)..."
mysql -h 127.0.0.1 -P 3306 -u root < "$SQL"
echo "Done. Next: cd $ROOT && npx prisma db push && npm run db:seed"
