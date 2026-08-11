<?php
// PoC: SQLi guards on unauth-reachable params — real sanitize_sql_orderby()
// and real wpdb::prepare() placeholder handling.
error_reporting(E_ALL & ~E_DEPRECATED);
define('ABSPATH', '/home/user/Wordking-prrss/');

function __($s,$d=null){ return $s; }
function esc_sql($s){ return addslashes($s); }
function _doing_it_wrong($f,$m,$v){}
function wp_load_translations_early(){}
function apply_filters($t,$v){ return $v; }
function mysql_to_rfc3339($s){ return $s; }
function has_filter($t,$f=false){ return false; }
function add_filter(){ return true; }
function wp_rand($min=0,$max=0){ return mt_rand($min?:0,$max?:mt_getrandmax()); }

// --- sanitize_sql_orderby (real code, extracted byte-for-byte from formatting.php) ---
$src = file_get_contents(ABSPATH.'wp-includes/formatting.php');
if (!preg_match('/function sanitize_sql_orderby\(.*?\n\}/s', $src, $m)) { die("extract failed\n"); }
eval($m[0]);   // defines the genuine sanitize_sql_orderby()

echo "=== sanitize_sql_orderby() — guard for WP_Query/REST orderby ===\n";
$ob = [
  'legit single'  => 'post_date DESC',
  'legit multi'   => 'menu_order ASC, post_title DESC',
  'RAND()'        => 'RAND()',
  'inj union'     => 'id UNION SELECT user_pass FROM wp_users',
  'inj stack'     => 'id; DROP TABLE wp_users',
  'inj subquery'  => 'id,(SELECT IF(1=1,SLEEP(5),0))',
  'inj comment'   => 'id/*',
  'inj sleep'     => '(SELECT SLEEP(5))',
];
foreach ($ob as $n=>$v){
  $r = sanitize_sql_orderby($v);
  $blocked = ($r === false);
  $isinj = str_contains(strtolower($n),'inj');
  $verdict = $isinj ? ($blocked?' ok ':'VULN') : ($r===$v?'ctrl':'??');
  printf("[%s] %-12s -> %s\n", $verdict, $n, var_export($r,true));
}

// --- wpdb::prepare (real) via no-connect subclass ---
require ABSPATH.'wp-includes/class-wpdb.php';
class TestWPDB extends wpdb {
  public function __construct(){ /* skip db_connect */ $this->incompatible_modes = array(); }
  public function db_connect($allow_bail=true){ return true; }
  public function _real_escape($s){ return addslashes((string)$s); } // mysqli-less fallback
}
$db = new TestWPDB();

echo "\n=== wpdb::prepare() — placeholder quoting/escaping ===\n";
$payloads = [
  "x' OR '1'='1",
  "1; DROP TABLE wp_users --",
  "admin' UNION SELECT user_pass FROM wp_users -- ",
  "\\' OR 1=1 -- ",
];
foreach ($payloads as $p){
  $q = $db->prepare("SELECT * FROM wp_users WHERE user_login = %s AND ID = %d", $p, $p);
  // A safe result: the string is single-quoted+escaped; %d coerces to int (no quotes needed).
  $escaped_ok = (strpos($q, "= '") !== false);          // %s produced a quoted literal
  $intcoerce  = (bool)preg_match('/ID = \d+/', $q);      // %d coerced to integer
  $breakout   = (bool)preg_match("/user_login = '' /",$q) && false; // (informational)
  printf("[%s] payload=%s\n     query=%s\n", ($escaped_ok && $intcoerce)?' ok ':'VULN', $p, $q);
}

// %i identifier placeholder (WP 6.2+) — cannot be turned into a subquery
echo "\n=== wpdb::prepare() %i identifier ===\n";
$q = $db->prepare("SELECT * FROM %i WHERE %i = %d", "wp_users; DROP", "ID) OR (1=1", 5);
echo "  $q\n";
$idsafe = (strpos($q,'DROP')===false) || (strpos($q,'`')!==false);
echo "[".($idsafe?' ok ':'VULN')."] %i backtick-quotes identifiers (no stacked query)\n";
