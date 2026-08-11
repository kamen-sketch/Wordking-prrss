# Database configuration

`wp-config.php` reads every credential from the environment, so it holds no
secrets and is committed. Two helper scripts live here: one to generate the
authentication salts, one to prove the database is reachable before WordPress
tries.

## Environment variables

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `DB_NAME` | yes | — | |
| `DB_USER` | yes | — | |
| `DB_PASSWORD` | yes | — | |
| `DB_HOST` | no | `localhost` | Accepts `host`, `host:3306`, or `:/path/to/mysqld.sock` |
| `DB_CHARSET` | no | `utf8mb4` | |
| `DB_COLLATE` | no | server default | |
| `DB_TABLE_PREFIX` | no | `wp_` | Set before the first install; changing it later hides the site's data |
| `WP_DEBUG`, `WP_DEBUG_LOG`, `WP_DEBUG_DISPLAY` | no | off | `true`/`1`/`yes`/`on` to enable |
| `WP_HOME`, `WP_SITEURL` | no | from database | Set both when deployment fixes the URL |
| `AUTH_KEY` … `NONCE_SALT` | no | `wp-salts.php` | Environment wins over the file |

If a required variable is missing, `wp-config.php` stops with a message naming
it, instead of letting WordPress render its generic "Error establishing a
database connection" page.

## Setting it up

```sh
# 1. Generate the salts. Once per install -- rerunning logs everyone out.
php tools/db/generate-salts.php

# 2. Point the environment at your database, however your host does it:
#    php-fpm pool     env[DB_NAME] = wpdb
#    Apache           SetEnv DB_NAME wpdb
#    systemd unit     Environment=DB_NAME=wpdb
#    Docker           -e DB_NAME=wpdb   /  environment: in compose
#    plain shell      export DB_NAME=wpdb

# 3. Confirm the connection before pointing a browser at the site.
php tools/db/check-db.php

# 4. Install: open /wp-admin/install.php
```

`generate-salts.php --env` prints `export` lines instead of writing a file, for
when secrets are injected as environment variables rather than read from disk.

`wp-salts.php` and `wp-config-local.php` are both in `.gitignore`.
`wp-config-local.php` is an optional, unmanaged file loaded at the end of
`wp-config.php`, for anything a variable cannot express.

## check-db.php

Distinguishes the failures WordPress reports identically:

| Result | Meaning |
| --- | --- |
| missing variable | Configuration never reached the database |
| `2002` / `2003` | Host did not answer: server down, wrong host, firewall, `bind-address` |
| `1045` | Credentials rejected — the server is fine |
| `1049` | Credentials fine, database does not exist |
| ok, tables found | Already installed |
| ok, no tables | Ready for a fresh install |

## MySQL cannot run in this development environment

This was checked, not assumed. The container has no `mysqld` or `mariadbd`, and
it cannot get one: `apt-get update` returns `403 Forbidden` for
`archive.ubuntu.com`, and pypi and npm are equally blocked.

A remote MySQL server is not an option either, and this is not something an
allowlist entry fixes. Outbound traffic goes through an HTTP `CONNECT` proxy,
and `/root/.ccr/README.md` lists what it will not carry:

> gRPC / HTTP/2-only APIs, WebSocket upgrades, client-mTLS, certificate-pinned
> clients (e.g. Snowflake, ngrok), non-443 HTTPS ports, **raw-TCP databases**.

MySQL speaks its own protocol on port 3306, so no host entry makes it
reachable. PHP's side is ready — `mysqli`, `mysqlnd` and `pdo_mysql` are all
loaded — but the server and the transport are both absent.

So this configuration is exercised where a real MySQL exists: your host, VPS, or
a local Docker setup. Everything above was tested here as far as it can be —
the missing-variable path, the connection-refused diagnosis, salt generation,
and that `wp-config.php` hands off to `wp-settings.php` with its constants
defined. The successful-connection path is the one that needs a real server.

If you want the site running *in this environment* instead, the only route is
the WordPress team's SQLite integration
([`WordPress/sqlite-database-integration`](https://github.com/WordPress/sqlite-database-integration),
reachable from here) — a different database, not MySQL.
