#!/usr/bin/env bash
#
# Install plugins from the WordPress.org plugin directory.
#
# This is the canonical, preferred way to install a plugin: the directory
# serves an already-built zip, so nothing has to be compiled locally.
#
# It requires downloads.wordpress.org to be reachable. If this environment's
# egress allowlist blocks it, curl fails and the script says so; use
# install-from-github-release.sh instead. See README.md.
#
# Usage:
#   ./install-from-wporg.sh contact-form-7 woocommerce wordpress-seo
#   ./install-from-wporg.sh -f slugs.txt          # one slug per line
#
set -euo pipefail

PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/wp-content/plugins"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

slugs=()
if [ "${1:-}" = "-f" ]; then
    [ -n "${2:-}" ] || { echo "usage: $0 -f <file>" >&2; exit 2; }
    while read -r line; do
        line="${line%%#*}"; line="$(echo "$line" | tr -d '[:space:]')"
        [ -n "$line" ] && slugs+=("$line")
    done < "$2"
else
    slugs=("$@")
fi
[ ${#slugs[@]} -gt 0 ] || { echo "usage: $0 <slug>... | -f <file>" >&2; exit 2; }

mkdir -p "$PLUGIN_DIR"
ok=0; failed=()

for slug in "${slugs[@]}"; do
    url="https://downloads.wordpress.org/plugin/${slug}.latest-stable.zip"
    printf '%-32s ' "$slug"

    if ! curl -fsSL --retry 3 --retry-delay 2 -o "$TMP/$slug.zip" "$url" 2>"$TMP/err"; then
        # A host outside the egress allowlist fails in one of two ways: the
        # proxy refuses the tunnel ("CONNECT tunnel failed, response 403"), or,
        # for hosts curl reaches directly, it answers 403 with an explanatory
        # body that -f throws away. Ask again without -f to catch the second.
        curl -sSL -o "$TMP/body" "$url" 2>>"$TMP/err" || true
        if grep -qs -e 'not in allowlist' -e 'CONNECT tunnel failed' \
                    -e 'response 403' -e 'error: 403' "$TMP/body" "$TMP/err"; then
            echo "FAILED (downloads.wordpress.org is not in this environment's egress allowlist)"
        else
            echo "FAILED (download: $(tr -d '\n' < "$TMP/err" | cut -c1-60))"
        fi
        failed+=("$slug"); continue
    fi

    if ! unzip -tq "$TMP/$slug.zip" >/dev/null 2>&1; then
        echo "FAILED (corrupt zip)"; failed+=("$slug"); continue
    fi

    rm -rf "${PLUGIN_DIR:?}/$slug"
    unzip -qo "$TMP/$slug.zip" -d "$PLUGIN_DIR"

    # The directory-served zip always wraps the plugin in a folder, but it is
    # not guaranteed to be named after the slug. Normalise it if it is not.
    if [ ! -d "$PLUGIN_DIR/$slug" ]; then
        top="$(unzip -Z1 "$TMP/$slug.zip" | cut -d/ -f1 | sort -u | head -1)"
        [ -d "$PLUGIN_DIR/$top" ] && mv "$PLUGIN_DIR/$top" "$PLUGIN_DIR/$slug"
    fi

    ver="$(grep -rhm1 -i '^[ *#]*Version:' "$PLUGIN_DIR/$slug"/*.php 2>/dev/null \
           | head -1 | sed 's/.*[Vv]ersion:[[:space:]]*//' | tr -d '\r')"
    echo "installed ${ver:-?}"
    ok=$((ok + 1))
done

echo
echo "installed: $ok/${#slugs[@]}"
if [ ${#failed[@]} -gt 0 ]; then
    echo "failed:    ${failed[*]}"
    exit 1
fi
