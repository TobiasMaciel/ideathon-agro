# Plan vigente — Mapa Circular NEA

Spec: [SPEC.md](../SPEC.md) · Tareas: [todo.md](todo.md) · Arquitectura objetivo y migración: [docs/plan-v6-arquitectura.md](../docs/plan-v6-arquitectura.md) · Estructura: [docs/architecture.md](../docs/architecture.md)

> Nota: la v1 de este plan (Next.js + OpenNext + Supabase) fue reemplazada por la v2: monorepo con `apps/web` (Vite + React), `apps/api` (Hono sobre Cloudflare Workers) y `packages/{core,db}` (Postgres con Drizzle). El detalle histórico de la v1 sigue en `tasks/todo.md`, marcado como histórico.

## Estado

- v2 (monorepo, base con Drizzle, rediseño con shadcn) y publicaciones abiertas (F1, F2): ver `tasks/todo.md`.
- F3 (modo claro) y F4 (notificaciones de match): ver `tasks/todo.md`.
- V6 (limpieza con clean architecture): se ejecuta al final, siguiendo [docs/plan-v6-arquitectura.md](../docs/plan-v6-arquitectura.md).

## Fases de V6

| Fase | Qué |
|---|---|
| 0 | Higiene: documentación, `.gitignore`, `tsconfig.json`, script `verify`, dependencias. |
| 1 | `packages/core`: dominio, puertos y contratos. |
| 2 | `packages/db`: mappers y repositorios Postgres que reciben la conexión. |
| 3 | `apps/api`: configuración, adaptadores, composición, casos de uso y rutas finas. |
| 4 | `apps/web`: cliente HTTP único, solo escritorio, `shared/` y `features/*`. |
| 5 | Reglas de capas en ESLint, ADRs y documentación de arquitectura. |

Cada paso deja todo verde (`npm run verify` y `npm run test:e2e`) y es un commit en español, sin coautor.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Datos públicos insuficientes (precios locales) | Usar el dato regional más cercano con fecha y marcarlo `estimado` con su derivación. |
| Refactor que rompe comportamiento | Un paso por commit, con `verify` y e2e en verde antes de seguir. |
| Cambios paralelos sobre `core/package.json` o `contracts` | Coordinar los pasos 3.5 y 4.3 del plan de V6. |
