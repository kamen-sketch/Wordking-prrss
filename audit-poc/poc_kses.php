<?php
// PoC: run REAL WordPress wp_kses() against unauth-comment payloads.
// Only external WP funcs are stubbed; all kses parsing logic is genuine core code.
error_reporting(E_ALL & ~E_DEPRECATED);
define('ABSPATH', '/home/user/Wordking-prrss/');
define('CUSTOM_TAGS', false);
function apply_filters($tag, $value){ return $value; }
function __($s,$d=null){ return $s; }
function esc_attr($s){ return htmlspecialchars($s, ENT_QUOTES); }
function current_filter(){ return ''; }
function add_filter(){ return true; }
function remove_filter(){ return true; }
function _deprecated_argument($f,$v,$m=''){}
function _deprecated_function($f,$v,$r=''){}
function _doing_it_wrong($f,$m,$v){}
function wp_allowed_protocols(){ return array('http','https','ftp','ftps','mailto','news','irc','irc6','ircs','gopher','nntp','feed','telnet','mms','rtsp','sms','svn','tel','fax','xmpp','webcal','urn'); }
function wp_parse_str($s,&$a){ parse_str($s,$a); }

// Real HTML API (used by kses for attribute parsing incl. data-*)
foreach ([
  'class-wp-token-map.php',
  'html-api/html5-named-character-references.php',
  'html-api/class-wp-html-span.php',
  'html-api/class-wp-html-text-replacement.php',
  'html-api/class-wp-html-decoder.php',
  'html-api/class-wp-html-attribute-token.php',
  'html-api/class-wp-html-tag-processor.php',
] as $f) { require ABSPATH.'wp-includes/'.$f; }

require ABSPATH.'wp-includes/kses.php';
global $allowedtags;   // the REAL restrictive unauth-comment allowlist

// wp_filter_kses (used on pre_comment_content) = wp_kses($data, $allowedtags).
function comment_sanitize($s){ global $allowedtags; return wp_kses($s, $allowedtags); }

$payloads = [
  'script'            => '<script>alert(1)</script>',
  'img onerror'       => '<img src=x onerror=alert(1)>',
  'svg onload'        => '<svg/onload=alert(1)>',
  'a javascript:'     => '<a href="javascript:alert(1)">x</a>',
  'a data: html'      => '<a href="data:text/html,<script>alert(1)</script>">x</a>',
  'data-wp-interactive'=> '<b data-wp-interactive="core" data-wp-context=\'{"x":1}\'>hi</b>',
  'data-wp-on click'  => '<a href="#" data-wp-on--click="actions.pwn">x</a>',
  'style expression'  => '<b style="width:expression(alert(1))">x</b>',
  'iframe srcdoc'     => '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
  'onmouseover attr'  => '<b onmouseover="alert(1)">x</b>',
  'nested obfusc'     => '<scr<script>ipt>alert(1)</scr</script>ipt>',
  'a href protocol-rel'=> '<a href="//evil.com">x</a>',
  'malformed attr'    => '<a href="j&#97;vascript:alert(1)">x</a>',
  'form/input'        => '<form action=//evil><input name=x></form>',
  'details/summary'   => '<details open ontoggle=alert(1)>x</details>',
];

$fail = 0;
foreach ($payloads as $name => $p) {
    $out = comment_sanitize($p);
    // "dangerous" = surviving executable vectors
    $bad = preg_match('/<script|onerror|onload|onclick|onmouseover|ontoggle|javascript:|expression\(|srcdoc|data-wp-|<iframe|<svg|<form|<input/i', $out);
    printf("[%s] %-14s\n   in : %s\n   out: %s\n", $bad ? 'VULN' : ' ok ', $name, $p, $out);
    if ($bad) $fail++;
}
echo "\n=== ".($fail? "$fail DANGEROUS SURVIVORS (investigate!)" : "0 dangerous survivors — kses neutralized all")." ===\n";
