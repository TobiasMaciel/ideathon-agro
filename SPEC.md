# Spec: Mapa Circular NEA — ¿Cierra el negocio?

> Estado: **APROBADO** (16/10/2026)
> Fuente: recomendación de [docs/desafio.md](docs/desafio.md#recomendación-para-este-desafío) (A1 + B1 + B2), más A3.
> Plazo: demo en **menos de 48 h**.

---

## Supuestos (corregir antes de aprobar)

1. **Ningún dato simulado.** Empresas, ubicaciones, precios y parámetros salen de fuentes públicas de Corrientes/NEA. Cada número lleva etiqueta `real` (tomado de una fuente) o `estimado` (calculado a partir de valores con fuente, con la fórmula a la vista) y su URL de fuente.
2. No hay login ni carga de datos por usuarios en el MVP. Los generadores y compradores vienen precargados en Supabase (seed). Por eso la API es **solo lectura**.
3. La distancia es la **línea recta** entre origen y destino multiplicada por un **factor de corrección por ruta** (por defecto 1,3: las rutas no son rectas, 100 km en línea recta ≈ 130 km de camino). Es un supuesto editable; con 1 queda línea recta pura. Sin ruteo real.
4. El mapa usa Leaflet con tiles de OpenStreetMap/CARTO, sin API key.
5. Front y back se despliegan juntos en **Cloudflare Workers** (Next.js + adaptador OpenNext). La base de datos es **Supabase** (Postgres): se entregan migraciones y seed listos, sin levantar Supabase local; el push se decide después.
7. Si faltan las variables de Supabase, la API sirve los mismos datos desde el módulo `src/data/` (fuente única de la que también se genera `supabase/seed.sql`), así la demo funciona antes de conectar la base.
6. La demo se ve en la web y desde el celular (responsive), en español.

---

## Objetivo

Que el dueño de un residuo (aserradero o molino) y un posible comprador vean **en un mapa** quién puede comprarle y **si el negocio cierra después de pagar el flete**. La respuesta es un número de margen y un semáforo.

**Usuarios:** generadores de residuos (aserraderos, molinos arroceros), compradores (secaderos, tambos, avícolas, viveros, centrales de biomasa) y el jurado de la ideathon.

### Alcance del MVP

| Id | Capacidad | Qué hace |
|---|---|---|
| A1 | Mapa de oferta | Muestra los generadores con material, t/mes, estacionalidad y calidad declarada. Se filtra por material. |
| A3 | Mapa de demanda | Muestra los compradores posibles por sector, con su consumo estimado y su combustible o insumo actual (GLP, leña, sustrato importado). |
| B1 | Calculadora de viabilidad | Se elige generador, comprador y estado del material (suelto, compactado o pellet). Calcula ingreso, flete, acondicionamiento, margen neto, semáforo y el ahorro del comprador frente a su alternativa actual. Los supuestos se pueden editar. |
| B2 | Radio de viabilidad | Dibuja un círculo con la distancia máxima a la que el margen es ≥ 0. Cambia al elegir suelto, compactado o pellet. |

**Fuera de alcance (MVP):** A2 (alta de residuos por formulario o WhatsApp), C1 (ficha técnica y QR), ruteo real, logística compartida (B3), login, pagos y panel de administración.

### Guion de la demo (≤ 2 minutos)

1. Se elige un aserradero de Santa Rosa: "80 t/mes de aserrín, 45% de humedad" (precargado).
2. El mapa muestra los compradores posibles alrededor (capa A3).
3. Con el material **suelto**, el radio de viabilidad es chico y solo el comprador a unos 30 km queda en verde.
4. Al cambiar a **pellet**, el radio se amplía y aparece un secadero de yerba en verde que **ahorra $X/mes frente al GLP**.
5. El semáforo queda en verde y el detalle del cálculo se ve con cada supuesto etiquetado.

---

## Modelo de cálculo (B1 / B2)

Funciones puras en `src/lib/viability/`, sin I/O y con tests unitarios.

```
carga_t      = min(cap_peso_t, cap_volumen_m3 × densidad_t_m3[estado])
viajes_mes   = ceil(cantidad_t_mes / carga_t)
distancia_km = haversine(origen, destino) × factor_tortuosidad
flete_mes    = viajes_mes × distancia_km × 2 × costo_km           # ida y vuelta
acond_mes    = cantidad_t_mes × costo_acond_t[estado]
ingreso_mes  = cantidad_t_mes × precio_t[material][estado]
margen_mes   = ingreso_mes − flete_mes − acond_mes
margen_pct   = margen_mes / ingreso_mes
semaforo     = verde si margen_pct ≥ 15% · amarillo si 0 ≤ margen_pct < 15% · rojo si margen_pct < 0

ahorro_comprador_mes = costo_alternativa_mes − (ingreso_mes + flete_mes si lo paga el comprador)
  con costo_alternativa por equivalencia energética (PCI) o sustitución de volumen (sustratos)

radio_max_km (B2) = (precio_t − costo_acond_t) × carga_t / (2 × costo_km × factor_tortuosidad)
```

Los parámetros (densidades, capacidades del camión, costo por km, precios, PCI, umbrales del semáforo) viven en Supabase (`assumptions`). Cada uno tiene `valor`, `unidad`, `etiqueta` (real/estimado), `fuente` y `fecha`, y el usuario puede editarlos en la UI solo para su sesión.

---

## Tech Stack

| Capa | Tecnología |
|---|---|
| Front + API | Next.js (App Router) + TypeScript, rutas `app/api/*` como back |
| Deploy | Cloudflare Workers mediante `@opennextjs/cloudflare` + `wrangler` |
| Base de datos | Supabase (Postgres), migraciones SQL versionadas |
| Mapa | Leaflet + react-leaflet (cargado solo en cliente) |
| Estilos | Tailwind CSS |
| Tests | Vitest (unitarios), Playwright (1 test e2e del guion de la demo) |

Las versiones exactas se fijan en el plan, verificadas contra la documentación oficial (skill `source-driven-development`).

## Commands

```
Dev:        npm run dev
Test:       npm test                  # vitest run
Test e2e:   npm run test:e2e          # playwright
Lint:       npm run lint
Typecheck:  npm run typecheck
Build:      npm run build
Preview CF: npm run preview           # opennextjs-cloudflare build && preview (runtime de Workers local)
Deploy:     npm run deploy            # opennextjs-cloudflare build && deploy
DB:         npx supabase db push      # aplica supabase/migrations
Seed:       npm run db:seed           # regenera supabase/seed.sql desde src/data/
```

## Project Structure

```
docs/desafio.md              → documento principal del desafío
SPEC.md                      → este spec
tasks/                       → plan.md y todo.md
src/app/                     → páginas (App Router)
src/app/api/                 → back: generators, buyers, assumptions (GET)
src/components/map/          → mapa Leaflet, capas, círculo de radio
src/components/calculator/   → panel de la calculadora y el semáforo
src/lib/viability/           → modelo de cálculo puro (+ *.test.ts al lado)
src/lib/db/                  → cliente Supabase del lado del servidor, repositorio y tipos
src/data/                    → datos con fuente (generadores, compradores, materiales, supuestos)
scripts/gen-seed.ts          → genera supabase/seed.sql desde src/data/
supabase/migrations/         → esquema SQL
supabase/seed.sql            → datos etiquetados (generado)
e2e/                         → test Playwright del guion de la demo
wrangler.jsonc, open-next.config.ts → configuración de Cloudflare
```

### Datos (Supabase)

- `materials`: id, nombre, densidades por estado, PCI, etiqueta.
- `generators`: id, nombre, tipo (aserradero/molino), material_id, t_mes, humedad, estacionalidad, lat, lng, etiqueta.
- `buyers`: id, nombre, sector, consumo_mes, alternativa_actual, costo_alternativa, lat, lng, etiqueta.
- `assumptions`: clave, valor, unidad, etiqueta, fuente.
- RLS activado: `select` para `anon`; sin `insert/update/delete` públicos.

## Code Style

TypeScript estricto. Lógica de dominio en funciones puras con nombres de dominio en español. La UI no calcula: solo llama a `lib/viability`.

```ts
// src/lib/viability/freight.ts
export type MaterialState = 'suelto' | 'compactado' | 'pellet';

export function truckLoadTons(densityTPerM3: number, truck: TruckSpec): number {
  return Math.min(truck.maxTons, truck.volumeM3 * densityTPerM3);
}
```

- Componentes en PascalCase, funciones en camelCase y archivos en kebab-case.
- Los montos se muestran en ARS, con la fecha del supuesto visible.
- Ningún número aparece en la UI sin su etiqueta `real` o `estimado` y acceso a su fuente.

## Testing Strategy

- **Unitarios (Vitest), obligatorios:** todo `src/lib/viability/`: carga del camión, viajes, flete, margen, semáforo (bordes en 0% y 15%), radio máximo y ahorro del comprador. Objetivo de cobertura: ≥ 90% en `lib/viability`.
- **API:** tests de las rutas con el cliente de Supabase mockeado (forma de la respuesta y errores).
- **E2E (Playwright):** un test que recorre el guion de la demo (elige el aserradero, ve compradores, cambia suelto a pellet, el semáforo pasa a verde).
- Escribir los tests primero para la lógica de cálculo (skill `test-driven-development`).

## Boundaries

- **Always:** correr `npm test` y `npm run typecheck` antes de cada commit; etiquetar cada dato; mantener las claves de Supabase solo en el servidor (`.dev.vars` / secrets de Wrangler); commits atómicos en español.
- **Ask first:** agregar dependencias fuera de este spec; cambiar el esquema después del seed; usar servicios pagos o APIs con key (ruteo, geocoding); sumar alcance (A2, C1, B3).
- **Never:** commitear secretos o la `service_role` key; exponer escrituras públicas en Supabase; mostrar números sin etiqueta ni fuente; inventar datos.

## Success Criteria

- [ ] El guion de la demo se puede recorrer completo en ≤ 2 minutos en la URL desplegada en Cloudflare Workers.
- [ ] El mapa muestra ≥ 10 generadores y ≥ 15 compradores leídos desde Supabase, filtrables por material o sector.
- [ ] Al cambiar suelto → compactado → pellet, el radio B2 y el semáforo se actualizan en < 200 ms, sin recargar la página.
- [ ] Con los datos del seed, el caso "aserrín suelto" da verde solo para el comprador cercano (~30 km) y "pellet" suma al menos un comprador lejano en verde.
- [ ] Cada número de la UI muestra su etiqueta y su fuente, y los supuestos se pueden editar en la sesión.
- [ ] `npm test`, `npm run typecheck`, `npm run lint` y el e2e pasan.
- [ ] Se usa bien desde el celular (viewport de 375 px).

## Decisiones tomadas

- Distancia: línea recta × factor de corrección por ruta editable (1,3 por defecto).
- Datos: solo fuentes reales de Corrientes/NEA, etiquetados `real` o `estimado`.
- Cuentas de Supabase y Cloudflare: fuera de alcance; el proyecto queda listo para `supabase db push` y `npm run deploy`.
- Ejecución: el MVP completo lo construye el agente orquestador con subagentes.
