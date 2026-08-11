<?php
// PoC: run REAL WP_Interactivity_API::process_directives() with an attacker-
// controlled state value, to test server-side reflection / XSS in directives.
error_reporting(E_ALL & ~E_DEPRECATED);
define('ABSPATH', '/home/user/Wordking-prrss/');
function _doing_it_wrong($f,$m,$v){}
function esc_attr($s){ return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }
function esc_html($s){ return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }
function esc_url($u){ $u=trim($u); if(preg_match('/^\s*(javascript|data|vbscript):/i',$u)) return ''; return htmlspecialchars($u, ENT_QUOTES); }
function apply_filters($t,$v){ return $v; }
function wp_json_encode($d,$f=0,$depth=512){ return json_encode($d,$f,$depth); }
if(!function_exists('array_last')){ function array_last($a){ return empty($a)?null:$a[array_key_last($a)]; } }
if(!function_exists('array_first')){ function array_first($a){ return empty($a)?null:$a[array_key_first($a)]; } }
if(!function_exists('array_is_list')){ function array_is_list($a){ return $a===array_values($a); } }
if(!function_exists('wp_has_noncharacters')){ function wp_has_noncharacters($s){ return (bool)preg_match('/\x{FFFE}|\x{FFFF}|[\x{FDD0}-\x{FDEF}]/u',$s); } }
if(!function_exists('wp_kses_uri_attributes')){ function wp_kses_uri_attributes(){ return array('action','archive','background','cite','classid','codebase','data','formaction','href','icon','longdesc','manifest','poster','profile','src','usemap','xmlns'); } }

$html = [
  'class-wp-token-map.php',
  'html-api/html5-named-character-references.php',
  'html-api/class-wp-html-span.php',
  'html-api/class-wp-html-text-replacement.php',
  'html-api/class-wp-html-decoder.php',
  'html-api/class-wp-html-attribute-token.php',
  'html-api/class-wp-html-tag-processor.php',
  'html-api/class-wp-html-doctype-info.php',
  'html-api/class-wp-html-token.php',
  'html-api/class-wp-html-stack-event.php',
  'html-api/class-wp-html-active-formatting-elements.php',
  'html-api/class-wp-html-open-elements.php',
  'html-api/class-wp-html-unsupported-exception.php',
  'html-api/class-wp-html-processor-state.php',
  'html-api/class-wp-html-processor.php',
  'interactivity-api/class-wp-interactivity-api-directives-processor.php',
  'interactivity-api/class-wp-interactivity-api.php',
];
foreach ($html as $f) require ABSPATH.'wp-includes/'.$f;

$api = new WP_Interactivity_API();

// Attacker-controlled state values (imagine reflected from a query var into state).
$xss  = '</span><script>alert(document.domain)</script>';
$jsurl= 'javascript:alert(1)';
$api->state('poc', array('evil' => $xss, 'link' => $jsurl));

// Block markup that binds attacker state into text and an href attribute.
$tpl = <<<HTML
<div data-wp-interactive="poc">
  <span data-wp-text="state.evil">placeholder</span>
  <a data-wp-bind--href="state.link">click</a>
</div>
HTML;

$out = $api->process_directives($tpl);
echo "=== process_directives output ===\n$out\n";

$bad = preg_match('/<script|javascript:alert/i', $out);
echo "\n[".($bad?'VULN':' ok ')."] server-side reflection: ".($bad?"DANGEROUS payload survived":"escaped/neutralized")."\n";

// --- L1: the actual JSON state serialization flags used by script modules ---
// Source: wp-includes/class-wp-script-modules.php:1109
$flags = JSON_HEX_TAG | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_LINE_TERMINATORS;
$state_json = wp_json_encode(array('state'=>array('poc'=>array('evil'=>$xss))), $flags);
echo "\n=== <script type=\"application/json\"> state payload (flags per :1109) ===\n$state_json\n";
$breakout = (stripos($state_json,'</script') !== false) || (strpos($state_json,'<') !== false);
echo "[".($breakout?'VULN':' ok ')."] </script> breakout in JSON state: ".($breakout?"POSSIBLE":"impossible ('<' -> \\u003C)")."\n";
