# wp-lab — Menjalankan WordPress 7.1-RC2 LIVE tanpa Docker & tanpa MySQL

Lab untuk audit **dinamis/runtime**: menjalankan source WordPress di repo ini
sebagai situs hidup, lalu memasang plugin populer di atasnya. Pelengkap audit
statis di `PLUGIN-AUDIT-7.1-RC2.md` / `SECURITY-AUDIT-7.1-RC2.txt`.

## Kenapa bukan Docker?

Di server/jaringan terbatas, **registry container sering diblokir** (docker.io,
ghcr.io, quay.io → `403`), sehingga `docker compose` tak bisa menarik image.
Cara ini tak butuh Docker, tak butuh MySQL server, tak butuh service apa pun —
hanya **PHP 8.x (`pdo_sqlite`) + git**:

- **Database**: drop-in resmi WordPress [`sqlite-database-integration`](https://github.com/WordPress/sqlite-database-integration)
  (tag `v2.1.10`, flat & self-contained) → WordPress jalan di atas **SQLite**,
  satu file `wp-content/database/wp.sqlite`.
- **Web server**: **PHP built-in server** (`php -S`) + router kecil untuk asset.
- **Instalasi**: di-POST langsung ke `wp-admin/install.php` via `curl` localhost
  (tanpa wp-cli).

Referensi metode: WordPress Performance Team (SQLite drop-in), serta panduan
"portable WordPress with SQLite" (mfyz.com, dev.to).

## Pakai

```bash
# 1) Nyalakan WordPress live (SQLite + php -S)
bash wp-lab/setup.sh
#    -> http://127.0.0.1:8080   admin/admin

# 2a) Pasang 40 plugin (jaringan normal, ada akses wordpress.org + wp-cli)
bash wp-lab/install-plugins.sh

# 2b) Jaringan terbatas (wordpress.org DIBLOKIR): pasang subset via GitHub
bash wp-lab/install-plugins.sh --github

# Stop
bash wp-lab/stop.sh
```

Override: `WP_PORT`, `WP_ADMIN_USER`, `WP_ADMIN_PASSWORD`, `SQLITE_TAG`.

## Dua mode pemasangan plugin

| Mode | Sumber | Cakupan | Butuh |
|------|--------|---------|-------|
| **wp-cli** (default) | wordpress.org (ZIP rilis resmi) | ke-40 plugin di `plugins.txt` | wp-cli + akses wordpress.org |
| **`--github`** | git-clone repo GitHub | subset yang jalan tanpa build | git + akses github.com |

Mode `--github` ada karena banyak jaringan terbatas memblokir
`downloads.wordpress.org`. Ia hanya meng-clone plugin yang **runnable langsung
dari HEAD** (tanpa `npm`/`composer` build). Plugin besar yang perlu build atau
hanya terdistribusi via ZIP wordpress.org (WooCommerce, Elementor, Jetpack,
Yoast, Wordfence, dsb.) **dilewati** di mode ini — pasang lewat mode wp-cli di
mesin yang punya akses wordpress.org.

## Hasil uji di lab ini (WordPress 7.1-RC2, PHP 8.4, SQLite)

- WordPress terinstall & hidup: front-end `200`, `wp-admin` `200`, 0 fatal.
- Mode `--github`: **13/13 plugin aktif tanpa fatal** —
  antispam-bee, autoptimize, classic-editor, classic-widgets, contact-form-7,
  health-check, query-monitor, simple-history, two-factor, w3-total-cache,
  wordpress-importer, wordpress-popular-posts, wp-super-cache.

## Catatan keamanan / kebersihan

- Semua artefak runtime (`wp-config.php`, `wp-content/db.php`,
  `wp-content/database/`, plugin hasil clone) **di-`.gitignore`** — source audit
  tetap bersih; semuanya dibuat ulang oleh script.
- Kredensial default `admin/admin` & `blog_public=0` hanya untuk lab lokal.
  Jangan expose ke jaringan publik.
- `wp-content/db.php` adalah drop-in tepercaya dari WordPress Performance Team;
  di-copy dari `db.copy` plugin, bukan file pihak-ketiga acak.
