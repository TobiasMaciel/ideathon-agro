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
