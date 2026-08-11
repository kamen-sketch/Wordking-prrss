#!/usr/bin/env bash
#
# setup.sh — Jalankan WordPress (source di repo ini) secara LIVE tanpa Docker
# dan tanpa MySQL server: PHP built-in server + drop-in SQLite resmi WordPress.
#
# Cocok untuk "server terbatas" (tak boleh install service, tak ada MySQL,
# registry container diblokir). Hanya butuh: PHP 8.x dengan pdo_sqlite + git.
#
# Pemakaian:
#   bash wp-lab/setup.sh            # setup + start + install WP
#   WP_PORT=8090 bash wp-lab/setup.sh
#
# Setelah jalan: http://127.0.0.1:${WP_PORT}  (login: $WP_ADMIN_USER / $WP_ADMIN_PASSWORD)
# Stop server:  bash wp-lab/stop.sh
# Reset total:  bash wp-lab/stop.sh && rm -f wp-config.php wp-content/db.php \
#                 wp-content/debug.log && rm -rf wp-content/database
#
set -euo pipefail

# ---- Lokasi repo (root = parent dari folder wp-lab) ----
LAB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WP_ROOT="$(cd "$LAB_DIR/.." && pwd)"
cd "$WP_ROOT"

# ---- Konfigurasi (override via env) ----
WP_PORT="${WP_PORT:-8080}"
WP_HOST="${WP_HOST:-127.0.0.1}"
WP_TITLE="${WP_TITLE:-WP 7.1-RC2 Audit Lab}"
WP_ADMIN_USER="${WP_ADMIN_USER:-admin}"
WP_ADMIN_PASSWORD="${WP_ADMIN_PASSWORD:-admin}"
WP_ADMIN_EMAIL="${WP_ADMIN_EMAIL:-admin@example.test}"
SQLITE_TAG="${SQLITE_TAG:-v2.1.10}"   # rilis flat self-contained (pra-monorepo)
BASE_URL="http://${WP_HOST}:${WP_PORT}"

echo "==> WP root : $WP_ROOT"
echo "==> URL     : $BASE_URL"

# ---- Prasyarat ----
command -v php >/dev/null || { echo "ERROR: php tidak ada"; exit 1; }
php -m | grep -qi pdo_sqlite || { echo "ERROR: ekstensi pdo_sqlite wajib ada"; exit 1; }
[ -f "$WP_ROOT/wp-includes/version.php" ] || { echo "ERROR: bukan root WordPress"; exit 1; }

# ---- 1) Drop-in SQLite resmi ----
SQLITE_DIR="wp-content/plugins/sqlite-database-integration"
if [ ! -f "$SQLITE_DIR/wp-includes/sqlite/db.php" ]; then
  echo "==> Mengambil drop-in SQLite ($SQLITE_TAG) dari GitHub..."
  rm -rf "$SQLITE_DIR"
  git clone --quiet "https://github.com/WordPress/sqlite-database-integration.git" "$SQLITE_DIR"
  ( cd "$SQLITE_DIR" && git fetch --quiet --tags && git checkout --quiet "tags/$SQLITE_TAG" )
  rm -rf "$SQLITE_DIR/.git"
fi

# db.php drop-in (arahkan ke folder implementasi)
if [ ! -f wp-content/db.php ]; then
  echo "==> Menulis wp-content/db.php (drop-in)"
  sed "s|{SQLITE_IMPLEMENTATION_FOLDER_PATH}|PLACEHOLDER|" "$SQLITE_DIR/db.copy" \
    | sed "s|\$sqlite_plugin_implementation_folder_path = 'PLACEHOLDER';|\$sqlite_plugin_implementation_folder_path = __DIR__ . '/plugins/sqlite-database-integration';|" \
    > wp-content/db.php
fi

mkdir -p wp-content/database

# ---- 2) wp-config.php (SQLite) ----
if [ ! -f wp-config.php ]; then
  echo "==> Menulis wp-config.php (SQLite)"
  SALT="$(php -r '
    $k=["AUTH_KEY","SECURE_AUTH_KEY","LOGGED_IN_KEY","NONCE_KEY","AUTH_SALT","SECURE_AUTH_SALT","LOGGED_IN_SALT","NONCE_SALT"];
    foreach($k as $n){ printf("define(%s, %s);\n", var_export($n,true), var_export(bin2hex(random_bytes(32)),true)); }
  ')"
  cat > wp-config.php <<PHP
<?php
/* RUNTIME lab (SQLite) — auto-generated oleh wp-lab/setup.sh. Jangan di-commit. */
define('DB_ENGINE', 'sqlite');
define('DATABASE_TYPE', 'sqlite');
define('DB_DIR', __DIR__ . '/wp-content/database/');
define('DB_FILE', 'wp.sqlite');
define('DB_NAME', 'wordpress');
define('DB_USER', 'root');
define('DB_PASSWORD', '');
define('DB_HOST', 'localhost');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');
\$table_prefix = 'wp_';
$SALT
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', __DIR__ . '/wp-content/debug.log');
define('WP_DEBUG_DISPLAY', false);
define('FS_METHOD', 'direct');
define('AUTOMATIC_UPDATER_DISABLED', true);
define('WP_HOME', '$BASE_URL');
define('WP_SITEURL', '$BASE_URL');
if ( ! defined('ABSPATH') ) define('ABSPATH', __DIR__ . '/');
require_once ABSPATH . 'wp-settings.php';
PHP
fi

# ---- 3) Router untuk php -S (asset langsung, sisanya ke WP) ----
cat > wp-router.php <<'PHP'
<?php
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$file = __DIR__ . $uri;
if ($uri !== '/' && file_exists($file) && !is_dir($file)) return false;
require_once __DIR__ . '/index.php';
PHP

# ---- 4) Start server ----
if command -v fuser >/dev/null; then fuser -k "${WP_PORT}/tcp" 2>/dev/null || true; sleep 1; fi
echo "==> Start PHP server di $BASE_URL"
nohup php -S "${WP_HOST}:${WP_PORT}" -t "$WP_ROOT" "$WP_ROOT/wp-router.php" > /tmp/wp-lab-server.log 2>&1 &
disown || true
echo $! > /tmp/wp-lab-server.pid

# tunggu server siap
for i in $(seq 1 15); do
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$BASE_URL/wp-admin/install.php" || true)"
  [ "$code" = "200" ] || [ "$code" = "302" ] && break
  sleep 1
done

# ---- 5) Install WP bila belum ----
ALREADY="$(curl -s --max-time 10 "$BASE_URL/wp-admin/install.php" | grep -ci "already been installed" || true)"
if [ "$ALREADY" -gt 0 ]; then
  echo "==> WordPress sudah terinstall — skip."
else
  echo "==> Menjalankan instalasi WordPress..."
  curl -s --max-time 60 \
    --data-urlencode "weblog_title=$WP_TITLE" \
    --data-urlencode "user_name=$WP_ADMIN_USER" \
    --data-urlencode "admin_password=$WP_ADMIN_PASSWORD" \
    --data-urlencode "admin_password2=$WP_ADMIN_PASSWORD" \
    --data-urlencode "pw_weak=1" \
    --data-urlencode "admin_email=$WP_ADMIN_EMAIL" \
    --data-urlencode "blog_public=0" \
    --data-urlencode "Submit=Install WordPress" \
    "$BASE_URL/wp-admin/install.php?step=2" | grep -qi "success\|has been installed" \
    && echo "    OK: terinstall." || { echo "    GAGAL install (lihat /tmp/wp-lab-server.log)"; exit 1; }
fi

echo ""
echo "======================================================"
echo " WordPress LIVE (SQLite, tanpa Docker/MySQL)"
echo "   URL   : $BASE_URL"
echo "   Admin : $BASE_URL/wp-admin/  ($WP_ADMIN_USER / $WP_ADMIN_PASSWORD)"
echo "   Log   : /tmp/wp-lab-server.log   Stop: bash wp-lab/stop.sh"
echo " Pasang plugin: bash wp-lab/install-plugins.sh [--github]"
echo "======================================================"
