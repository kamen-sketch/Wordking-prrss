<?php
// PoC: open-redirect guard on the unauth ?redirect_to= param (wp-login.php).
// Uses the REAL wp_validate_redirect + wp_sanitize_redirect + _deep_replace.
error_reporting(E_ALL & ~E_DEPRECATED);
define('ABSPATH', '/home/user/Wordking-prrss/');
$_SERVER['REQUEST_URI'] = '/wp-login.php';
function apply_filters($t,$v){ return $v; }                 // allowed_redirect_hosts unmodified
function home_url($p=''){ return 'http://victim.example'.$p; } // the only allowed host
function wp_normalize_path($p){ return str_replace('\\','/',$p); }
function esc_html($s){ return htmlspecialchars($s,ENT_QUOTES); }
function __($s,$d=null){ return $s; }

// Extract the genuine functions byte-for-byte.
$plug = file_get_contents(ABSPATH.'wp-includes/pluggable.php');
$fmt  = file_get_contents(ABSPATH.'wp-includes/formatting.php');
$kses = file_get_contents(ABSPATH.'wp-includes/kses.php');
foreach ([
  ['/function wp_kses_no_null\(.*?\n\}/s', $kses],
  ['/function _wp_sanitize_utf8_in_redirect\(.*?\n\t\}/s', $plug],
  ['/function wp_sanitize_redirect\(.*?\n\t\}/s', $plug],
  ['/function wp_validate_redirect\(.*?\n\t\}/s', $plug],
  ['/function _deep_replace\(.*?\n\}/s', $fmt],
] as [$re,$src]) {
  if (!preg_match($re,$src,$m)) die("extract failed: $re\n");
  eval($m[0]);
}

$FALLBACK = '/wp-admin/';
$vectors = [
  'plain external'     => 'http://evil.com',
  'protocol-relative'  => '//evil.com',
  'backslash trick'    => '/\\/evil.com',
  'triple slash'       => '///evil.com',
  'whitespace prefix'  => "  //evil.com",
  'at-sign userinfo'   => 'http://victim.example@evil.com',
  'js scheme'          => 'javascript:alert(1)',
  'data scheme'        => 'data:text/html,<script>alert(1)</script>',
  'CRLF header inject' => "http://victim.example/%0d%0aSet-Cookie:x=1",
  'null byte'          => "http://evil.com\x00.victim.example",
  'tab-in-scheme'      => "ht\ttp://evil.com",
  'unicode dot'        => 'http://evil。com',
  'encoded slashes'    => 'https:/\\/\\evil.com',
  // controls (should be allowed / kept as safe local or same-host):
  'CTRL local path'    => '/wp-admin/profile.php',
  'CTRL same host'     => 'http://victim.example/dashboard',
];

$leak = 0;
foreach ($vectors as $name=>$v){
  $out = wp_validate_redirect($v, $FALLBACK);
  // A leak = final location points somewhere other than victim.example or a local path.
  $host = parse_url((str_starts_with($out,'//')?'http:':'').$out, PHP_URL_HOST);
  $isctrl = str_starts_with($name,'CTRL');
  $external = $host && strtolower($host) !== 'victim.example';
  $verdict = $isctrl ? ' ctl' : ($external ? 'VULN' : ' ok ');
  if (!$isctrl && $external) $leak++;
  printf("[%s] %-18s in=%-40s -> out=%s\n", $verdict, $name, $v, $out);
}
echo "\n=== ".($leak? "$leak OPEN-REDIRECT LEAK(S)!" : "0 leaks — all external vectors fell back to $FALLBACK")." ===\n";
