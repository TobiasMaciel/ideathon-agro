# Tareas — Mapa Circular NEA (MVP)

Plan: [plan.md](plan.md) · Spec: [SPEC.md](../SPEC.md)
Alcance de esta etapa: **desarrollo y prueba local**. Sin deploy (Cloudflare y Supabase quedan configurados, no se despliegan).

Leyenda: `[ ]` pendiente · `[~]` en curso · `[x]` hecho

---

## T1 · Scaffold del proyecto — implementer
- [x] Next.js (App Router, TS, Tailwind, ESLint, `src/`, alias `@/*`)
- [x] `@opennextjs/cloudflare` + `wrangler.jsonc` (solo configuración, sin deploy)
- [x] Vitest + Playwright + scripts de `package.json`
- [x] Cliente Supabase server-side que devuelve `null` si faltan las variables
- [x] `supabase init` (sin levantar Supabase local)
- **Acepta:** `npm run lint`, `typecheck`, `test`, `build` y el e2e smoke pasan.

## T2 · Investigación de datos — researcher ×6
- [x] Flete 2026 (FETRA, Agrofy, FADEEAC), capacidad del camión
- [x] Propiedades físicas (densidad, PCI, humedad, eficiencias)
- [x] Precios (InFoPro, GLP 2026, pellet de referencia, dólar BNA)
- [x] Generadores reales (14) y compradores reales (10)
- [x] Coordenadas de localidades (OpenStreetMap Nominatim)

## T3 · Modelo de cálculo `src/lib/viability/` — implementer (TDD)
- [x] Contrato de tipos (`types.ts`)
- [x] `haversineKm`, `routeDistanceKm`
- [x] `productTons` (pérdida de masa al secar), `truckLoadTons`, `tripsPerMonth`
- [x] `trafficLight` (bordes 0% y umbral), `buyerSavings` (energía y volumen)
- [x] `maxViableDistanceKm` (radio B2), `evaluateViability` (todo junto)
- **Acepta:** tests primero; cobertura ≥ 90% en `lib/viability`.

## T4 · Datos y base — orquestador + implementer
- [x] `src/data/` con fuentes, materiales, alternativas, supuestos, generadores y compradores, todo con etiqueta y fuente
- [x] Test de integridad de datos: cada valor tiene etiqueta y fuentes existentes; coordenadas dentro del NEA; cada comprador acepta materiales válidos
- [x] `supabase/migrations/…_init.sql`: tablas `sources`, `materials`, `material_states`, `alternatives`, `assumptions`, `generators`, `buyers`; RLS solo lectura para `anon`
- [x] `scripts/gen-seed.ts` → `supabase/seed.sql` (`npm run db:seed`)
- **Acepta:** seed generado y consistente con `src/data/`.

## T5 · Backend (API) — implementer
- [x] `src/server/repository.ts`: lee de Supabase si hay `SUPABASE_URL`/`SUPABASE_ANON_KEY`; si no, de `src/data/`
- [x] `GET /api/catalog` → materiales, alternativas, supuestos, fuentes
- [x] `GET /api/generators?material=` y `GET /api/buyers?sector=`
- [x] `POST /api/viability` → evalúa un match en el servidor (misma lógica que el front)
- **Acepta:** tests de rutas con y sin Supabase (mock); respuestas tipadas y errores 400 por input inválido.

## T6 · UI mapa (A1, A3, B2) — implementer
- [x] Mapa Leaflet client-only centrado en Corrientes
- [x] Capa de generadores (oferta) y de compradores (demanda) con íconos distintos y popups con datos y etiquetas
- [x] Filtros por material y sector
- [x] Círculo de radio de viabilidad del generador elegido según el estado
- **Acepta:** se ve y funciona en 375 px y en escritorio.

## T7 · UI calculadora (B1) — implementer
- [x] Selección de generador y comprador (desde el mapa o desde una lista)
- [x] Selector suelto / compactado / pellet (solo los estados disponibles del material)
- [x] Desglose: distancia, carga por camión, viajes, ingreso, flete, acondicionamiento, margen, semáforo y ahorro del comprador
- [x] Cada número con su etiqueta `real`/`estimado` y la fuente al pasar el mouse o al tocar
- [x] Supuestos editables en la sesión (costo/km, factor de ruta, umbral) que recalculan al instante
- [x] Ranking de compradores para el generador elegido, ordenado por margen
- **Acepta:** el cambio de estado recalcula en < 200 ms sin recargar la página.

## T8 · E2E y documentación — implementer + doc-writer
- [x] Playwright: guion de la demo (molino → compradores → suelto en rojo → pellet en verde)
- [x] README: cómo correr en local, cómo conectar Supabase y cómo desplegar después (sin ejecutar)
- [x] `.dev.vars.example` y `.env.example`

## T9 · Review y cierre — code-reviewer + security-auditor + test-engineer
- [x] Fan-out de review en paralelo; el orquestador corrige los hallazgos críticos
- [x] Corrida final: lint, typecheck, test, build, e2e, `npm run dev` y prueba manual del guion
- [x] Commits agrupados por tema, en español, sin coautor

---

# v2 — Front y back separados + estética minimalista

## V1 · Skills de UI — orquestador
- [x] Instalar `better-*` (jakubkrehel/skills) y `minimalist-ui`, `redesign-existing-projects`, `design-taste-frontend` (Leonxlnx/taste-skill) para Claude y Gemini
- [x] Proteger esas skills en `scripts/sync-agent-skills.sh`; documentarlas en `AGENTS.md`

## V2 · Monorepo: core + api + web — implementer
- [x] npm workspaces; `packages/core` con viability, match, overrides, format, data, tipos de API y filas de Supabase
- [x] `apps/api`: Hono en Cloudflare Workers (wrangler), mismas rutas y validaciones, `/api/health`, CORS por `ALLOWED_ORIGINS`, Supabase desde bindings con fallback a core
- [x] `apps/web`: Vite + React + Tailwind + Leaflet con los componentes actuales; proxy `/api` en dev
- [x] Scripts raíz (`dev`, `dev:api`, `dev:web`, `test`, `typecheck`, `lint`, `build`, `test:e2e`, `db:seed`); quitar Next.js y OpenNext
- **Acepta:** todos los tests unitarios y e2e pasan; `npm run dev` levanta los dos.

## V2b · Base de datos agnóstica con Drizzle — implementer (después de V2)
- [x] `packages/db`: esquema Drizzle de las 7 tablas, migraciones con drizzle-kit, seed desde `@mapa/core/data`, `createDbDataSource(url)` para la API
- [x] Rol de solo lectura para la API en una migración SQL; sin dependencias de Supabase
- [x] `docker-compose.yml` con Postgres 17 (opcional, no se levanta en esta etapa)
- [x] Tests de integración contra PGlite (migrar + seed + leer = datos locales)
- [x] Quitar `supabase/` y `@supabase/supabase-js`
- **Acepta:** `npm test` verde; la API con `DATABASE_URL` usa la base y sin ella los datos locales.

## V3 · Dirección de diseño — doc-writer (en paralelo a V2)
- [x] `docs/design.md`: tokens (color, tipografía, espaciado, radios, sombras), layout, componentes y estados, según `minimalist-ui` y `better-*`

## V4 · Rediseño de la web con shadcn/ui — implementer
- [~] shadcn/ui + lucide-react sobre Tailwind 4, tema mapeado a la paleta de `docs/design.md`
- [~] Pines del mapa con forma e ícono por tipo (generadores: gota con árbol/trigo; compradores: badge con ícono de sector y semáforo); selección muy visible
- [~] UX: "dónde estoy" siempre claro, combobox con búsqueda, ranking claro, detalle plegable, mobile cómodo
- [~] Aplicar `docs/design.md` a `apps/web`; revisión con `better-interface`
- **Acepta:** screenshots desktop y mobile, contraste AA, e2e verde.

## F1 · Publicaciones abiertas (oferta y demanda)
- [x] Back: tabla `listings` (Drizzle + migración + permisos), store en memoria sin base, `POST /api/listings` con validación y rate limit, publicaciones mezcladas en `/api/catalog` — implementer
- [ ] Front: botón "Publicar", formulario (Vendo/Compro) en Dialog o Drawer de shadcn, ubicación con click en el mapa, badge "sin verificar" — implementer (después de V4)
- [x] Back: contacto en la publicación y `GET /api/listings/:id/contact` (no viaja en el catálogo)
- [ ] Front: botón "Ver contacto" que revela los datos y abre WhatsApp
- [~] Quitar de la UI el origen de datos y textos de entorno (look de producción)
- [ ] e2e: publicar una oferta, verla en el mapa y en el ranking, y ver su contacto
- [x] Contactos corporativos públicos (web, teléfono, email con fuente) para los establecimientos del seed; nada inventado ni personal
- [x] Back: contacto de curados en `packages/core/src/data`, tabla/columnas en `packages/db` + seed, `GET /api/listings/:id/contact` responde también para curados

## F2 · Contacto vía plataforma
- [x] Curados sin contacto público → "Contactar a través de Circular NEA" con el WhatsApp/email del equipo (`PLATFORM_CONTACT_PHONE`, `PLATFORM_CONTACT_EMAIL`); nunca datos inventados de empresas
- [ ] Cargar el WhatsApp y el email del equipo (pendiente del usuario)

## F3 · Modo claro
- [ ] Tema claro además del oscuro (tokens equivalentes, contraste AA), selector en la UI que respeta la preferencia del sistema y se recuerda, mapa base claro (Esri Light Gray Canvas) en modo claro — implementer, después de F1 front

## F4 · Notificaciones de match (sin servicios externos) — después de F3
- [ ] Matches al publicar: lista de los que te cierran (margen, distancia, Ver contacto) al terminar de publicar
- [ ] "Mis publicaciones" recordadas en el navegador (sin cuenta)
- [ ] Campanita: matches nuevos para mis publicaciones desde la última visita; consulta de novedades cada ~20 s; marcar como leídas
- [ ] e2e: publicar una demanda en un contexto y ver la campanita encenderse en otro
- Fuera de alcance (roadmap del pitch): email y WhatsApp automáticos (requieren proveedor externo)

## V5 · Cierre — e2e, README, review y commits
- [ ] e2e y README actualizados a la nueva estructura
- [ ] Review (code-reviewer) del monorepo y del rediseño
- [ ] Commits agrupados en español, sin coautor

## V6 · Limpieza final con clean architecture — AL FINAL DE TODO (pedido del usuario)
Plan detallado: [docs/plan-v6-arquitectura.md](../docs/plan-v6-arquitectura.md) (auditoría del 16/10/2026).
- [ ] Auditar el repo: código muerto, archivos sueltos, dependencias sin uso, configs duplicadas, nombres inconsistentes
- [ ] Capas claras por workspace: dominio (entidades y reglas puras en `packages/core`), casos de uso (aplicación), adaptadores (Postgres/Drizzle, HTTP con Hono, UI React) e infraestructura; dependencias que apunten solo hacia el dominio
- [ ] API: rutas finas → casos de uso → puertos (repositorios) implementados por adaptadores (memoria y Postgres)
- [ ] Web: separar UI de estado y de acceso a la API (cliente HTTP tipado, hooks por caso de uso)
- [ ] Convenciones documentadas (estructura, nombres, cómo agregar una feature) y ADRs de las decisiones grandes en `docs/adr/`
- [ ] Todo verde (typecheck, lint, tests, build, e2e) y commits agrupados en español, sin coautor
