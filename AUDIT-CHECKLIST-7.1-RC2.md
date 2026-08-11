# Checklist Audit Keamanan — WordPress 7.1-RC2 (unauth / subscriber focus)

Fokus: hanya yang **reachable dari unauthenticated atau subscriber**.
Metode: baca file (bukan ingatan) → root cause → PoC → jalankan → verifikasi →
eliminasi false positive. Setiap baris mencatat status + file/bukti.

Legenda status: ✅ selesai-aman · 🔴 temuan (by-design/nyata) · 🔎 sedang dicek · ⬜ belum

## OWASP Top 10 (2021) × WordPress core surface

| # | Kategori | Vektor unauth/subscriber | Status | Bukti / file |
|---|----------|--------------------------|--------|--------------|
| A01 | Broken Access Control | IDOR lintas objek (subscriber) | ✅ | [F] 8/8 ditolak + kontrol positif |
| A01 | | Privilege escalation (role/meta) | ✅ | [F] rest_cannot_edit_roles |
| A01 | | Abilities API RUN izin | ✅ | [G2] live: unauth 401 / sub 403 / pivot gagal |
| A01 | | REST route publik perms | ✅ | [F] batch/oembed/types/search |
| A02 | Cryptographic Failures | nonce/hash_equals timing | ✅ | [H] wp_verify_nonce→hash_equals |
| A02 | | password hashing (bcrypt) | ✅ | [H] password_verify + hash_equals |
| A02 | | REST cookie-auth nonce | ✅ | [H] wp_verify_nonce('wp_rest') |
| A03 | Injection — SQLi | REST orderby/meta_query/search | ✅ | [H] live fuzz: enum-400 / quote-escaped |
| A03 | | xmlrpc / prepare() manual | ✅ | [A][C] prepare %d/%s |
| A03 | Injection — XSS reflektif | param GET/POST di-render | ✅ | xss_fuzz.py bersih |
| A03 | Injection — XSS stored | komentar/profil/blok | ✅ | [G1] input dinetralkan; block kses |
| A03 | Injection — Header/CRLF | redirect/mail header | ✅ | [H] wp_sanitize_redirect strip |
| A03 | Injection — XXE | xmlrpc / oEmbed / feed parse | ✅ | [H] blocked + kontrol positif |
| A04 | Insecure Design | race condition (username/TOCTOU) | ✅ | [C] by-design |
| A05 | Security Misconfiguration | debug/dir-listing/default | ✅ | [H] WP_DEBUG=false; dir=server config |
| A06 | Vulnerable Components | SimplePie/PHPMailer/Requests versi | ✅ | [H] versi terkini, tak ada CVE dikenal |
| A07 | Ident & Auth Failures | username enumeration | 🔴 | [E][F2] by-design |
| A07 | | brute-force rate limit | 🔴 | [F1] xmlrpc multicall amplif. |
| A08 | Software/Data Integrity | object injection (unserialize) | ✅ | [G3] HMAC+admin |
| A08 | | POP gadget chain | ✅ | prior: __wakeup neutralized |
| A10 | SSRF | pingback / HTTP validate | 🔴 | [D][F3] external-only by-design |

## Log file yang sudah dibaca (ronde ini akan menambah)
- lihat bagian [A]–[G] SECURITY-AUDIT-7.1-RC2.txt untuk file yang sudah ditelaah.

## Gap yang dikerjakan ronde ini (checklist aktif)
1. A03 SQLi via parameter REST publik (orderby, meta, search, include) — live PoC
2. A03 XXE via xmlrpc & oEmbed & feed (libxml entity loader) — live PoC
3. A03 CRLF/header injection (redirect_to, mail) — analisis + PoC
4. A02 nonce/hash_equals & cookie-auth nonce — analisis
5. A06 versi komponen pihak ketiga vs CVE publik — cek versi dari file
6. A05 misconfig default (debug, autoload, dir listing) — cek
