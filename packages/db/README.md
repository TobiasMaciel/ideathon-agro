# @mapa/db

Capa de datos de Sobra: esquema Drizzle, migraciones SQL, seed y los adaptadores Postgres de los
puertos de `@mapa/core/ports` (`createPgRepositories(db)` → `{ catalog, listings, contacts }`).
Postgres estándar: solo hace falta `DATABASE_URL` (Docker, Neon, RDS, un servidor propio, etc.).

## Uso

```bash
docker compose up -d db          # opcional: Postgres local (ver docker-compose.yml)
cp .env.example .env             # DATABASE_URL=postgres://mapa:mapa@localhost:5432/mapa
npm run db:migrate               # aplica packages/db/migrations
npm run db:seed                  # carga @mapa/core/data (borra y reinserta)
npm run db:generate              # tras editar src/schema.ts: genera una migración nueva
```

`db:migrate` y `db:seed` leen `DATABASE_URL` del entorno (no cargan `.env` solos): en bash
`set -a; . ./.env; set +a`, o `node --env-file=.env` / variables del sistema.

## Roles de la API (mínimo privilegio)

- `0001_readonly_role.sql` crea `mapa_readonly` (NOLOGIN, solo SELECT).
- `0003_api_role.sql` crea `mapa_api` (NOLOGIN): hereda `mapa_readonly` y tiene `INSERT` **solo en `listings`**
  (publicaciones abiertas). No puede escribir los datos curados ni hacer UPDATE/DELETE en `listings`.
  Lee las columnas de contacto (`contact_*`) porque la API las sirve en `GET /api/listings/:id/contact`;
  el catálogo nunca las incluye.

Los roles no tienen LOGIN. Creá el usuario de la API con la contraseña que elijas, heredando `mapa_api`:

```sql
CREATE ROLE mapa_api_login LOGIN PASSWORD 'cambiar-esto' IN ROLE mapa_api;
```

Y en `apps/api/.dev.vars` (o como secret del Worker): `DATABASE_URL=postgres://mapa_api_login:cambiar-esto@host:5432/mapa`.
Las migraciones y el seed se corren con el usuario dueño de las tablas (el seed no toca `listings`).

## Estructura

- `client.ts`: `createDb(url)` → `{ db, close }`. Quien abre la conexión la cierra: en la API, `composition.ts`
  la abre por request y la cierra al terminar (con `executionCtx.waitUntil`).
- `mappers/`: catálogo ⇄ filas SQL (`catalog-rows.ts`), publicaciones ⇄ fila (`listing-row.ts`), nombres de columnas.
- `repositories/`: `pg-catalog-repository.ts`, `pg-listing-repository.ts`, `pg-contact-directory.ts`. Reciben una
  conexión abierta (`AnyDb`), nunca una URL, e implementan los puertos con `satisfies`.

## Workers

El cliente usa `postgres` (postgres.js) con `max: 1, prepare: false` y requiere `nodejs_compat`. En
producción, apuntar `DATABASE_URL` a un pooler (pgbouncer en modo transacción, Hyperdrive) para no agotar conexiones.

## Tests

`npm test -w @mapa/db` usa PGlite (Postgres en WASM, en memoria) y aplica las migraciones reales: no necesita Docker.
