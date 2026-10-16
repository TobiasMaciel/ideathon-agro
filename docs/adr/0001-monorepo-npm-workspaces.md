# ADR-0001: Monorepo con npm workspaces

- Estado: Aceptado
- Fecha: 2026-10-16

## Contexto

El front y el back usan el mismo modelo de cálculo, los mismos tipos y los mismos datos curados. Mantenerlos en repositorios separados obligaría a publicar y versionar un paquete compartido, y una fórmula podría divergir entre la pantalla y `POST /api/viability`.

## Decisión

Un único repositorio con npm workspaces (`packages/*` y `apps/*`):

- `apps/web`: SPA de escritorio.
- `apps/api`: API HTTP.
- `packages/core`: dominio, puertos, contratos HTTP y datos curados.
- `packages/db`: esquema Drizzle, migraciones, seed y repositorios Postgres.

`packages/core` se consume como TypeScript fuente, a través de subpath exports (`@mapa/core/viability`, `@mapa/core/ports`, etc.). Esos subpath exports son su API pública. No se usa Turborepo ni Nx: los scripts de la raíz (`npm run build --workspaces --if-present`, etc.) alcanzan.

## Consecuencias

- Una fórmula se escribe una vez en `core` y la usan la web y la API.
- No hay paso de build ni publicación para compartir código entre workspaces.
- Los cambios que cruzan workspaces (por ejemplo, un contrato HTTP) se hacen en un solo commit.
- Sin un orquestador de tareas, no hay caché de builds ni ejecución incremental; el costo es aceptable con cuatro workspaces.
- Lo que no esté declarado en los `exports` de `core` no es público: importar rutas internas queda fuera de la convención.

## Alternativas consideradas

- Turborepo o Nx: agregan una dependencia y configuración sin un problema actual que resuelvan.
- Repositorios separados con paquete publicado: más fricción para cambios que tocan dominio, API y web a la vez.
