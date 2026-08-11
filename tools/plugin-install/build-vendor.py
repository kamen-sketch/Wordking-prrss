#!/usr/bin/env python3
"""Build a plugin's vendor/ directory offline, without Packagist.

Some plugins do not commit vendor/ and do not attach a built zip to their
GitHub release, so they fatal on a missing vendor/autoload.php. Packagist is
unreachable from this environment, but the dependencies themselves are hosted
on GitHub, which is reachable. That is enough.

Two cases, detected automatically:

  A. The plugin has no real Composer dependencies (only "php" / "ext-*"
     constraints). Its vendor/ is nothing but a generated autoloader, so it is
     generated in place with `composer dump-autoload`. No network at all.

  B. The plugin has real dependencies. Their repository URLs and locked
     versions are read out of composer.lock -- note that a package's name and
     its repository name often differ (Really Simple SSL requires
     "fbett/le_acme2", which lives at github.com/fbett/le-acme2-php, and only
     the lock file knows that). Each one is cloned from GitHub, then Composer
     installs from those clones as *path* repositories with Packagist
     disabled.

composer.lock lists the fully resolved dependency graph, so transitive
dependencies are covered by iterating over it.

The plugin's own composer.json and composer.lock are restored afterwards, so
the only difference from upstream is the generated vendor/.

Usage:
    ./build-vendor.py <dir-containing-composer.json> [--keep-clones]

Example (Really Simple SSL keeps its Composer manifest in a subdirectory):
    ./build-vendor.py wp-content/plugins/really-simple-ssl/lets-encrypt
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile

COMPOSER_ENV = {
    **os.environ,
    "COMPOSER_ALLOW_SUPERUSER": "1",
    "COMPOSER_NO_INTERACTION": "1",
}


def run(cmd, cwd=None, check=True):
    p = subprocess.run(cmd, cwd=cwd, env=COMPOSER_ENV,
                       capture_output=True, text=True)
    if check and p.returncode != 0:
        sys.exit(f"error: {' '.join(cmd)}\n{p.stdout}\n{p.stderr}")
    return p


def real_requirements(composer_json):
    req = composer_json.get("require", {})
    return {k: v for k, v in req.items()
            if k != "php" and not k.startswith(("ext-", "lib-", "composer-"))}


def clone_dependency(pkg, dest):
    """Clone one locked package from GitHub at its locked version."""
    name = pkg["name"]
    version = pkg.get("version", "")
    source = pkg.get("source") or {}
    url = source.get("url") or (pkg.get("dist") or {}).get("url", "")
    reference = source.get("reference", "")

    if "github.com" not in url:
        return None, f"{name}: source is not GitHub ({url or 'unknown'})"

    url = url.replace("git://", "https://")
    if not url.endswith(".git"):
        url += ".git"

    # Locked versions are usually a tag, with or without a leading "v".
    for tag in (version, version.lstrip("v"), "v" + version.lstrip("v")):
        if not tag:
            continue
        p = run(["git", "clone", "--depth", "1", "--quiet", "--branch", tag,
                 url, dest], check=False)
        if p.returncode == 0:
            return tag, None
        shutil.rmtree(dest, ignore_errors=True)

    # Dev versions and moved tags: fall back to the locked commit.
    if reference:
        p = run(["git", "clone", "--quiet", url, dest], check=False)
        if p.returncode == 0:
            if run(["git", "checkout", "--quiet", reference],
                   cwd=dest, check=False).returncode == 0:
                return reference[:9], None
        shutil.rmtree(dest, ignore_errors=True)

    return None, f"{name}: no tag {version!r} and no usable commit at {url}"


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    keep = "--keep-clones" in sys.argv[1:]
    if len(args) != 1:
        sys.exit(__doc__)

    root = os.path.abspath(args[0])
    manifest = os.path.join(root, "composer.json")
    lockfile = os.path.join(root, "composer.lock")
    if not os.path.isfile(manifest):
        sys.exit(f"error: no composer.json in {root}")

    with open(manifest) as fh:
        composer_json = json.load(fh)
    deps = real_requirements(composer_json)

    # --- Case A: nothing to install, just regenerate the autoloader ----------
    if not deps:
        print(f"no real dependencies -> generating autoloader in {root}")
        run(["composer", "dump-autoload", "--no-dev",
             "--classmap-authoritative", "--no-scripts"], cwd=root)
        print("vendor/autoload.php generated")
        return

    # --- Case B: clone each locked package, install from path repositories ---
    if not os.path.isfile(lockfile):
        sys.exit("error: composer.lock is required to resolve dependency "
                 "repositories offline (it records each package's source URL)")

    with open(lockfile) as fh:
        packages = json.load(fh).get("packages", [])
    if not packages:
        sys.exit("error: composer.lock lists no packages")

    print(f"{len(packages)} locked package(s) to fetch from GitHub")
    clones = tempfile.mkdtemp(prefix="composer-deps-")
    backup = {}
    for path in (manifest, lockfile):
        with open(path) as fh:
            backup[path] = fh.read()

    try:
        repositories = {"packagist.org": False}
        for i, pkg in enumerate(packages):
            dest = os.path.join(clones, pkg["name"].replace("/", "__"))
            got, err = clone_dependency(pkg, dest)
            if err:
                sys.exit(f"error: {err}")
            print(f"  {pkg['name']:<44} {got}")
            repositories[f"local{i}"] = {
                "type": "path", "url": dest, "options": {"symlink": False},
            }

        # Composer accepts either a map or a list; the map form keeps
        # "packagist.org": false unambiguous.
        composer_json["repositories"] = repositories
        with open(manifest, "w") as fh:
            json.dump(composer_json, fh, indent=4)
        os.remove(lockfile)

        # --ignore-platform-req=php: dependencies routinely pin an older PHP
        # than the local CLI, and the constraint that matters is the one on the
        # server that will actually run WordPress.
        p = run(["composer", "install", "--no-dev", "--no-scripts",
                 "--optimize-autoloader", "--ignore-platform-req=php"],
                cwd=root, check=False)
        print(p.stdout.strip() or p.stderr.strip())
        if p.returncode != 0:
            sys.exit("error: composer install failed")
    finally:
        for path, content in backup.items():
            with open(path, "w") as fh:
                fh.write(content)
        if keep:
            print(f"dependency clones kept in {clones}")
        else:
            shutil.rmtree(clones, ignore_errors=True)

    autoload = os.path.join(root, "vendor", "autoload.php")
    if not os.path.isfile(autoload):
        sys.exit("error: vendor/autoload.php was not produced")
    print(f"built {autoload}")
    print("composer.json and composer.lock restored to their upstream state")


if __name__ == "__main__":
    main()
