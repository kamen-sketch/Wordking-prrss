# Installed plugins

43 popular WordPress plugins installed under `wp-content/plugins/`.

All of them are official upstream code. Because this environment can only reach
GitHub (see *Sourcing constraints* below), each plugin came from one of four
places:

1. the built release zip attached to the project's GitHub release (28 plugins);
2. the repository tree at the latest release tag, for plugins that publish no
   release asset but are deployable as-is (12 plugins);
3. [`Automattic/vip-go-mu-plugins-built`](https://github.com/Automattic/vip-go-mu-plugins-built),
   Automattic's continuously generated *built* tree used on WordPress VIP, for
   Akismet and Jetpack (2 plugins);
4. the repository tree plus a `vendor/` directory built offline with Composer,
   for Really Simple SSL (1 plugin).

Plugins are installed, not activated — activate what you need from
**Dashboard → Plugins**. The SEO plugins (Yoast SEO, Rank Math, All in One SEO)
and the caching plugins (W3 Total Cache, WP Super Cache, LiteSpeed Cache)
overlap with each other; activate only one of each group. Jetpack and Akismet
both need a WordPress.com connection / API key to do anything.

| # | Directory | Plugin | Version | Source |
|---:|---|---|---|---|
| 1 | `advanced-custom-fields` | Advanced Custom Fields | 6.8.7 | [AdvancedCustomFields/acf](https://github.com/AdvancedCustomFields/acf) · release `6.8.7` (built zip) |
| 2 | `akismet` | Akismet Anti-spam: Spam Protection | 5.6 | [Automattic/vip-go-mu-plugins-built](https://github.com/Automattic/vip-go-mu-plugins-built) · built tree @ 2026-08-04 |
| 3 | `all-in-one-seo-pack` | All in One SEO | 4.9.10 | [awesomemotive/all-in-one-seo-pack](https://github.com/awesomemotive/all-in-one-seo-pack) · `4.9.10` (repo source) |
| 4 | `autoptimize` | Autoptimize | 2.8.3 | [futtta/autoptimize](https://github.com/futtta/autoptimize) · `2.8.3` (repo source) |
| 5 | `classic-editor` | Classic Editor | 1.7.0 | [WordPress/classic-editor](https://github.com/WordPress/classic-editor) · `default branch` (repo source) |
| 6 | `classic-widgets` | Classic Widgets | 0.3 | [WordPress/classic-widgets](https://github.com/WordPress/classic-widgets) · `default branch` (repo source) |
| 7 | `classifai` | ClassifAI | 3.9.0 | [10up/classifai](https://github.com/10up/classifai) · release `3.9.0` (built zip) |
| 8 | `co-authors-plus` | Co-Authors Plus | 4.1.1 | [Automattic/co-authors-plus](https://github.com/Automattic/co-authors-plus) · release `4.1.1` (built zip) |
| 9 | `contact-form-7` | Contact Form 7 | 6.0.3 | [takayukister/contact-form-7](https://github.com/takayukister/contact-form-7) · `default branch` (repo source) |
| 10 | `distributor` | Distributor | 2.2.0 | [10up/distributor](https://github.com/10up/distributor) · release `2.2.0` (built zip) |
| 11 | `duplicate-post` | Yoast Duplicate Post | 4.7 | [Yoast/duplicate-post](https://github.com/Yoast/duplicate-post) · release `4.7` (built zip) |
| 12 | `easy-digital-downloads` | Easy Digital Downloads | 3.6.9 | [EasyDigitalDownloads/easy-digital-downloads](https://github.com/EasyDigitalDownloads/easy-digital-downloads) · release `3.6.9` (built zip) |
| 13 | `elementor` | Elementor | 4.2.2 | [elementor/elementor](https://github.com/elementor/elementor) · release `4.2.2` (built zip) |
| 14 | `give` | Give - Donation Plugin | 4.16.6 | [impress-org/givewp](https://github.com/impress-org/givewp) · release `4.16.6` (built zip) |
| 15 | `gutenberg` | Gutenberg | 23.7.1 | [WordPress/gutenberg](https://github.com/WordPress/gutenberg) · release `v23.7.1` (built zip) |
| 16 | `jetpack` | Jetpack | 16.0.1 | [Automattic/vip-go-mu-plugins-built](https://github.com/Automattic/vip-go-mu-plugins-built) · built tree @ 2026-08-04 |
| 17 | `koko-analytics` | Koko Analytics | 2.5.2 | [ibericode/koko-analytics](https://github.com/ibericode/koko-analytics) · release `2.5.2` (built zip) |
| 18 | `litespeed-cache` | LiteSpeed Cache | 7.9 | [litespeedtech/lscache_wp](https://github.com/litespeedtech/lscache_wp) · `7.9` (repo source) |
| 19 | `mailchimp-for-wp` | MC4WP: Mailchimp for WordPress | 4.14.0 | [ibericode/mailchimp-for-wordpress](https://github.com/ibericode/mailchimp-for-wordpress) · release `4.14.0` (built zip) |
| 20 | `performance-lab` | Performance Lab | 3.9.0 | [WordPress/performance](https://github.com/WordPress/performance) · release `3.9.0` (built zip) |
| 21 | `plugin-check` | Plugin Check (PCP) | 2.0.0 | [WordPress/plugin-check](https://github.com/WordPress/plugin-check) · release `2.0.0` (built zip) |
| 22 | `query-monitor` | Query Monitor | 4.0.7 | [johnbillion/query-monitor](https://github.com/johnbillion/query-monitor) · `4.0.7` (repo source) |
| 23 | `really-simple-ssl` | Really Simple Security | 9.5.7 | [rlankhorst/really-simple-ssl](https://github.com/rlankhorst/really-simple-ssl) · `9.5.7` + vendor built offline |
| 24 | `redirection` | Redirection | 5.9.0 | [johngodley/redirection](https://github.com/johngodley/redirection) · release `5.9.0` (built zip) |
| 25 | `regenerate-thumbnails` | Regenerate Thumbnails | 3.1.6 | [Viper007Bond/regenerate-thumbnails](https://github.com/Viper007Bond/regenerate-thumbnails) · release `v3.1.6` (built zip) |
| 26 | `relevanssi` | Relevanssi | 4.28.1 | [msaari/relevanssi](https://github.com/msaari/relevanssi) · `4.28.1` (repo source) |
| 27 | `safe-svg` | Safe SVG | 2.4.0 | [10up/safe-svg](https://github.com/10up/safe-svg) · release `2.4.0` (built zip) |
| 28 | `seo-by-rank-math` | Rank Math SEO with AI Best SEO Tools | 1.0.218 | [rankmath/seo-by-rank-math](https://github.com/rankmath/seo-by-rank-math) · `1.0.218` (repo source) |
| 29 | `stream` | Stream - Activity Log & Audit Trail | 4.3.0 | [xwp/stream](https://github.com/xwp/stream) · release `v4.3.0` (built zip) |
| 30 | `sucuri-scanner` | Sucuri Security - Auditing, Malware Scanner and Hardening | 2.7.4 | [Sucuri/sucuri-wordpress-plugin](https://github.com/Sucuri/sucuri-wordpress-plugin) · release `2.7.4` (built zip) |
| 31 | `tablepress` | TablePress | 3.3.3 | [TobiasBg/TablePress](https://github.com/TobiasBg/TablePress) · release `3.3.3` (built zip) |
| 32 | `two-factor` | Two Factor | 0.16.0 | [WordPress/two-factor](https://github.com/WordPress/two-factor) · release `0.16.0` (built zip) |
| 33 | `user-registration` | User Registration & Membership | 5.2.6 | [wpeverest/user-registration](https://github.com/wpeverest/user-registration) · release `5.2.6` (built zip) |
| 34 | `user-switching` | User Switching | 1.12.1 | [johnbillion/user-switching](https://github.com/johnbillion/user-switching) · `1.12.1` (repo source) |
| 35 | `w3-total-cache` | W3 Total Cache | 2.10.5 | [BoldGrid/W3-Total-Cache](https://github.com/BoldGrid/W3-Total-Cache) · release `2.10.5` (built zip) |
| 36 | `woocommerce` | WooCommerce | 11.0.1 | [woocommerce/woocommerce](https://github.com/woocommerce/woocommerce) · release `11.0.1` (built zip) |
| 37 | `woocommerce-gateway-stripe` | WooCommerce Stripe Gateway | 10.8.5 | [woocommerce/woocommerce-gateway-stripe](https://github.com/woocommerce/woocommerce-gateway-stripe) · release `10.8.5` (built zip) |
| 38 | `wordpress-seo` | Yoast SEO | 28.2 | [Yoast/wordpress-seo](https://github.com/Yoast/wordpress-seo) · release `28.2` (built zip) |
| 39 | `wp-crontrol` | WP Crontrol | 1.21.1 | [johnbillion/wp-crontrol](https://github.com/johnbillion/wp-crontrol) · `1.21.1` (repo source) |
| 40 | `wp-graphql` | WPGraphQL | 2.6.0 | [wp-graphql/wp-graphql](https://github.com/wp-graphql/wp-graphql) · release `v2.6.0` (built zip) |
| 41 | `wp-mail-smtp` | WP Mail SMTP | 4.9.0 | [awesomemotive/WP-Mail-SMTP](https://github.com/awesomemotive/WP-Mail-SMTP) · release `4.9.0` (built zip) |
| 42 | `wp-statistics` | WP Statistics | 14.16.10 | [wp-statistics/wp-statistics](https://github.com/wp-statistics/wp-statistics) · `14.16.10` (repo source) |
| 43 | `wp-super-cache` | WP Super Cache | 3.1.1 | [Automattic/wp-super-cache](https://github.com/Automattic/wp-super-cache) · release `v3.1.1` (built zip) |

## Sourcing constraints

The environment these plugins were installed from enforces an outbound egress
allowlist. Blocked hosts answer with
`Host not in allowlist: <host>. Add this host to your network egress settings to
allow access.`

Reachable: `github.com` (git + release asset downloads), `api.github.com`,
`objects.githubusercontent.com`.

Blocked: `downloads.wordpress.org`, `api.wordpress.org`,
`plugins.svn.wordpress.org`, `registry.npmjs.org`, `repo.packagist.org`,
`raw.githubusercontent.com`, `codeload.github.com`.

Two consequences:

- The canonical plugin-directory zips could not be used as the source.
- **No JavaScript build is possible.** npm, yarn and pnpm are installed, but the
  npm registry is not reachable and no `node_modules` is vendored, so any plugin
  whose repository ships only `src/` assets (webpack / `@wordpress/scripts`)
  cannot be built here.

PHP dependencies are a different story: Composer works fully offline, which is
how the plugins in categories 2 and 4 above were produced.

### Building a plugin's `vendor/` without Packagist

Packagist is unreachable, but most WordPress plugins' PHP dependencies live on
GitHub, which is reachable. Two recipes cover almost every case.

**A. Plugin with no real Composer dependencies** — its `vendor/` is nothing but
a generated autoloader, so generate it locally:

```sh
composer dump-autoload --no-dev --classmap-authoritative --no-scripts
```

**B. Plugin with real dependencies** — read the exact repository URL and version
of each dependency out of the plugin's `composer.lock` (the `source.url` field;
it is often a different name than the Composer package name — Really Simple SSL
requires `fbett/le_acme2`, which lives at `github.com/fbett/le-acme2-php`),
clone each one at its locked tag, then point Composer at the clones as *path*
repositories and disable Packagist:

```sh
git clone --depth 1 --branch 1.5.6 https://github.com/fbett/le-acme2-php.git /tmp/deps/le-acme2
git clone --depth 1 --branch v1.0.7 https://github.com/plesk/api-php-lib.git  /tmp/deps/plesk

composer config repositories.packagist false
composer config repositories.le     path /tmp/deps/le-acme2
composer config repositories.plesk  path /tmp/deps/plesk
composer install --no-dev --no-scripts --optimize-autoloader --ignore-platform-req=php
```

`--ignore-platform-req=php` is needed when a dependency pins an older PHP than
the local CLI. Restore the plugin's original `composer.json` / `composer.lock`
afterwards so the shipped files stay identical to upstream; only the generated
`vendor/` is kept.

## Not installed, and why

| Plugin | Blocker |
|---|---|
| Site Kit by Google | Repo needs a full `npm` + `@wordpress/scripts` build; npm registry unreachable. |
| Polylang | `bin/build.sh` runs `npm update && npm run build`; `js/` and `css/` ship only `src/`. |
| Wordfence, UpdraftPlus, WPForms Lite, WP Smush | No maintained public GitHub repository. Only third-party WordPress.org mirrors exist, and they are stale — [`wp-plugins`](https://github.com/wp-plugins) stopped syncing in 2016, [`common-repository`](https://github.com/common-repository) in late 2024 (it carries Wordfence 7.11.7, Akismet 5.3.3). Shipping a two-year-old security plugin is worse than shipping none. |
| Health Check, Simple History, Antispam Bee, Safe SVG (source), Simple Page Ordering | Repository ships only unbuilt `src/` assets. |

### How to unblock the rest

Add `downloads.wordpress.org` and `api.wordpress.org` to the environment's
network egress allowlist (Claude Code on the web → environment settings →
network access; see <https://code.claude.com/docs/en/claude-code-on-the-web>).
With those two hosts reachable, every plugin above can be installed from its
canonical, already-built plugin-directory zip:

```sh
curl -fsSL -o /tmp/p.zip https://downloads.wordpress.org/plugin/<slug>.latest-stable.zip
unzip -q -o /tmp/p.zip -d wp-content/plugins/
```

Adding `registry.npmjs.org` instead would allow building the JS-only cases from
source, but the plugin-directory zips are the shorter and more faithful path.
