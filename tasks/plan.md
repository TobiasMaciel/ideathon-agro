# Plan — Mapa Circular NEA (MVP)

Spec: [SPEC.md](../SPEC.md) · Tareas: [todo.md](todo.md). Orquestador: sesión principal. Trabajadores: subagentes de `AGENTS.md`. Alcance: desarrollo local, sin deploy.

## Componentes y dependencias

```
T1 scaffold ─┬─> T3 lib/viability (TDD) ─┬─> T6 UI mapa (A1, A3, B2) ─┐
             │                           └─> T7 UI calculadora (B1) ──┼─> T8 e2e + README deploy ─> T9 review
T2 datos ────┴─> T4 data + SQL + seed ───> T5 API + repositorio ──────┘
```

## Tareas

- [x] **T1 Scaffold** (implementer) — Next.js + OpenNext Cloudflare + Tailwind + Vitest + Playwright + Supabase client.
  - Verify: lint, typecheck, test, build, e2e smoke, preview.
- [x] **T2 Investigación de datos** (4 × researcher, paralelo) — precios, flete y física, generadores, compradores; todo con fuente.
- [x] **T3 Modelo de cálculo** (implementer, TDD) — `src/lib/viability/`: carga, viajes, distancia, flete, acondicionamiento, margen, semáforo, radio máximo, ahorro del comprador.
  - Verify: `npm test` con cobertura ≥ 90 % en `lib/viability`.
- [x] **T4 Datos y base** (orquestador + implementer) — `src/data/*.ts` con fuente y etiqueta; migración SQL con RLS solo lectura; `scripts/gen-seed.ts` → `supabase/seed.sql`.
  - Verify: tests de integridad de datos (todo tiene fuente, etiqueta, coordenadas dentro de NEA); seed generado.
- [x] **T5 API** (implementer) — `GET /api/catalog`, `/api/generators`, `/api/buyers` y `POST /api/viability`; repositorio Supabase con fallback a `src/data`.
  - Verify: tests de rutas con Supabase mockeado y sin env.
- [x] **T6 UI mapa** (implementer) — Leaflet client-only, capas de oferta y demanda, filtros, círculo de radio B2.
- [x] **T7 UI calculadora** (implementer) — panel con selector de estado, desglose etiquetado, semáforo, supuestos editables, ahorro del comprador.
- [x] **T8 E2E y documentación** (implementer + doc-writer) — Playwright del guion de la demo; README con deploy a Cloudflare y push a Supabase.
- [x] **T9 Review** (code-reviewer + security-auditor + test-engineer en paralelo) — el orquestador sintetiza y corrige.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| OpenNext preview falla en Windows | Documentar y validar con `next build`; deploy desde CI o WSL |
| Datos públicos insuficientes (precios locales) | Usar el dato regional más cercano con fecha y marcarlo `estimado` con su derivación |
| Guion de la demo no se cumple con datos reales | Elegir los casos de la demo a partir de los datos (generador y compradores reales que muestren el contraste suelto vs pellet); no forzar números |
| Leaflet + SSR | Cargar el mapa con `dynamic(..., { ssr: false })` |
