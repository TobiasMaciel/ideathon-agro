# Arquitectura

Referencia de la estructura del código y de las reglas de dependencia. Las decisiones y sus motivos están en [docs/adr/](adr/README.md); cómo trabajar en el repo, en [docs/contributing.md](contributing.md).

## 1. Capas y regla de dependencia

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

Las dependencias apuntan siempre hacia el dominio. Reglas (se hacen cumplir con `no-restricted-imports` de ESLint):

1. `core/domain` no importa nada (ni ports, contracts, data ni librerías).
2. `core/ports` y `core/contracts` importan solo `domain`; `core/data` también.
3. `packages/db` importa `core/{domain,ports,data}`; nunca `apps/*`.
4. `apps/api/application` importa `core/{domain,ports,contracts}`; nunca Hono, Drizzle ni `@mapa/db`.
5. `apps/api/http` importa `application` y `contracts`; nunca adaptadores.
6. `apps/api/composition.ts` es el único lugar que importa `@mapa/db` y los adaptadores.
7. `apps/web` importa `core/{domain,contracts}`; nunca `core/data`, `ports` ni `@mapa/db`.
8. En web: `shared` no importa `features`; una feature importa otra solo por su `index.ts`; solo `src/api/` hace `fetch`.

Decisiones asociadas: los casos de uso están en `apps/api/src/application` (solo la API los ejecuta); los puertos en `@mapa/core/ports` (los adaptadores de Postgres y de memoria los implementan con `satisfies`); los contratos HTTP en `@mapa/core/contracts`; `core/data` se queda en core; los subpath exports son la API pública de core. No hay contenedor de DI, Zod ni tRPC: alcanzan factories y objetos planos ([ADR-0009](adr/0009-clean-architecture-capas.md)).

## 2. Estructura por workspace

### 2.1 `packages/core`

Dominio compartido. Sin dependencias de runtime.

```
packages/core/src/
  domain/
    catalog.ts            Catalog, Source, Tagged, Material, Generator, Buyer, Alternative, CuratedContact
    enums.ts              Enums del dominio (MATERIAL_IDS, MATERIAL_STATES, BUYER_SECTORS, ALTERNATIVE_IDS, LISTING_KINDS) como as const
    viability/            Modelo de cálculo: carga, flete, margen, semáforo, radio, ahorro (con tests)
    match/                Adaptador de match y ranking de compradores (orderRanking)
    assumptions/          Validación y aplicación de supuestos editados (overrides)
    listings/             Validación de publicaciones y conversión a generador/comprador
    contact/              resolve-contact (publicación → empresa → plataforma → ninguno) y link de WhatsApp
  ports/index.ts          CatalogRepository, ListingRepository, ContactDirectory, RateLimiter
  contracts/http.ts       Tipos que viajan por HTTP: CatalogResponse, ListingCreatedResponse, ListingContactResponse, ViabilityRequest…
  data/                   Catálogo curado con fuentes y etiquetas (fuente única de la API sin base y del seed)
```

Exports públicos: `./viability`, `./match`, `./overrides`, `./listings`, `./contact`, `./ports`, `./contracts`, `./data`. `./api` sigue como alias deprecado hasta el último paso de la migración. Ya no hay export raíz (`.`), ni `./db` ni `./format`.

### 2.2 `packages/db`

Persistencia Postgres con Drizzle.

```
packages/db/src/
  client.ts               createDb(url) → { db, close() }
  schema.ts               Esquema Drizzle
  mappers/                Filas de base ↔ entidades (catalog-rows, columns, listing-row), con tests
  repositories/           pg-catalog-repository, pg-listing-repository, pg-contact-directory (tests con PGlite)
  seed.ts, testing.ts     Seed desde core/data y utilidades de test
  index.ts                createPgRepositories(db) → { catalog, listings, contacts }, seedDatabase, createDb
```

Los repositorios reciben una conexión (`AnyDb`), no una URL: la abre y la cierra la composición de la API, una por request.

### 2.3 `apps/api`

API HTTP (Hono sobre Cloudflare Workers).

```
apps/api/src/
  index.ts                export default createApp()
  app.ts                  createApp(makeDeps = defaultDeps): Hono
  composition.ts          defaultDeps(env, ctx): configuración + repositorios Pg o memoria/local; cierra la conexión con ctx.waitUntil
  config.ts               Env → Config
  http/
    middlewares/          security-headers, cors, deps
    routes/               health, catalog, generators, buyers, viability, listings, contact
    body.ts, respond.ts, parse-viability.ts
  application/            get-catalog, evaluate-match, create-listing, reveal-contact, errors (AppError)
  adapters/               local-catalog-repository, local-contact-directory, memory-listing-repository, memory-rate-limiter, ip-hash
  test/                   fakes.ts, integration/db.test.ts (PGlite, sin vi.mock)
```

Cada ruta tiene como máximo 25 líneas: parsea, llama al caso de uso y responde; `onError` traduce `AppError` a status HTTP. `origin` solo se informa en `/api/health`.

### 2.4 `apps/web`

SPA de escritorio (Vite + React).

```
apps/web/src/
  main.tsx, App.tsx
  app/                    AppShell, ErrorBoundary, Notice, BrandPill
  api/                    http.ts (BASE único), endpoints.ts, interpret.ts (con test)
  features/
    catalog/              use-catalog, insert-listing
    calculator/           state, derive, use-calculator, trajectory y los paneles del cálculo (CalculatorPanel, StateSelector, Answer, MatchDetail, Charts, RadiusSummary, AssumptionsEditor, KpiStrip)
    buyers/               BuyerRanking, Filters
    map/                  ClientMap, MapView, markers, types
    listings/             PublishDialog, form, after-create, use-publish-flow
    contact/              ContactReveal, use-contact, PublishedMeta
    sources/              DataUsed, TagBadge
    notifications/        Avisos de match con localStorage
    theme/                theme, ThemeToggle
  shared/                 format, labels, storage, Light
  components/ui/          Componentes shadcn
  lib/utils.ts            cn
  index.css
```

Una feature es un caso de uso visible: componentes, hook y lógica pura con tests. El estado se maneja con `useReducer` y hooks. Hay un único layout de escritorio.

## 3. Flujo de un request

Ejemplo: el usuario evalúa un match (`POST /api/viability`).

1. **Web:** una feature llama a una función tipada de `apps/web/src/api/endpoints.ts`, el único lugar que hace `fetch`. `interpret.ts` traduce errores.
2. **API, entrada:** `index.ts` exporta `createApp()`. Los middlewares (`security-headers`, `cors`, `deps`) preparan la request; `deps` construye las dependencias mediante `composition.ts`.
3. **Ruta** (`http/routes/viability.ts`): parsea el cuerpo (`parse-viability.ts`) y llama al caso de uso.
4. **Caso de uso** (`application/evaluate-match.ts`): obtiene datos a través de un puerto y calcula con funciones puras de `core/domain`. Si algo falla, lanza `AppError`.
5. **Puerto** (`core/ports`): `CatalogRepository`, `ListingRepository`, etc. El caso de uso solo conoce esta interfaz.
6. **Adaptador:** según la configuración, `packages/db` (Postgres, vía Drizzle) o `apps/api/src/adapters` (memoria o datos locales de `core/data`). La conexión a Postgres se abre al inicio del request y se cierra con `ctx.waitUntil`.
7. **Respuesta:** la ruta serializa el resultado con un tipo de `core/contracts`; la web lo recibe con ese mismo tipo.

## 4. Dónde vive cada cosa

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
