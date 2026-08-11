#!/usr/bin/env bash
# stop.sh — hentikan PHP built-in server milik lab.
set -euo pipefail
WP_PORT="${WP_PORT:-8080}"
if [ -f /tmp/wp-lab-server.pid ]; then
  kill "$(cat /tmp/wp-lab-server.pid)" 2>/dev/null || true
  rm -f /tmp/wp-lab-server.pid
fi
command -v fuser >/dev/null && fuser -k "${WP_PORT}/tcp" 2>/dev/null || true
echo "Server dihentikan (port ${WP_PORT})."
