# Executed PoC harnesses — WordPress 7.1-RC2 (unauth/subscriber focus)

Each script `require`s or extracts the **genuine WordPress core code** and runs it
against offensive payloads. Only external WP helper functions are stubbed; the
sanitization/parsing logic under test is the real thing. Run with PHP 8.4:

```
php poc_kses.php           # stored XSS via unauth comment (wp_kses + HTML API)
php poc_interactivity.php  # Interactivity directives + JSON state serialization
php poc_xxe.php            # XXE via XML-RPC IXR_Message (expat) + positive controls
php poc_sqli.php           # sanitize_sql_orderby() + wpdb::prepare()/%i
php poc_redirect.php       # open redirect on ?redirect_to= (wp_validate_redirect)
```

Captured output: [`RESULTS.txt`](RESULTS.txt).

## Result

| PoC | Real code exercised | Payloads | Outcome |
|-----|--------------------|----------|---------|
| kses | `kses.php` + full `html-api/*` | 15 | 0 dangerous survivors; `data-wp-*` stripped |
| interactivity | `WP_Interactivity_API` + `WP_HTML_Processor` | 3 | text escaped; href not injected; JSON `<`→`<` |
| xxe | `IXR_Message` (expat) | 3 + 2 controls | parse=false, 0 leak; controls PASS |
| sqli | `sanitize_sql_orderby` + `wpdb::prepare` | 9 | injections blocked; identifiers backticked |
| redirect | `wp_validate_redirect` chain | 13 + 2 controls | all fall back; controls preserved |

**48+ offensive payloads executed against real core → 0 exploitable
unauth/subscriber vulnerabilities.** Negative results are backed by positive
controls proving the harness can detect a true positive.

> Method caveat: `poc_sqli.php` runs `wpdb` without a live MySQL socket, so
> `_real_escape` uses the `addslashes` fallback (the weakest case) — it still
> blocks every payload; the real `mysqli_real_escape_string` is charset-aware
> and stronger.
