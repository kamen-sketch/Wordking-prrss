<?php
/**
 * activate-plugins.php — aktifkan setiap plugin terpasang lewat API WordPress,
 * masing-masing di subprocess sendiri agar fatal satu plugin tidak menjatuhkan
 * yang lain. Dipanggil oleh install-plugins.sh (mode --github).
 *
 *   php wp-lab/activate-plugins.php --list          # daftar main-file plugin
 *   php wp-lab/activate-plugins.php "slug/main.php"  # aktifkan satu plugin
 */
define( 'WP_USE_THEMES', false );
$_SERVER['HTTP_HOST']   = ( getenv( 'WP_HOST' ) ?: '127.0.0.1' ) . ':' . ( getenv( 'WP_PORT' ) ?: '8080' );
$_SERVER['REQUEST_URI'] = '/wp-admin/';

$wp_root = dirname( __DIR__ );
require $wp_root . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/plugin.php';

if ( ( $argv[1] ?? '' ) === '--list' ) {
	foreach ( array_keys( get_plugins() ) as $f ) {
		echo $f, "\n";
	}
	exit( 0 );
}

$plugin = $argv[1] ?? '';
if ( '' === $plugin ) {
	fwrite( STDERR, "usage: activate-plugins.php <slug/main.php>|--list\n" );
	exit( 1 );
}

try {
	$res = activate_plugin( $plugin, '', false, false );
	if ( is_wp_error( $res ) ) {
		fwrite( STDERR, 'WPERR: ' . $res->get_error_message() . "\n" );
		exit( 2 );
	}
	echo is_plugin_active( $plugin ) ? "ACTIVE\n" : "NOTACTIVE\n";
} catch ( \Throwable $e ) {
	fwrite( STDERR, 'FATAL: ' . $e->getMessage() . "\n" );
	exit( 3 );
}
