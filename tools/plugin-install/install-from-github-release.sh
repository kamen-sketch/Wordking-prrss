#!/usr/bin/env bash
#
# Install a plugin from the built zip attached to its GitHub release.
#
# Fallback for when downloads.wordpress.org is not reachable but github.com is.
# Many plugin projects attach the same built artifact they ship to the plugin
# directory to their GitHub release, so this yields a real, ready-to-run plugin
# rather than an unbuilt source tree.
#
# The GitHub API cannot be used to list a release's assets here (it is scoped to
# the session's own repositories), so the asset name is guessed from the naming
# patterns projects actually use. Every pattern that hit for the 28 plugins
# installed this way is in PATTERNS below.
#
# Usage:
#   ./install-from-github-release.sh woocommerce/woocommerce woocommerce
#   ./install-from-github-release.sh -f repos.tsv     # "<owner/repo><TAB><slug>" per line
#
set -euo pipefail

PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/wp-content/plugins"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Latest release-looking tag, resolved over git so no API access is needed.
latest_tag() {
    git ls-remote --tags --refs "https://github.com/$1.git" 2>/dev/null \
        | sed 's#.*refs/tags/##' \
        | grep -E '^v?[0-9]+\.[0-9]+(\.[0-9]+)?$' \
        | sed 's/^v//' | sort -V | tail -1
}

# Asset name patterns, in the order they are tried.
patterns() {
    local slug="$1" tag="$2" repo_name="$3"
    printf '%s\n' \
        "$slug.zip" \
        "$slug-$tag.zip" \
        "$slug.$tag.zip" \
        "$slug-v$tag.zip" \
        "$repo_name.zip" \
        "$repo_name-$tag.zip"
}

install_one() {
    local repo="$1" slug="$2" repo_name="${1#*/}"
    printf '%-32s ' "$slug"

    local tag; tag="$(latest_tag "$repo")"
    [ -n "$tag" ] || { echo "FAILED (no release tag found)"; return 1; }

    local found=""
    for t in "$tag" "v$tag"; do
        while read -r name; do
            local url="https://github.com/$repo/releases/download/$t/$name"
            # Range request: costs one byte, not the whole asset.
            local code
            code="$(curl -sSL -r 0-0 -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || true)"
            if [ "$code" = "200" ] || [ "$code" = "206" ]; then found="$url"; break 2; fi
        done < <(patterns "$slug" "$tag" "$repo_name")
    done
    [ -n "$found" ] || { echo "FAILED (no release asset for $tag; project likely publishes none)"; return 1; }

    curl -fsSL --retry 3 -o "$TMP/$slug.zip" "$found" || { echo "FAILED (download)"; return 1; }
    unzip -tq "$TMP/$slug.zip" >/dev/null 2>&1 || { echo "FAILED (corrupt zip)"; return 1; }

    # Some projects wrap the plugin in a folder, others zip its contents at the
    # root. Extract to a staging dir and normalise both shapes.
    rm -rf "$TMP/stage"; mkdir -p "$TMP/stage"
    unzip -qo "$TMP/$slug.zip" -d "$TMP/stage"

    local src="$TMP/stage" tops
    tops="$(find "$TMP/stage" -mindepth 1 -maxdepth 1 | wc -l)"
    if [ "$tops" -eq 1 ]; then
        local only; only="$(find "$TMP/stage" -mindepth 1 -maxdepth 1)"
        [ -d "$only" ] && src="$only"
    fi

    rm -rf "${PLUGIN_DIR:?}/$slug"
    mkdir -p "$PLUGIN_DIR"
    cp -a "$src" "$PLUGIN_DIR/$slug"

    echo "installed $tag  ($(basename "$found"))"
}

mkdir -p "$PLUGIN_DIR"
rc=0
if [ "${1:-}" = "-f" ]; then
    [ -n "${2:-}" ] || { echo "usage: $0 -f <file>" >&2; exit 2; }
    while IFS=$'\t ' read -r repo slug _; do
        [ -z "${repo:-}" ] && continue
        case "$repo" in \#*) continue;; esac
        install_one "$repo" "${slug:-${repo#*/}}" || rc=1
    done < "$2"
elif [ $# -eq 2 ]; then
    install_one "$1" "$2" || rc=1
else
    echo "usage: $0 <owner/repo> <slug> | $0 -f <file>" >&2; exit 2
fi
exit $rc
