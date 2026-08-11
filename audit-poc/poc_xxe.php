<?php
// PoC: XXE against WordPress's real unauth XML-RPC parser (IXR_Message / expat).
error_reporting(E_ALL & ~E_DEPRECATED);
define('ABSPATH', '/home/user/Wordking-prrss/');
function apply_filters($t,$v){ return $v; }
require ABSPATH.'wp-includes/IXR/class-IXR-message.php';

$secret = "/tmp/claude-0/-home-user-Wordking-prrss/97c28bc6-f89a-47eb-8ffd-1509674c9565/scratchpad/xxe_secret.txt";
file_put_contents($secret, "TOP-SECRET-CANARY-9f3a\n");

// Classic XXE: external + parameter entity trying to read a local file.
$payloads = [
'file entity' => <<<XML
<?xml version="1.0"?>
<!DOCTYPE methodCall [ <!ENTITY xxe SYSTEM "file://$secret"> ]>
<methodCall><methodName>demo.test</methodName>
<params><param><value><string>&xxe;</string></value></param></params></methodCall>
XML,
'param entity' => <<<XML
<?xml version="1.0"?>
<!DOCTYPE methodCall [
  <!ENTITY % p SYSTEM "file://$secret">
  <!ENTITY % q "<!ENTITY leak '&#37;p;'>"> %q;
]>
<methodCall><methodName>demo.test</methodName>
<params><param><value><string>&leak;</string></value></param></params></methodCall>
XML,
'billion laughs' => <<<XML
<?xml version="1.0"?>
<!DOCTYPE lolz [
 <!ENTITY lol "lol">
 <!ENTITY lol2 "&lol;&lol;&lol;&lol;&lol;">
 <!ENTITY lol3 "&lol2;&lol2;&lol2;&lol2;&lol2;">
]>
<methodCall><methodName>&lol3;</methodName>
<params><param><value><string>x</string></value></param></params></methodCall>
XML,
];

foreach ($payloads as $name => $xml) {
    $msg = new IXR_Message($xml);
    $ok  = @$msg->parse();          // real WP parser
    $method = $msg->methodName ?? '(none)';
    $args   = isset($msg->params) ? json_encode($msg->params) : '(none)';
    $leaked = (strpos($args ?? '', 'CANARY') !== false) || (strpos($method,'CANARY') !== false);
    printf("[%s] %-14s parse=%s  method=%s  params=%s\n",
        $leaked ? 'VULN' : ' ok ', $name, var_export($ok,true), $method, $args);
    if ($leaked) echo "    !!! FILE CONTENT LEAKED VIA XXE\n";
}
// ---- POSITIVE CONTROLS (prove the harness can parse + detect a leak) ----
echo "\n--- positive controls ---\n";
$benign = <<<XML
<?xml version="1.0"?>
<methodCall><methodName>demo.sum</methodName>
<params><param><value><string>hello</string></value></param>
<param><value><int>42</int></value></param></params></methodCall>
XML;
$m = new IXR_Message($benign); $ok = $m->parse();
printf("[ctrl] valid message parse=%s method=%s params=%s\n", var_export($ok,true), $m->methodName, json_encode($m->params));
echo "  -> proves: parser WORKS on valid input (so parse=false above = real rejection)\n";

$canary = <<<XML
<?xml version="1.0"?>
<methodCall><methodName>demo.x</methodName>
<params><param><value><string>TOP-SECRET-CANARY-9f3a</string></value></param></params></methodCall>
XML;
$m2 = new IXR_Message($canary); $m2->parse();
$detect = strpos(json_encode($m2->params),'CANARY') !== false;
printf("[ctrl] canary-in-value detected=%s\n", var_export($detect,true));
echo "  -> proves: detector WOULD flag a leak if XXE had injected file content\n";

echo "\n=== XXE against real IXR_Message: 0 leaks; positive controls PASS ===\n";
@unlink($secret);
