#!/usr/bin/env bash
#
# install-plugins.sh — pasang + aktifkan plugin populer ke lab WordPress.
#
# Dua mode:
#
#   (default) WP-CLI  — pasang KE-40 plugin dari plugins.txt via wordpress.org.
#                       Butuh: wp-cli terpasang + akses ke api/downloads.wordpress.org.
#       bash wp-lab/install-plugins.sh
#
#   --github          — untuk jaringan terbatas yang MEMBLOKIR wordpress.org.
#                       git-clone subset plugin yang punya repo GitHub & jalan
#                       tanpa build, lalu aktifkan via activate-plugins.php.
#       bash wp-lab/install-plugins.sh --github
#
set -euo pipefail
LAB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WP_ROOT="$(cd "$LAB_DIR/.." && pwd)"
cd "$WP_ROOT"
PLUGINS_DIR="wp-content/plugins"
MODE="${1:-wpcli}"

# --------------------------------------------------------------------------
# Mode GitHub (jaringan terbatas): subset repo yang runnable tanpa build.
# --------------------------------------------------------------------------
if [ "$MODE" = "--github" ] || [ "$MODE" = "github" ]; then
  echo "==> Mode GitHub (untuk jaringan yang memblokir wordpress.org)"
  # slug -> owner/repo (dipilih yang jalan langsung tanpa npm/composer build)
  MAP="
antispam-bee=pluginkollektiv/antispam-bee
autoptimize=futtta/autoptimize
classic-editor=WordPress/classic-editor
classic-widgets=WordPress/classic-widgets
contact-form-7=takayukister/contact-form-7
health-check=WordPress/health-check
query-monitor=johnbillion/query-monitor
simple-history=bonny/wordpress-simple-history
two-factor=WordPress/two-factor
w3-total-cache=BoldGrid/W3-Total-Cache
wordpress-importer=WordPress/wordpress-importer
wordpress-popular-posts=cabrerahector/wordpress-popular-posts
wp-super-cache=Automattic/wp-super-cache
"
  ok=0; fail=0
  for line in $MAP; do
    slug="${line%%=*}"; repo="${line#*=}"
    [ -z "$slug" ] && continue
    if [ -f "$PLUGINS_DIR/$slug"/*.php ] 2>/dev/null; then :; fi
    rm -rf "${PLUGINS_DIR:?}/$slug"
    if timeout 120 git clone --quiet --depth 1 "https://github.com/$repo.git" "$PLUGINS_DIR/$slug" 2>/dev/null; then
      rm -rf "$PLUGINS_DIR/$slug/.git"; ok=$((ok+1)); echo "  cloned  $slug <- $repo"
    else
      fail=$((fail+1)); echo "  FAIL    $slug <- $repo"
    fi
  done
  echo "==> clone: ok=$ok fail=$fail. Mengaktifkan..."

  act=0; prob=0
  while IFS= read -r pf; do
    [ -z "$pf" ] && continue
    # get_plugins() hanya mengembalikan file ber-header plugin; cukup lewati
    # drop-in SQLite (bukan plugin biasa) dan sample hello.php.
    case "$pf" in hello.php|sqlite-database-integration/*) continue;; esac
    out="$(php "$LAB_DIR/activate-plugins.php" "$pf" 2>/tmp/wplab-err || true)"
    if [ "$out" = "ACTIVE" ]; then echo "  ACTIVE  $pf"; act=$((act+1))
    else echo "  problem $pf -> $(head -1 /tmp/wplab-err 2>/dev/null)"; prob=$((prob+1)); fi
  done < <(php "$LAB_DIR/activate-plugins.php" --list 2>/dev/null)

  echo ""
  echo "==> Aktif=$act, bermasalah=$prob"
  echo "    Catatan: sisa dari 40 plugin (woocommerce, elementor, jetpack, yoast,"
  echo "    wordfence, dsb.) butuh ZIP rilis resmi dari wordpress.org — pasang di"
  echo "    mesin dengan akses wordpress.org via mode WP-CLI di bawah."
  exit 0
fi

# --------------------------------------------------------------------------
# Mode WP-CLI (default): pasang KE-40 plugin dari plugins.txt.
# --------------------------------------------------------------------------
if ! command -v wp >/dev/null; then
  cat >&2 <<EOF
ERROR: wp-cli tidak ditemukan.
  Install: curl -O https://raw.githubusercontent.com/wp-cli/wp-cli/v2.11.0/phar/wp-cli.phar
           chmod +x wp-cli.phar && sudo mv wp-cli.phar /usr/local/bin/wp
  Atau jalankan mode jaringan-terbatas:  bash wp-lab/install-plugins.sh --github
EOF
  exit 1
fi

WP_CLI=( wp --path="$WP_ROOT" --allow-root )
ok=0; fail=0
while IFS= read -r slug; do
  slug="${slug%%#*}"; slug="$(echo "$slug" | tr -d '[:space:]')"
  [ -z "$slug" ] && continue
  if "${WP_CLI[@]}" plugin install "$slug" --activate >/dev/null 2>&1; then
    echo "  OK    $slug"; ok=$((ok+1))
  else
    echo "  FAIL  $slug"; fail=$((fail+1))
  fi
done < "$LAB_DIR/plugins.txt"
echo "==> Selesai: terpasang+aktif=$ok, gagal=$fail dari plugins.txt"
"${WP_CLI[@]}" plugin list --status=active --format=count 2>/dev/null | sed 's/^/   total aktif: /' || true
