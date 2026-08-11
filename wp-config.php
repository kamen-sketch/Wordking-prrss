<?php
/**
 * WordPress configuration, driven by the environment.
 *
 * Nothing secret is stored in this file, so it is safe to commit: every
 * credential is read from an environment variable, and the authentication
 * salts fall back to wp-salts.php, which is generated per install and
 * git-ignored. See tools/db/README.md.
 *
 * Required environment variables:
 *
 *   DB_NAME       database name
 *   DB_USER       database user
 *   DB_PASSWORD   database password
 *   DB_HOST       database host, optionally with :port or :/path/to/socket
 *                 (defaults to localhost)
 *
 * Optional:
 *
 *   DB_CHARSET    defaults to utf8mb4
 *   DB_COLLATE    defaults to the server's collation
 *   DB_TABLE_PREFIX  defaults to wp_
 *   WP_DEBUG / WP_DEBUG_LOG / WP_DEBUG_DISPLAY   "true" or "1" to enable
 *   WP_HOME / WP_SITEURL   set both when the site URL is fixed by deployment
 *
 * @package WordPress
 */

/**
 * Reads an environment variable, falling back to a default.
 *
 * getenv() is checked alongside $_ENV and $_SERVER because which one is
 * populated depends on the SAPI and on variables_order: php-fpm pools
 * populate $_SERVER, Docker's --env populates all three, and some hosts
 * expose values only through getenv().
 *
 * @param string $name    Variable name.
 * @param mixed  $default Value to use when the variable is not set.
 * @return mixed
 */
function wpk_env( $name, $default = null ) {
	foreach ( array( $_ENV, $_SERVER ) as $bag ) {
		if ( isset( $bag[ $name ] ) && '' !== $bag[ $name ] ) {
			return $bag[ $name ];
		}
	}

	$value = getenv( $name );

	return ( false === $value || '' === $value ) ? $default : $value;
}

/**
 * Interprets an environment variable as a boolean.
 *
 * Environment variables are always strings, so "false" and "0" have to be
 * spelled out rather than relying on PHP's truthiness.
 *
 * @param string $name    Variable name.
 * @param bool   $default Value to use when the variable is not set.
 * @return bool
 */
function wpk_env_bool( $name, $default = false ) {
	$value = wpk_env( $name );

	if ( null === $value ) {
		return $default;
	}

	return in_array( strtolower( (string) $value ), array( '1', 'true', 'yes', 'on' ), true );
}

// ** Database settings ** //

$wpk_required = array( 'DB_NAME', 'DB_USER', 'DB_PASSWORD' );
$wpk_missing  = array();

foreach ( $wpk_required as $wpk_name ) {
	if ( null === wpk_env( $wpk_name ) ) {
		$wpk_missing[] = $wpk_name;
	}
}

if ( $wpk_missing ) {
	// Failing here with a specific message beats letting WordPress reach the
	// database layer and report "Error establishing a database connection",
	// which does not say which piece is missing.
	header( 'Content-Type: text/plain; charset=utf-8', true, 500 );
	echo "WordPress is not configured.\n\n";
	echo 'Missing environment variable(s): ' . implode( ', ', $wpk_missing ) . "\n\n";
	echo "Set them in the web server or process manager that runs PHP, then reload.\n";
	echo "Run php tools/db/check-db.php to test the connection from the command line.\n";
	exit( 1 );
}

define( 'DB_NAME', wpk_env( 'DB_NAME' ) );
define( 'DB_USER', wpk_env( 'DB_USER' ) );
define( 'DB_PASSWORD', wpk_env( 'DB_PASSWORD' ) );
define( 'DB_HOST', wpk_env( 'DB_HOST', 'localhost' ) );
define( 'DB_CHARSET', wpk_env( 'DB_CHARSET', 'utf8mb4' ) );
define( 'DB_COLLATE', wpk_env( 'DB_COLLATE', '' ) );

/**#@+
 * Authentication unique keys and salts.
 *
 * Taken from the environment when present, otherwise from wp-salts.php, which
 * tools/db/generate-salts.php writes and .gitignore excludes. Changing them
 * invalidates every existing cookie and logs everyone out.
 *
 * @since 2.6.0
 */
$wpk_salts = array(
	'AUTH_KEY',
	'SECURE_AUTH_KEY',
	'LOGGED_IN_KEY',
	'NONCE_KEY',
	'AUTH_SALT',
	'SECURE_AUTH_SALT',
	'LOGGED_IN_SALT',
	'NONCE_SALT',
);

foreach ( $wpk_salts as $wpk_salt ) {
	$wpk_value = wpk_env( $wpk_salt );

	if ( null !== $wpk_value ) {
		define( $wpk_salt, $wpk_value );
	}
}

if ( file_exists( __DIR__ . '/wp-salts.php' ) ) {
	require_once __DIR__ . '/wp-salts.php';
}

foreach ( $wpk_salts as $wpk_salt ) {
	if ( ! defined( $wpk_salt ) ) {
		// WordPress runs without these, but every session and nonce on the
		// site is then derived from a value an attacker already knows.
		define( $wpk_salt, 'put your unique phrase here' );
	}
}
/**#@-*/

/**
 * WordPress database table prefix.
 *
 * Changing this after WordPress is installed makes the site think it has not
 * been installed, so set DB_TABLE_PREFIX before the first install or not at all.
 */
$table_prefix = wpk_env( 'DB_TABLE_PREFIX', 'wp_' );

/**
 * For developers: WordPress debugging mode.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', wpk_env_bool( 'WP_DEBUG', false ) );
define( 'WP_DEBUG_LOG', wpk_env_bool( 'WP_DEBUG_LOG', false ) );
define( 'WP_DEBUG_DISPLAY', wpk_env_bool( 'WP_DEBUG_DISPLAY', false ) );

/* Add any custom values between this line and the "stop editing" line. */

// Pin the site URL when deployment fixes it, so a stale value in the database
// cannot redirect the site somewhere else. Both constants must agree.
if ( null !== wpk_env( 'WP_HOME' ) ) {
	define( 'WP_HOME', wpk_env( 'WP_HOME' ) );
	define( 'WP_SITEURL', wpk_env( 'WP_SITEURL', wpk_env( 'WP_HOME' ) ) );
}

// Load a local override for anything the environment cannot express. This file
// is git-ignored and optional.
if ( file_exists( __DIR__ . '/wp-config-local.php' ) ) {
	require_once __DIR__ . '/wp-config-local.php';
}

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
