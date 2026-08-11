#!/usr/bin/env python3
"""Check that every directory in wp-content/plugins is a usable plugin.

A plugin obtained from a source tree rather than a built zip can look complete
while being unusable: WordPress will not list it if its header is in the wrong
place, it will fatal if a required vendor/autoload.php is missing, and it will
load with no styling if its assets were never built. Each check below catches
one of those.

  header   A file directly inside the plugin directory carries a "Plugin Name:"
           header. WordPress only scans that top level, so a header one
           directory deeper makes the plugin invisible.
  syntax   That file passes `php -l`.
  vendor   No production PHP requires vendor/autoload.php unless it exists.
           Test and tooling directories are ignored, since they never run in
           production.
  assets   Every .js/.css path written as a literal in the plugin's PHP resolves
           to a file that exists. This is what catches an unbuilt plugin: the
           repository ships src/ and enqueues build/, so the references dangle.

The assets check is a heuristic and reports a percentage rather than pass/fail:
references to WordPress core handles (wp-admin/js/iris.min.js), to premium
add-ons, and to third-party URLs legitimately do not resolve. Read the misses
before believing them -- a plugin missing its own build/*.js is broken, a
plugin "missing" wp-includes/js/jquery/jquery.js is fine.

Usage:
    ./verify-plugins.py [wp-content/plugins] [--quiet]

Exit status is non-zero if any plugin fails header, syntax or vendor.
"""
import os
import re
import subprocess
import sys

SKIP_DIRS = {".git", ".github", "node_modules", "vendor", "tests", "test",
             "bin", "dev", "tools", "phpstan", ".wordpress-org"}
NON_PRODUCTION = re.compile(r"/(tests?|bin|\.github|node_modules|dev|tools|phpstan)/")
ASSET_LITERAL = re.compile(r"""['"]([A-Za-z0-9._/\-]+\.(?:js|css))['"]""")
HEADER = re.compile(r"^[\s*#]*Plugin Name:\s*(.+)$", re.M | re.I)
VERSION = re.compile(r"^[\s*#]*Version:\s*(.+)$", re.M | re.I)


def main_file(plugin_dir):
    """WordPress only reads plugin headers from the directory's top level."""
    for entry in sorted(os.listdir(plugin_dir)):
        path = os.path.join(plugin_dir, entry)
        if not entry.endswith(".php") or not os.path.isfile(path):
            continue
        with open(path, encoding="utf-8", errors="ignore") as fh:
            head = fh.read(8192)
        match = HEADER.search(head)
        if match:
            version = VERSION.search(head)
            return path, match.group(1).strip(), (
                version.group(1).strip() if version else "?")
    return None, None, None


def walk_php(plugin_dir, skip_src=False):
    skip = SKIP_DIRS | ({"src"} if skip_src else set())
    for root, dirs, files in os.walk(plugin_dir):
        dirs[:] = [d for d in dirs if d not in skip]
        for name in files:
            if name.endswith(".php"):
                yield os.path.join(root, name)


def needs_missing_vendor(plugin_dir):
    """True if production code requires an autoloader that is not there.

    A plugin may keep vendor/ in a subdirectory rather than at its root --
    Really Simple SSL loads lets-encrypt/vendor/autoload.php from files inside
    lets-encrypt/ -- so a requirement counts as satisfied when the requiring
    file's own directory, or any directory above it up to the plugin root, has
    a vendor/autoload.php.
    """
    pattern = re.compile(r"(require|include)(_once)?[^;]*vendor/autoload")
    for path in walk_php(plugin_dir):
        if NON_PRODUCTION.search(path):
            continue
        with open(path, encoding="utf-8", errors="ignore") as fh:
            if not pattern.search(fh.read()):
                continue
        directory = os.path.dirname(os.path.abspath(path))
        root = os.path.abspath(plugin_dir)
        satisfied = False
        while True:
            if os.path.isfile(os.path.join(directory, "vendor", "autoload.php")):
                satisfied = True
                break
            if directory == root or not directory.startswith(root):
                break
            directory = os.path.dirname(directory)
        if not satisfied:
            return True
    return False


def asset_coverage(plugin_dir):
    present = set()
    for root, dirs, files in os.walk(plugin_dir):
        dirs[:] = [d for d in dirs if d not in {".git", "node_modules"}]
        for name in files:
            rel = os.path.relpath(os.path.join(root, name), plugin_dir)
            present.add(rel.replace(os.sep, "/"))

    referenced = set()
    for path in walk_php(plugin_dir, skip_src=True):
        with open(path, encoding="utf-8", errors="ignore") as fh:
            for ref in ASSET_LITERAL.findall(fh.read()):
                if "/" in ref and not ref.startswith("http"):
                    referenced.add(ref.lstrip("./"))
    if not referenced:
        return None, []

    missing = sorted(r for r in referenced
                     if not any(p == r or p.endswith("/" + r) for p in present))
    return 100 * (len(referenced) - len(missing)) // len(referenced), missing


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    quiet = "--quiet" in sys.argv[1:]
    base = args[0] if args else os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "..", "..",
        "wp-content", "plugins")
    base = os.path.abspath(base)
    if not os.path.isdir(base):
        sys.exit(f"error: {base} is not a directory")

    failures = []
    checked = 0
    for entry in sorted(os.listdir(base)):
        plugin_dir = os.path.join(base, entry)
        if not os.path.isdir(plugin_dir):
            continue
        checked += 1
        problems = []

        path, name, version = main_file(plugin_dir)
        if not path:
            problems.append("no plugin header in a top-level PHP file")
        else:
            lint = subprocess.run(["php", "-l", path],
                                  capture_output=True, text=True)
            if lint.returncode != 0:
                problems.append(f"php -l failed: {lint.stdout.strip()[:80]}")

        if needs_missing_vendor(plugin_dir):
            problems.append("requires vendor/autoload.php but vendor/ is absent")

        coverage, missing = asset_coverage(plugin_dir)
        note = ""
        if coverage is not None and coverage < 100:
            note = f"  assets {coverage}% ({len(missing)} unresolved, e.g. {missing[0]})"

        if problems:
            failures.append((entry, problems))
            print(f"FAIL  {entry:<30} {'; '.join(problems)}")
        elif not quiet:
            print(f"ok    {entry:<30} {version:<12} {name}{note}")

    print(f"\n{checked - len(failures)}/{checked} plugins usable")
    if failures:
        print(f"broken: {', '.join(name for name, _ in failures)}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
