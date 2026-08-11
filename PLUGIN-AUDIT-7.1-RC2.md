# Analisa Ulang — 23 Plugin Populer (fokus unauth / subscriber)

Pivot dari core (yang sudah mengeras) ke plugin pihak ketiga — tempat mayoritas
kerentanan WordPress dunia-nyata berada. Semua di-clone dari GitHub (versi
TERBARU/HEAD, shallow), dipasang, lalu dipindai + triase reachability.

## Cakupan (23 plugin)
TablePress, amp-wp, bbPress, BuddyPress, classic-editor, co-authors-plus,
contact-form-7, easy-digital-downloads, elementor, gutenberg, health-check,
jetpack (+vaultpress), pods, query-monitor, redirection, two-factor,
w3-total-cache, woocommerce, wordpress-importer, wordpress-seo (Yoast),
wp-cli, wp-graphql, wp-super-cache.

## Metode
1. Enumerasi entry unauth: `wp_ajax_nopriv_*` (EDD 39, jetpack 10, pods 4, dll),
   `admin_post_nopriv_*` (nihil), REST `permission_callback => __return_true`.
2. Taint scanner multi-baris (ptaint.py): superglobal -> var -> sink
   (SQL/unserialize/file/echo/option/exec/meta), lapor bila tak ada sanitasi.
   Hasil: 35 kandidat di 8 plugin.
3. Triase REACHABILITY tiap kandidat (unauth/subscriber vs admin-gated vs
   not-loaded), baca kode sumber.

## Triase kandidat berisiko-tinggi (semua ter-eliminasi utk unauth)

| Plugin | Sink terdeteksi | Vonis reachability |
|--------|-----------------|--------------------|
| jetpack/vaultpress | `eval($_POST['code'])`, `unserialize`, `update/delete_option` | **Auth-gated**: tiap aksi lewat `validate_api_signature()` — `openssl_verify(public_key)` atau HMAC `sign_string`+`hash_equals` thd `secret` registrasi. Tanpa secret → `die()`. BUKAN unauth (agen remote-management by-design). |
| health-check | `file_get_contents($filepath.$_POST['file'])` (LFI/traversal) | **Not unauth**: `wp_ajax_` (login) + `check_ajax_referer` + cap `view_site_health_checks` + `validate_file()` memblok `../`. |
| w3-total-cache | `exec('sudo ... '.$_REQUEST['path'])`, SQLi mentah, echo | **Not loaded**: file di `qa/` (fixture CI, `require __DIR__.'/wp-load.php'` yg tak ada di sana; "Template Name"). Tak dimuat plugin, dikecualikan dari zip wordpress.org. Hanya risiko bila deploy git mentah ke webroot (anti-pattern deployment). |
| easy-digital-downloads | `call_user_func('edd_upgrade_render_'.$_GET)`; `echo $desc`; `update_post_meta` | **Admin**: halaman upgrade admin + prefix terbatas + cap `manage_shop_settings`; add-adjustment = `wp_ajax_` (bukan nopriv); metabox = simpan post (admin). |
| easy-digital-downloads | `edd_download_search` (nopriv) status leak | **Patched**: `get_status()` -> unauth hanya `publish` (draft/private butuh `edit_products`). `s` di-`sanitize_text_field`, WP_Query (no SQLi). |
| pods | `process_form` (satu-satunya nopriv tanpa login-check) | **Nonce-bound**: action = `pods_form_{pod}_{uid}_{id}_{uri}_{field_hash}`, `wp_verify_nonce`. `$data` HANYA dari field yang terikat nonce; `$id` terikat nonce (no IDOR); `post_content` di-`strip_shortcodes`+`excerpt_remove_blocks` utk non-`edit_posts`. Guarded. |
| TablePress / pods Migrate / wordpress-importer | `copy($_GET)` / upload / `wp_create_user($_POST)` | **Admin**: aksi admin (nonce+cap / import cap). |

## Sinks langsung (1-baris) superglobal→SQL/file/unserialize/echo
Nihil di 23 plugin (versi terbaru memakai `$wpdb->prepare`, `esc_*`, `absint`,
`sanitize_*`). Kerentanan—jika ada—hanya mungkin di alur multi-langkah, dan
seluruh kandidat multi-langkah ter-triase gated.

## Kesimpulan
Pada **versi terbaru** dari 23 plugin populer ini, seluruh sink unauth/
subscriber-reachable yang ditemukan scanner **ter-gate** (secret API,
capability, nonce, atau validasi path) atau berupa **fixture uji yang tidak
dimuat**. Tidak ditemukan kerentanan unauth/subscriber yang exploitable di
rilis saat ini. (Catatan jujur: ini HEAD terbaru — CVE lama sudah dipatch;
menemukan 0-day hidup di rilis mutakhir plugin papan-atas memang sulit, dan
tidak ada temuan dikarang.)

Artefak: `/workspace/plugins/*` (clone), scanner `ptaint.py`.
