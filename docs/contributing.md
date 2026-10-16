# Guía de contribución

Antes de tocar código, leer [docs/architecture.md](architecture.md) (capas y reglas de dependencia) y, si la decisión es estructural, [docs/adr/](adr/README.md).

## Setup

Requisitos: Node 22 o superior y npm.

```bash
npm install
npm run dev                      # API (8787) y web (5173) en paralelo
npx playwright install chromium  # solo la primera vez, para los e2e
```

Sin `DATABASE_URL` la API usa los datos de `packages/core/src/data` y guarda las publicaciones en memoria. Para trabajar con Postgres, ver la sección "Con Postgres" del [README](../README.md).

## Scripts

Desde la raíz:

| Script | Qué hace |
|---|---|
| `npm run dev` | API y web en paralelo. |
| `npm run dev:api` / `npm run dev:web` | Cada app por separado. |
| `npm run build` | Build de todos los workspaces. |
| `npm run typecheck` | `tsc` en la raíz y en cada workspace. |
| `npm run lint` | ESLint sobre todo el repo (incluye las reglas de capas cuando estén activas). |
| `npm test` | Vitest en cada workspace. Uno solo: `npm test -w @mapa/core`. |
| `npm run test:e2e` | Playwright contra web y API levantadas juntas. |
| `npm run verify` | Verificación única previa a commitear. TODO(verify): se agrega en el paso 0.2 del plan de migración; confirmar su contenido exacto contra `package.json`. |
| `npm run db:generate` | Genera migraciones SQL tras editar `packages/db/src/schema.ts`. |
| `npm run db:migrate` | Aplica las migraciones a `DATABASE_URL`. |
| `npm run db:seed` | Carga los datos de `packages/core` en `DATABASE_URL`. |
| `npm run db:studio` | Abre Drizzle Studio. |

Antes de cada commit: `npm run verify` y `npm run test:e2e` en verde.

## Convenciones

- **Archivos de `apps/web`:** los componentes son `PascalCase.tsx`; todo lo demás (hooks, lógica, utilidades) es `kebab-case.ts`. En el resto de los workspaces, `kebab-case.ts`.
- **Identificadores en inglés** (funciones, variables, tipos); **literales de dominio en español** (`suelto`, `compactado`, `pellet`, nombres de materiales, textos de la UI).
- Funciones en `camelCase`, componentes y tipos en `PascalCase`.
- **Nombres de puertos y adaptadores:** `*Repository` para el puerto y `create{Pg,Memory,Local}*Repository` para el adaptador.
- TypeScript estricto. La lógica de negocio va en funciones puras con test; la UI no calcula.
- Los textos y formatos de la UI salen de `apps/web/src/shared/labels.ts` y `shared/format.ts`, sin duplicarlos en componentes.
- Ningún número sin etiqueta `real` o `estimado` y sin fuente ([ADR-0008](adr/0008-datos-etiquetados-real-estimado.md)). Ningún dato inventado.
- Ningún componente de `apps/web` debería superar las 250 líneas; ESLint avisa a partir de 300.

## Cómo agregar una feature

Ejemplo: "filtrar compradores por demanda mínima y exponerlo en la API".

1. **Spec:** fila en `SPEC.md` y tarea en `tasks/todo.md` con criterio verificable.
2. **Dominio** (`packages/core/src/domain`): test primero, después la función pura. Enums nuevos en `domain/enums.ts`.
3. **Contrato** (`packages/core/src/contracts/http.ts`): campos nuevos opcionales.
4. **Puerto** (si hay persistencia): método en `packages/core/src/ports`, implementado en `apps/api/src/adapters/memory-*` y en `packages/db/src/repositories/pg-*` con `satisfies`. Si cambia el esquema: `npm run db:generate`, revisar permisos de `mapa_api` y agregar un test con PGlite.
5. **Caso de uso** (`apps/api/src/application/<verbo-sustantivo>.ts`): recibe `deps`, devuelve datos o lanza `AppError`; test con fakes.
6. **Ruta** (`apps/api/src/http/routes/<recurso>.ts`): parsea, llama al caso de uso y responde; test con `createApp(fakeDeps).request(...)`.
7. **Cliente web** (`apps/web/src/api/endpoints.ts`): función tipada; un `interpret*` puro si hay errores que traducir.
8. **Feature web** (`apps/web/src/features/<feature>/`): lógica pura con test, hook `use-<algo>.ts` y componentes que reciben props. Cada número lleva `TagBadge` y fuente.
9. **E2E** si cambia un flujo visible.
10. **Docs:** README (sección API) y un ADR si la decisión es estructural.
11. **Verificar y commitear:** `npm run verify && npm run test:e2e`, checklist de PR, commit en español.

## Checklist de PR

- [ ] `verify` y `test:e2e` en verde; sin `eslint-disable`, `@ts-ignore` ni `.skip` nuevos.
- [ ] Lógica nueva pura en `core/domain` o en un `*.ts` de la feature, con test.
- [ ] Rutas finas: parseo, caso de uso, respuesta; caso de uso testeado con fakes.
- [ ] Ningún `fetch` fuera de `apps/web/src/api`; ningún `@mapa/db` fuera de `apps/api/src/composition.ts`.
- [ ] Contrato HTTP cambiado: `core/contracts`, API, web y README juntos.
- [ ] Ningún número sin etiqueta `real`/`estimado` ni fuente; ningún dato inventado.
- [ ] Esquema cambiado: `db:generate` y permisos de `mapa_api` revisados.
- [ ] Commit atómico en español, sin coautor.

## Commits

- En español, atómicos (un cambio coherente por commit).
- Sin coautor: no agregar líneas `Co-authored-by`.
- Si cambia el contrato HTTP, el commit incluye `core/contracts`, la API, la web y el README.
