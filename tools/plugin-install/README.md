# Plugin install tooling

How the 43 plugins in `wp-content/plugins/` were obtained, and the scripts to
reproduce or extend that. Written because this environment cannot reach the
WordPress.org plugin directory, which makes the normal one-line install
unavailable and the workarounds worth recording.

Every script here was run against this repository before being committed.

## The constraint

Outbound traffic goes through an egress allowlist. A blocked host fails in one
of two ways, depending on whether curl reaches it directly or through the
proxy:

```
curl: (56) CONNECT tunnel failed, response 403
Host not in allowlist: registry.npmjs.org. Add this host to your network egress settings to allow access.
```

| Reachable | Blocked |
| --- | --- |
| `github.com` (git clone and release asset downloads) | `downloads.wordpress.org`, `api.wordpress.org`, `plugins.svn.wordpress.org` |
| `api.github.com` (scoped to this session's own repositories) | `registry.npmjs.org`, `repo.packagist.org` |
| `objects.githubusercontent.com` (release asset CDN) | `raw.githubusercontent.com`, `codeload.github.com` |

Two consequences shape everything below:

- **No JavaScript build is possible.** node, npm, yarn and pnpm are installed,
  but the registry is unreachable and no `node_modules` is vendored. A plugin
  whose repository ships only `src/` assets cannot be completed here. This is a
  hard wall, not an inconvenience.
- **PHP dependencies are fine.** Composer never has to talk to Packagist if it
  is pointed at local checkouts instead, and plugin dependencies live on GitHub,
  which is reachable. `build-vendor.py` automates that.

## Which script to use

```
Is downloads.wordpress.org reachable?
├─ yes → install-from-wporg.sh          (always prefer this; the zip is prebuilt)
└─ no  → Does the project attach a zip to its GitHub release?
         ├─ yes → install-from-github-release.sh
         └─ no  → git clone at the release tag, then:
                  ├─ repo ships built assets → copy the plugin root; if it also
                  │  needs vendor/, run build-vendor.py
                  └─ repo ships only src/ assets → stop. Not buildable here.
```

`sources.tsv` records which branch of that tree each installed plugin took, so
the current tree can be rebuilt from scratch.

## Scripts

### `install-from-wporg.sh`

The canonical path, for when the allowlist permits WordPress.org.

```sh
./install-from-wporg.sh contact-form-7 woocommerce wordpress-seo
./install-from-wporg.sh -f slugs.txt
```

Downloads `<slug>.latest-stable.zip`, verifies the archive, extracts into
`wp-content/plugins/`, and normalises the extracted directory name to the slug.
When the host is blocked it says so explicitly rather than reporting a bare 403,
because that distinction is the difference between "wrong slug" and "ask an
admin to change the environment".

### `install-from-github-release.sh`

The fallback used for 28 of the 43 plugins. Many projects attach the same built
artifact they ship to the plugin directory to their GitHub release.

```sh
./install-from-github-release.sh woocommerce/woocommerce woocommerce
./install-from-github-release.sh -f repos.tsv     # "<owner/repo><TAB><slug>"
```

The release's asset list cannot be read (the GitHub API is scoped to this
session's own repositories), so the asset name is guessed from the patterns
projects actually use — `<slug>.zip`, `<slug>-<tag>.zip`, `<slug>.<tag>.zip`,
`<slug>-v<tag>.zip`, `<repo>.zip`, `<repo>-<tag>.zip` — each probed with a
one-byte range request, under both `<tag>` and `v<tag>`. The latest release tag
is resolved with `git ls-remote`, so that step needs no API access either. A
project that publishes no asset fails cleanly and says so.

### `build-vendor.py`

Builds a plugin's `vendor/` offline when upstream does not commit it.

```sh
./build-vendor.py wp-content/plugins/really-simple-ssl/lets-encrypt
```

Two cases, detected automatically:

- **No real dependencies** (only `php` / `ext-*` constraints): `vendor/` is
  nothing but a generated autoloader, so it runs `composer dump-autoload
  --no-dev --classmap-authoritative`. Fully offline.
- **Real dependencies**: reads each locked package's repository URL and version
  out of `composer.lock`, clones them from GitHub, and installs them as
  Composer *path* repositories with `"packagist.org": false`.

Reading the URL from the lock file rather than guessing it from the package name
is the part that matters: Really Simple SSL requires `fbett/le_acme2`, which
lives at `github.com/fbett/le-acme2-php`. Only the lock file knows that.
`composer.lock` also lists the fully resolved graph, so transitive dependencies
come along.

The plugin's own `composer.json` and `composer.lock` are restored when the
script finishes, so the only thing that differs from upstream is the generated
`vendor/`. `--ignore-platform-req=php` is passed because dependencies routinely
pin an older PHP than the local CLI, and the constraint that actually matters is
the one on the server running WordPress.

### `verify-plugins.py`

Checks that every directory in `wp-content/plugins/` is genuinely usable, which
matters far more when installing from source trees than from built zips.

```sh
./verify-plugins.py            # exits non-zero if any plugin is broken
./verify-plugins.py --quiet    # failures only
```

- **header** — a file *directly inside* the plugin directory carries a
  `Plugin Name:` header. WordPress only scans that top level, so a header one
  directory deeper makes the plugin invisible.
- **syntax** — that file passes `php -l`.
- **vendor** — no production PHP requires a `vendor/autoload.php` that is
  absent. The requirement counts as satisfied if the requiring file's own
  directory or any directory above it has one, since plugins do keep `vendor/`
  in a subdirectory.
- **assets** — every `.js`/`.css` path written as a literal in the plugin's PHP
  resolves to a file that exists.

The assets check reports a percentage instead of pass/fail, because references
to WordPress core handles (`wp-admin/js/iris.min.js`), premium add-ons and
third-party URLs legitimately do not resolve. Read the misses before believing
them: a plugin missing its own `build/*.js` is broken, a plugin "missing"
`wp-includes/js/jquery/jquery.js` is fine. This check is what caught Polylang,
whose `js/` and `css/` contain only `src/`.

## Sources that were evaluated and rejected

- **`wp-plugins`, `WPPlugins`, `common-repository`, `WP-a2z`, `git-mirror`** —
  third-party mirrors of the WordPress.org SVN tree. All stale: `wp-plugins`
  stopped syncing in 2016, `WPPlugins` in 2017, `common-repository` in late 2024
  (it carries Wordfence 7.11.7 and Akismet 5.3.3). Shipping a two-year-old
  security plugin is worse than shipping none.
- **jsDelivr's WordPress CDN** (`cdn.jsdelivr.net/wp/...`), which mirrors plugin
  files and would have solved this neatly — not in the allowlist.

`Automattic/vip-go-mu-plugins-built` was evaluated and **accepted**: it is
Automattic's continuously generated built tree for WordPress VIP, it was current
when used, and its Jetpack copy ships `vendor/` and `_inc/build`. Akismet and
Jetpack come from there via a sparse checkout:

```sh
git clone --depth 1 --filter=blob:none --sparse \
    https://github.com/Automattic/vip-go-mu-plugins-built.git
cd vip-go-mu-plugins-built && git sparse-checkout set akismet jetpack
```

## Unblocking the rest

Site Kit by Google, Polylang, Wordfence, UpdraftPlus, WPForms Lite, WP Smush,
Health Check, Simple History and Antispam Bee are not installed — either they
need a JavaScript build, or they have no maintained public repository. Both
groups are solved the same way: add `downloads.wordpress.org` and
`api.wordpress.org` to the environment's egress allowlist (Claude Code on the
web → environment settings → network access,
<https://code.claude.com/docs/en/claude-code-on-the-web>), then

```sh
./install-from-wporg.sh site-kit-wp polylang wordfence updraftplus \
                        wpforms-lite wp-smushit health-check \
                        simple-history antispam-bee
./verify-plugins.py
```

Allowing `registry.npmjs.org` instead would make the JavaScript builds possible,
but it is the longer road: the plugin directory serves the same artifacts
already built.
