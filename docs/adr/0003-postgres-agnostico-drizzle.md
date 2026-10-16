# ADR-0003: Postgres agnóstico con Drizzle

- Estado: Aceptado
- Fecha: 2026-10-16

## Contexto

Los datos curados, los supuestos y las publicaciones necesitan persistirse. No se quiere depender de un proveedor: el proyecto debe funcionar con un Postgres local, Neon, Supabase, RDS u otro, y también sin base. La versión inicial usaba Supabase; fue reemplazada por esta decisión.

## Decisión

- PostgreSQL estándar accedido con Drizzle ORM; las migraciones SQL se generan con drizzle-kit (`npm run db:generate`). Solo cambia `DATABASE_URL` entre entornos.
- La API no se conecta con el rol dueño de las tablas sino con `mapa_api`, de mínimo privilegio: lectura, más `INSERT` solo en `listings`.
- Los tests de base corren contra PGlite (Postgres en memoria), sin Docker.
- Si falta `DATABASE_URL`, la API sirve los datos de `packages/core/src/data`, que además es la fuente única del seed.
- En producción se accede a través de un pooler (o Hyperdrive). Detalle de roles y pooling en `packages/db/README.md`.

## Consecuencias

- Cambiar de proveedor no requiere cambios de código.
- El rol de la API no puede modificar ni borrar datos curados, aunque la API tenga un defecto.
- Cualquier cambio de esquema exige `db:generate` y revisar los permisos de `mapa_api`.
- Los repositorios Postgres reciben una conexión ya abierta (`AnyDb`); quién la abre y la cierra es la composición de la API, una por request.
- Hay dos implementaciones de cada puerto (Postgres y memoria/local) que deben mantenerse equivalentes.

## Alternativas consideradas

- Supabase como dependencia directa (versión inicial): ata el proyecto a un proveedor.
