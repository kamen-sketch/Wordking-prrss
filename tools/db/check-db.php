<?php
/**
 * Check that this install can reach its MySQL server, before WordPress tries.
 *
 * WordPress reports every configuration and connectivity problem as the same
 * "Error establishing a database connection" page. This says which variable is
 * missing, whether the host answers, whether the credentials are accepted,
 * whether the database exists, and whether it already holds WordPress tables.
 *
 * Usage:
 *   php tools/db/check-db.php
 *
 * Exit status is 0 when WordPress would be able to connect.
 */

if ( 'cli' !== PHP_SAPI ) {
	http_response_code( 403 );
	exit( "This script is command-line only.\n" );
}

if ( ! extension_loaded( 'mysqli' ) ) {
	fwrite( STDERR, "FAIL  the mysqli extension is not loaded; WordPress cannot talk to MySQL at all.\n" );
	exit( 1 );
}

/**
 * Reads an environment variable the same way wp-config.php does.
 *
 * @param string $name    Variable name.
 * @param mixed  $default Value when unset.
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

$name     = wpk_env( 'DB_NAME' );
$user     = wpk_env( 'DB_USER' );
$password = wpk_env( 'DB_PASSWORD' );
$host_raw = wpk_env( 'DB_HOST', 'localhost' );
$prefix   = wpk_env( 'DB_TABLE_PREFIX', 'wp_' );

$missing = array();
foreach ( array( 'DB_NAME' => $name, 'DB_USER' => $user, 'DB_PASSWORD' => $password ) as $key => $value ) {
	if ( null === $value ) {
		$missing[] = $key;
	}
}

if ( $missing ) {
	fwrite( STDERR, 'FAIL  missing environment variable(s): ' . implode( ', ', $missing ) . "\n" );
	fwrite( STDERR, "      set them in the shell or process manager that runs PHP.\n" );
	exit( 1 );
}

// DB_HOST carries an optional :port or :/path/to/socket suffix, and mysqli
// wants those as separate arguments.
$host   = $host_raw;
$port   = null;
$socket = null;

if ( false !== strpos( $host_raw, ':' ) ) {
	list( $host, $suffix ) = explode( ':', $host_raw, 2 );
	if ( '' !== $suffix && '/' === $suffix[0] ) {
		$socket = $suffix;
	} elseif ( ctype_digit( $suffix ) ) {
		$port = (int) $suffix;
	}
}

printf( "host      %s%s\n", $host_raw, $socket ? " (unix socket {$socket})" : '' );
printf( "database  %s\n", $name );
printf( "user      %s\n", $user );
printf( "prefix    %s\n\n", $prefix );

mysqli_report( MYSQLI_REPORT_OFF );
$mysqli = @mysqli_init();
$mysqli->options( MYSQLI_OPT_CONNECT_TIMEOUT, 10 );

$connected = @$mysqli->real_connect(
	$host,
	$user,
	$password,
	$name,
	$port ?? ( $socket ? null : 3306 ),
	$socket
);

if ( ! $connected ) {
	$errno = mysqli_connect_errno();
	fwrite( STDERR, "FAIL  {$errno}: " . mysqli_connect_error() . "\n\n" );

	// The three errors people actually hit, each with a different fix.
	if ( 2002 === $errno || 2003 === $errno ) {
		fwrite( STDERR, "      The server did not answer. Check that MySQL is running and that\n" );
		fwrite( STDERR, "      DB_HOST is reachable from this machine (firewall, bind-address,\n" );
		fwrite( STDERR, "      container network). MySQL speaks raw TCP on 3306, so an environment\n" );
		fwrite( STDERR, "      that only allows HTTPS egress cannot reach a remote database at all.\n" );
	} elseif ( 1045 === $errno ) {
		fwrite( STDERR, "      The server answered and rejected the credentials. Check DB_USER and\n" );
		fwrite( STDERR, "      DB_PASSWORD, and that the user is granted access from this host.\n" );
	} elseif ( 1049 === $errno ) {
		fwrite( STDERR, "      The credentials work but the database does not exist. Create it:\n" );
		fwrite( STDERR, "        CREATE DATABASE `{$name}` DEFAULT CHARACTER SET utf8mb4;\n" );
	}

	exit( 1 );
}

printf( "ok    connected, server %s\n", $mysqli->server_info );

$charset = wpk_env( 'DB_CHARSET', 'utf8mb4' );
if ( ! $mysqli->set_charset( $charset ) ) {
	printf( "warn  could not set charset %s: %s\n", $charset, $mysqli->error );
} else {
	printf( "ok    charset %s\n", $charset );
}

$result = $mysqli->query(
	sprintf(
		"SHOW TABLES LIKE '%s%%'",
		$mysqli->real_escape_string( $prefix )
	)
);

if ( $result ) {
	$tables = $result->num_rows;
	if ( $tables > 0 ) {
		printf( "ok    %d existing table(s) with prefix %s -- this database is already installed\n", $tables, $prefix );
	} else {
		printf( "ok    no tables with prefix %s yet -- ready for a fresh install at /wp-admin/install.php\n", $prefix );
	}
}

$mysqli->close();
echo "\nWordPress can connect with this configuration.\n";
exit( 0 );
