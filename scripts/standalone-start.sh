#!/usr/bin/env bash
# Run next to server.js (standalone output). Use this instead of `node server.js` on VPS / Hostinger.
set -euo pipefail
cd "$(dirname "$0")"

# Next's standalone server uses HOSTNAME for listen(); many hosts set HOSTNAME to the
# machine name, so nginx/apache proxying to 127.0.0.1:PORT gets connection refused → 503.
export HOSTNAME="${NEXT_HOST_BIND:-0.0.0.0}"

if [[ -f .env ]]; then
  exec node --env-file=.env server.js
else
  exec node server.js
fi
