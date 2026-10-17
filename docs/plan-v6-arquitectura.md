# Plan V6 — Limpieza final con clean architecture

> **Estado: COMPLETADO E IMPLEMENTADO (16/10/2026).**
> La refactorización a clean architecture por capas, la separación de responsabilidades, los 9 ADRs y las reglas de dependencia estrictas con `no-restricted-imports` en ESLint fueron ejecutados con éxito y están vigentes en el código. Este documento se conserva como registro de la auditoría y diseño original.

## 1. Diagnóstico

Severidad: **A** rompe la arquitectura o es un riesgo real · **M** deuda clara · **B** cosmético.

### 1.1 Acoplamientos y responsabilidades mezcladas

| # | Sev | Problema | Ruta |
|---|---|---|---|
| D1 | A | `index.ts` de la API hace todo (251 líneas): middlewares, CORS, parseo de `POST /api/viability`, política de contacto, mezcla catálogo + publicaciones, elige memoria o Postgres (repetido 3 veces) y responde HTTP. No hay casos de uso. | `apps/api/src/index.ts` |
| D2 | A | El dominio conoce el contrato HTTP: `listings.ts` importa `ListingContactResponse` y arma respuestas. | `packages/core/src/listings.ts` |
| D3 | A | El dominio conoce la persistencia: filas snake_case y `toRows`/`fromRows` publicados como `@mapa/core/db`. | `packages/core/src/db/rows.ts` |
| D4 | A | **Conexiones a Postgres que nunca se cierran**: `createDb(url)` en cada operación, sin `end()`. Un request a `/contact` abre hasta 3 clientes. | `packages/db/src/{repository,listings,contacts}.ts` |
| D5 | M | Puertos mal ubicados y duplicados (`DataSource` definido dos veces; `ListingStore`/`ContactStore` en la API). | `apps/api/src/{repository,listing-store}.ts` |
| D6 | M | Degradación inconsistente: el catálogo cae a local si la base falla; las publicaciones no. | `apps/api/src/{repository,index}.ts` |
| D7 | M | `/api/health` carga el dataset entero para informar el origen. | `apps/api/src/index.ts` |
| D8 | A | `MapCircularApp.tsx` (617 líneas) es un "god component": layout, hoja mobile, cálculo, flujo de publicación, avisos, tema y 8 subcomponentes inline. | `apps/web/src/components/app/MapCircularApp.tsx` |
| D9 | M | `fetch` dentro de componentes y URL base definida dos veces. | `useCatalog.ts`, `listing/{api.ts,ListingInfo.tsx}` |
| D10 | M | Lógica de dominio en la UI (`orderRanking`, `derive`, `dataItems`). | `panel/BuyerRanking.tsx`, `MapCircularApp.tsx` |
| D11 | M | `PublishDialog` (452 líneas) mezcla formulario, geolocalización, HTTP y errores. | `listing/PublishDialog.tsx` |

### 1.2 Duplicaciones

| # | Sev | Qué | Dónde |
|---|---|---|---|
| D12 | M | Etiquetas de semáforo repetidas (`LIGHT_TEXT` / `LIGHT_LABELS`). | `panel/Light.tsx`, `map/markers.ts` |
| D13 | M | Etiquetas de sector en 3 lugares. | `panel/Filters.tsx`, `panel/labels.ts`, `core/listings.ts`, `api/index.ts` |
| D14 | M | Etiquetas de material en 2 lugares con textos distintos; enums redefinidos a mano. | `core/listings.ts`, `map/markers.ts`, `core/match`, `api/index.ts`, `core/db/rows.ts` |
| D15 | M | `ContactInfo` en web redeclara campos de `ListingContactResponse`; `sourceIds` muerto. | `listing/api.ts` |
| D16 | B | `LatLng` y `ListingKind` redefinidos en web. | `listing/form.ts`, `features/notifications/my-listings.ts` |
| D17 | B | Dos wrappers de `localStorage`. | `lib/theme.ts`, `features/notifications/storage.ts` |
| D18 | B | `PIN_BORDER = LIGHT_COLORS`, alias sin valor. | `map/markers.ts` |
| D19 | B | Script inline de `index.html` espejo manual de `theme.ts` (documentar y testear). | `apps/web/index.html` |

### 1.3 Código muerto, exports y dependencias

| # | Sev | Qué | Ruta |
|---|---|---|---|
| D20 | M | Export raíz `"."` de core sin uso. | `packages/core/package.json`, `src/index.ts` |
| D21 | B | `state.ts` reexporta `parseAssumptionInput` solo para un test. | `components/app/state.ts` |
| D22 | B | `createDbListingStore` es un wrapper 1:1 sin valor. | `apps/api/src/listing-store.ts` |
| D23 | B | `format.ts` es presentación de la web, no dominio. | `packages/core/src/format.ts` |
| D24 | M | CLI `shadcn` en `dependencies`. | `apps/web/package.json` |
| D25 | B | `tsx` duplicado; `@types/node` solo en la raíz. | `package.json`, `packages/db/package.json` |
| D26 | B | Versiones internas inconsistentes (`^0.1.0` vs `*`); react fijado exacto. | `apps/api/package.json`, `apps/web/package.json` |
| D27 | B | Alias `hooks` en `components.json` sin carpeta. | `apps/web/components.json` |

### 1.4 Configs, archivos sueltos y restos de Next/Supabase

| # | Sev | Qué | Ruta |
|---|---|---|---|
| D29 | M | `tasks/plan.md` obsoleto; T1–T5 de `todo.md` hablan de Next/Supabase. | `tasks/` |
| D30 | M | SPEC cita rutas inexistentes (`src/lib/viability/...`) y la regla kebab-case que no se cumple. | `SPEC.md` |
| D31 | B | Comentario que apunta a `src/lib/viability/index.ts`. | `packages/core/src/viability/types.ts` |
| D32 | B | `.gitignore` todavía ignora `/.next/` y `/.open-next/`. | `.gitignore` |
| D33 | B | `tsconfig.json` raíz incluye `scripts/*.ts` (no hay). | `tsconfig.json` |
| D34 | B | `/.wrangler` en la raíz (estado viejo). | raíz |
| D35 | M | Override de ESLint que apaga `react-refresh/only-export-components` en 3 archivos. | `eslint.config.mjs` |
| D36 | B | Credencial de desarrollo hardcodeada como fallback en `drizzle.config.ts`. | `packages/db/drizzle.config.ts` |
| D37 | M | No hay CI ni script único de verificación. | raíz |

### 1.5 Nombres

| # | Sev | Qué |
|---|---|---|
| D38 | M | `origin` significa dos cosas (`DataOrigin` y `Generator.origin`); además se devuelve en todos los endpoints aunque el SPEC dice que solo en `/api/health`. |
| D39 | B | Cinco nombres para "fuente de datos" (`DataSource`, `ListingStore`, `ContactStore`…). Propuesta: `*Repository` (puerto) y `create{Pg,Memory,Local}*Repository` (adaptador). |
| D40 | B | Convención de archivos web: **componentes `PascalCase.tsx`, todo lo demás `kebab-case.ts`**. |
| D41 | B | Identificadores en inglés, literales de dominio en español: se documenta tal cual. |

### 1.6 Tests

| # | Sev | Qué | Ruta |
|---|---|---|---|
| D42 | M | Integración API + PGlite con `vi.mock('@mapa/db')`; con inyección de dependencias no hace falta. | `apps/api/src/db.test.ts` |
| D43 | B | Alias sin sentido en `api.test.ts`. | `apps/api/src/api.test.ts` |
| D44 | B | Test del mapper de base dentro de core (se mueve con D3). | `packages/core/src/db/rows.test.ts` |

### 1.7 Solo mobile (a borrar)

| # | Sev | Qué | Ruta |
|---|---|---|---|
| D45 | M | Hoja inferior propia: `PanelShell` mobile, `SheetContext`, `SheetTabs`, `EntityContact`, `SHEET_PEEK`, insets mobile. | `MapCircularApp.tsx` |
| D46 | M | `useWide`, props `wide`/`compact` y variantes responsive. | `MapCircularApp.tsx`, `map/MapView.tsx`, `panel/{KpiStrip,StateSelector,MatchDetail}.tsx` |
| D47 | M | e2e `mobile 375x812`. | `e2e/demo.spec.ts` |
| D48 | B | Secciones de mobile en `docs/design.md`. | `docs/design.md` |

## 2. Arquitectura objetivo

### 2.1 Capas y regla de dependencia

```
            ┌───────────── apps/web (UI React) ─────────────┐
            │ app → features → api-client / shared          │
            └───────────────┬───────────────────────────────┘
                            │ usa domain (cálculo en cliente) y contracts (tipos HTTP)
┌──────── apps/api ─────────▼──────────────────────────────────┐
│ index (entry) → composition → http (rutas, middlewares)      │
│                  │                  └→ application (casos de uso)
│                  └→ adapters (memory, local) ─┐              │
└───────────────────────────────────────────────┼──────────────┘
                 packages/db (adapters Postgres)┤ implementan
                                                ▼
packages/core:  domain  ←  ports  ←  contracts      data (catálogo curado)
```

1. `core/domain` no importa nada (ni ports, contracts, data ni librerías).
2. `core/ports` y `core/contracts` importan solo `domain`; `core/data` también.
3. `packages/db` importa `core/{domain,ports,data}`; nunca `apps/*`.
4. `apps/api/application` importa `core/{domain,ports,contracts}`; nunca Hono, Drizzle ni `@mapa/db`.
5. `apps/api/http` importa `application` y `contracts`; nunca adaptadores.
6. `apps/api/composition.ts` es el **único** lugar que importa `@mapa/db` y los adaptadores.
7. `apps/web` importa `core/{domain,contracts}`; nunca `core/data`, `ports` ni `@mapa/db`.
8. En web: `shared` no importa `features`; una feature importa otra solo por su `index.ts`; solo `src/api/` hace `fetch`.

Decisiones: casos de uso en `apps/api/src/application` (solo la API los ejecuta); puertos en `@mapa/core/ports` (db y memoria hacen `satisfies`); contratos HTTP en `@mapa/core/contracts`; `core/data` se queda en core; los subpath exports son la API pública de core; sin DI container, Zod ni tRPC (factories y objetos planos alcanzan).

### 2.2 `packages/core`

```
packages/core/src/
  domain/
    catalog.ts            Catalog, Source, Tagged, Material, Generator, Buyer, Alternative, CuratedContact
    enums.ts              MATERIAL_IDS, MATERIAL_STATES, BUYER_SECTORS, ALTERNATIVE_IDS, LISTING_KINDS (as const)
    viability/            index.ts, types.ts, viability.test.ts
    match/                index.ts (+ orderRanking), match.test.ts
    assumptions/          overrides.ts, overrides.test.ts
    listings/             validate.ts, to-entities.ts, types.ts, *.test.ts
    contact/              resolve-contact.ts (publicación → empresa → plataforma → ninguno), whatsapp.ts, *.test.ts
  ports/index.ts          CatalogRepository, ListingRepository, ContactDirectory, RateLimiter
  contracts/http.ts       CatalogResponse, ListingCreatedResponse, ListingContactResponse (= ContactCard), ViabilityRequest…
  data/                   (igual que hoy)
```

Exports: `./viability`, `./match`, `./overrides`, `./listings`, `./contact`, `./ports`, `./contracts` (`./api` como alias deprecado hasta el último paso), `./data`. Se eliminan `.`, `./db` y `./format` (este pasa a `apps/web/src/shared/format.ts`).

### 2.3 `packages/db`

```
packages/db/src/
  client.ts               createDb(url) → { db, close() }
  schema.ts
  mappers/                catalog-rows.ts (+test, desde core/db/rows.ts), columns.ts, listing-row.ts
  repositories/           pg-catalog-repository.ts, pg-listing-repository.ts, pg-contact-directory.ts (+tests PGlite)
  seed.ts, testing.ts
  index.ts                createPgRepositories(db) → { catalog, listings, contacts }, seedDatabase, createDb
```

Los repositorios reciben `AnyDb`, no una URL: la conexión la abre y la cierra la composición, una por request (resuelve D4).

### 2.4 `apps/api`

```
apps/api/src/
  index.ts                export default createApp()
  app.ts                  createApp(makeDeps = defaultDeps): Hono
  composition.ts          defaultDeps(env, ctx): Config + repos Pg o memoria/local + cierre con ctx.waitUntil
  config.ts               Env → Config
  http/
    middlewares/          security-headers.ts, cors.ts, deps.ts
    routes/               health.ts, catalog.ts, generators.ts, buyers.ts, viability.ts, listings.ts, contact.ts
    body.ts, respond.ts, parse-viability.ts
  application/
    get-catalog.ts, evaluate-match.ts, create-listing.ts, reveal-contact.ts, errors.ts (AppError)
  adapters/
    local-catalog-repository.ts, local-contact-directory.ts, memory-listing-repository.ts, memory-rate-limiter.ts, ip-hash.ts
  test/                   fakes.ts, integration/db.test.ts (PGlite sin vi.mock)
```

Cada ruta ≤ 25 líneas: parsea → caso de uso → `onError` mapea `AppError` a status. `origin` solo en `/api/health`.

### 2.5 `apps/web` (solo escritorio)

```
apps/web/src/
  main.tsx, App.tsx
  app/                    AppShell.tsx, ErrorBoundary.tsx, Notice.tsx, BrandPill.tsx
  api/                    http.ts (BASE único), endpoints.ts, interpret.ts (+test)
  features/
    catalog/              use-catalog.ts, insert-listing.ts
    calculator/           state.ts, derive.ts, use-calculator.ts, CalculatorPanel.tsx, StateSelector.tsx, Answer.tsx,
                          MatchDetail.tsx, Charts.tsx, RadiusSummary.tsx, AssumptionsEditor.tsx, KpiStrip.tsx, trajectory.ts
    buyers/               BuyerRanking.tsx, Filters.tsx
    map/                  ClientMap.tsx, MapView.tsx, markers.ts, types.ts
    listings/             PublishDialog.tsx, form.ts, after-create.ts, use-publish-flow.ts
    contact/              ContactReveal.tsx, use-contact.ts, PublishedMeta.tsx
    sources/              DataUsed.tsx, TagBadge.tsx
    notifications/        (F4)
    theme/                theme.ts, ThemeToggle.tsx
  shared/                 format.ts, labels.ts, storage.ts, Light.tsx
  components/ui/          shadcn
  lib/utils.ts            cn
  index.css
```

Una feature = un caso de uso visible (componentes + hook + lógica pura con tests). Solo `src/api/` hace `fetch`. Estado con `useReducer` + hooks (sin Zustand ni React Query). Un único layout de escritorio.

## 3. Plan de migración

Cada paso deja todo verde (`npm run verify` + `npm run test:e2e`), usa `git mv` y es un commit en español sin coautor.

### Fase 0 — Higiene

| Paso | Qué | Paralelo |
|---|---|---|
| 0.1 | Reescribir `tasks/plan.md`, anotar T1–T5 como históricos, corregir SPEC (D30), comentario (D31), `.gitignore` (D32), `tsconfig.json` (D33); borrar `/.wrangler`. | Sí (doc-writer) |
| 0.2 | Script `verify`. **Preguntar antes** de sumar `knip`. | Sí |
| 0.3 | Dependencias (D24–D27), `npm install`, lockfile. | No |

### Fase 1 — `packages/core`

| Paso | Qué |
|---|---|
| 1.1 | `domain/enums.ts` con `as const`; reemplazar enums repetidos (D14). |
| 1.2 | `domain/contact/` con `resolveContact` puro; `contracts/http.ts`; `listings.ts` deja de importar contratos (D2). |
| 1.3 | `viability/`, `match/`, `overrides` a `domain/`; `orderRanking` desde la web (D10). |
| 1.4 | `ports/index.ts`; `Catalog` reemplaza a `DataSet`. |
| 1.5 | Borrar export `"."` (D20). |

### Fase 2 — `packages/db` (después de 1.4)

| Paso | Qué |
|---|---|
| 2.1 | Mover `core/db/rows.ts` a `db/src/mappers/` (D3, D44). |
| 2.2 | `repositories/pg-*` que reciben `AnyDb`; `createDb` → `{ db, close }` (D4). |

### Fase 3 — `apps/api` (después de 2.2)

| Paso | Qué |
|---|---|
| 3.1 | Extraer `http/{respond,body,parse-viability}.ts` y middlewares. |
| 3.2 | `config.ts`. |
| 3.3 | `adapters/` + `composition.ts` (cierre de conexión con `waitUntil`); degradación en un solo lugar (D4–D6). |
| 3.4 | `application/` + `http/routes/`, una ruta por subpaso; `index.ts` de 5 líneas (D1, D7). |
| 3.5 | `origin` solo en `/health` (D38). |
| 3.6 | Tests de integración sin `vi.mock` (D42), limpiar alias (D43). |

### Fase 4 — `apps/web` (con F3 y F4 cerradas; secuencial)

| Paso | Qué |
|---|---|
| 4.1 | `src/api/` como único lugar de `fetch` (D9, D15). |
| 4.2 | Quitar mobile (D45–D48). |
| 4.3 | `shared/{format,labels,storage}.ts` y `shared/Light.tsx`; unificar D12–D18, D21; quitar override de ESLint (D35). |
| 4.4 | Partir `MapCircularApp` (ningún componente > 250 líneas) (D8). |
| 4.5 | Mover a `features/*`; partir `PublishDialog` (D11). |

### Fase 5 — Reglas, docs y cierre

| Paso | Qué |
|---|---|
| 5.1 | Reglas de capas en ESLint (sección 4). |
| 5.2 | ADRs (sección 5), `docs/architecture.md`, `docs/contributing.md`; README, SPEC y AGENTS.md apuntando ahí. |
| 5.3 | Opcional, **preguntar antes**: CI en `.github/workflows/ci.yml`. |
| 5.4 | Corrida final y prueba manual del guion; marcar V6. |

Carriles en paralelo: **A** doc-writer (0.1, 5.2) · **B** back (1.x → 2.x → 3.x) · **C** web (4.1 → 4.5, en paralelo con 3.x). Los pasos 0.3 (lockfile) y 5.1 (ESLint global) van solos; 3.5 y 4.3 coordinan `core/package.json` y `contracts`.

## 4. Reglas para hacerlas cumplir

Fronteras con `no-restricted-imports` (sin dependencias nuevas):

```js
const forbid = (patterns) => ({ rules: { "no-restricted-imports": ["error", { patterns }] } });

{ files: ["packages/core/src/domain/**"], ...forbid([
  { group: ["**/ports/**", "**/contracts/**", "**/data/**", "hono*", "drizzle-orm*", "react*"], message: "domain es puro" }]) },
{ files: ["packages/core/src/{ports,contracts,data}/**"], ...forbid([
  { group: ["**/data/**", "**/contracts/**"], message: "solo depende de domain" }]) },
{ files: ["apps/api/src/application/**"], ...forbid([
  { group: ["hono*", "@mapa/db*", "@mapa/core/data", "../adapters/**", "../http/**"], message: "casos de uso: solo core/{domain,ports,contracts}" }]) },
{ files: ["apps/api/src/http/**"], ...forbid([
  { group: ["@mapa/db*", "../adapters/**", "../../adapters/**"], message: "las rutas no conocen adaptadores; usar deps" }]) },
{ files: ["apps/web/src/**"], ...forbid([
  { group: ["@mapa/db*", "@mapa/core/data", "@mapa/core/ports"], message: "la web solo usa domain y contracts" }]) },
{ files: ["apps/web/src/shared/**"], ...forbid([{ group: ["@/features/**", "@/app/**"] }]) },
{ files: ["apps/web/src/features/**"], ...forbid([{ group: ["@/features/*/*"], message: "importar otra feature solo por su index.ts" }]) },
{ files: ["apps/web/src/**"], ignores: ["apps/web/src/api/**"], rules: { "no-restricted-globals": ["error", { name: "fetch", message: "usar src/api" }] } },
```

Scripts: `npm run verify`, `npm run check:unused` (knip, si se aprueba), `npm run test:e2e`. Tamaño: `max-lines: ["warn", 300]` en `apps/**/src/**/*.tsx` (excepto `components/ui`).

Checklist de PR:

- [ ] `verify` y `test:e2e` en verde; sin `eslint-disable`, `@ts-ignore` ni `.skip` nuevos.
- [ ] Lógica nueva pura en `core/domain` o en un `*.ts` de la feature, con test.
- [ ] Rutas finas: parseo → caso de uso → respuesta; caso de uso testeado con fakes.
- [ ] Ningún `fetch` fuera de `apps/web/src/api`; ningún `@mapa/db` fuera de `apps/api/src/composition.ts`.
- [ ] Contrato HTTP cambiado → `core/contracts`, API, web y README juntos.
- [ ] Ningún número sin etiqueta `real`/`estimado` ni fuente; ningún dato inventado.
- [ ] Esquema cambiado → `db:generate` y permisos de `mapa_api` revisados.
- [ ] Commit atómico en español, sin coautor.

## 5. ADRs a escribir en `docs/adr/`

Formato `NNNN-titulo-kebab.md` con Estado, Contexto, Decisión y Consecuencias.

| ADR | Decisión |
|---|---|
| 0001 Monorepo con npm workspaces | `apps/{web,api}` + `packages/{core,db}`; core como TS fuente por subpath exports; sin Turborepo/Nx. |
| 0002 API en Hono sobre Cloudflare Workers | `createApp(deps)` testeable con `app.request`; estado en memoria best-effort; `nodejs_compat`. |
| 0003 Postgres agnóstico con Drizzle | Drizzle + drizzle-kit, rol `mapa_api` de mínimo privilegio, PGlite en tests, fallback a `core/data`; pooler en producción. |
| 0004 SPA Vite + React + shadcn, solo escritorio | Build estático, componentes Radix editables, un único layout de escritorio. |
| 0005 Publicaciones abiertas sin cuenta | "Sin verificar", validación estricta, tope de body, límite por IP hasheada, `INSERT` solo en `listings`. |
| 0006 Contacto revelado aparte del catálogo | `/api/listings/:id/contact` con límite; política publicación → empresa (con fuente) → plataforma → ninguno. |
| 0007 Notificaciones sin servicios externos | Matches al publicar + campanita con `localStorage` y consulta cada ~20 s; email/WhatsApp en roadmap. |
| 0008 Datos etiquetados real/estimado con fuente | `Tagged { value, tag, sourceIds, note }`; `meta jsonb` en la base; test de integridad. |
| 0009 Clean architecture y reglas de dependencia | domain → ports/contracts → application → adapters/http/UI; fronteras con `no-restricted-imports`. |

## 6. Cómo agregar una feature

Ejemplo: "filtrar compradores por demanda mínima y exponerlo en la API".

1. **Spec:** fila en `SPEC.md` y tarea en `tasks/todo.md` con criterio verificable.
2. **Dominio** (`core/src/domain`): test primero, después la función pura. Enums nuevos en `domain/enums.ts`.
3. **Contrato** (`core/src/contracts/http.ts`): campos nuevos opcionales.
4. **Puerto** (si hay persistencia): método en `core/src/ports`, implementado en `adapters/memory-*` y en `db/repositories/pg-*` con `satisfies`; esquema → `db:generate` + permisos + test PGlite.
5. **Caso de uso** (`apps/api/src/application/<verbo-sustantivo>.ts`): recibe `deps`, devuelve datos o lanza `AppError`; test con fakes.
6. **Ruta** (`apps/api/src/http/routes/<recurso>.ts`): parsea, llama, responde; test con `createApp(fakeDeps).request(...)`.
7. **Cliente web** (`apps/web/src/api/endpoints.ts`): función tipada; `interpret*` puro si hay errores.
8. **Feature web** (`apps/web/src/features/<feature>/`): lógica pura con test, hook `use-<algo>.ts`, componentes que reciben props; textos en `shared/labels.ts`, formatos en `shared/format.ts`, cada número con `TagBadge` y fuente.
9. **E2E** si cambia un flujo visible.
10. **Docs:** README (API) y ADR si la decisión es estructural.
11. **Verificar y commitear:** `npm run verify && npm run test:e2e`, checklist de PR, commit en español.

| Necesito… | Va en |
|---|---|
| Una fórmula o regla de negocio | `packages/core/src/domain` |
| Un tipo que viaja por HTTP | `packages/core/src/contracts` |
| Leer o guardar algo | puerto en `core/ports` + adaptadores memory y pg |
| Orquestar (validar, limitar, guardar) | `apps/api/src/application` |
| Un endpoint | `apps/api/src/http/routes` |
| Llamar a la API desde la web | `apps/web/src/api` |
| Estado o pantalla | `apps/web/src/features/<feature>` |
| Label, formato o helper de UI | `apps/web/src/shared` |
| Componente base de shadcn | `npx shadcn add …` → `apps/web/src/components/ui` |
