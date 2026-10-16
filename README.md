# Mapa Circular NEA: ¿Cierra el negocio?

MVP de la Ideathon NEA Tech 2026 (Corrientes), para el Desafío 03 "Del subproducto al mercado". Muestra en un mapa quién genera residuos de madera y arroz (aserraderos y molinos arroceros) y quién podría comprarlos, y calcula si la venta cierra después de pagar el flete.

Qué resuelve:

- **Mapa de oferta:** generadores de aserrín, chips, costaneros y cascarilla, con toneladas por mes, estacionalidad y ubicación.
- **Mapa de demanda:** compradores posibles (centrales a biomasa, secaderos de yerba, citrícola, secadero de arroz, frigorífico) y su combustible actual (GLP o leña).
- **Calculadora:** margen neto, semáforo y radio de viabilidad según el material esté suelto, compactado o en pellet, más el ahorro del comprador frente a su combustible actual.

Estado: el proyecto corre en local. No está desplegado en Cloudflare y no está conectado a Supabase.

## Probarlo en 1 minuto

Requisitos: Node.js 22 o superior (probado con Node 24) y npm. Lo fija el campo `engines` de `package.json`.

```bash
npm install
npm run dev
```

Abrir http://localhost:3000.

Sin configurar nada, la API responde con los datos de `src/data/`. El badge "Datos: locales (src/data)" lo indica. No hace falta Supabase para probar.

## Guion de la demo (2 minutos)

Valores con los supuestos por defecto, verificados en pantalla y en `npm run test:e2e`.

1. La app abre con **Molinos Ala (Adecoagro), Mercedes**: unas 1.615 t/mes de cascarilla de arroz (estimado con fuente).
2. El mapa muestra los compradores posibles. En el ranking, elegir el **Frigorífico Duhalde** (Curuzú Cuatiá, ~88 km por ruta). Hoy usa GLP: unas 15 t/mes (estimado).
3. Estado **suelto**: semáforo **rojo** (margen ≈ −280 %). La cascarilla suelta pesa 108 kg/m³: el camión se llena de aire y el flete se come todo. Radio viable: unos **25 km** por ruta.
4. Cambiar a **pellet**: semáforo **verde** (margen ≈ +23 %). El radio salta a unos **310 km** por ruta y el círculo del mapa crece. El frigorífico **ahorra ≈ $15 M/mes frente al GLP**.
5. Elegir **UTE BV** (Bella Vista, ~156 km) para mostrar los tres colores: suelto rojo, compactado amarillo, pellet verde.
6. Elegir una yerbatera que hoy quema leña (por ejemplo Las Marías) en pellet: el semáforo queda en rojo con "No le conviene al comprador". El modelo no vende humo: el pellet le gana al GLP, no a la leña barata.
7. Abrir **Supuestos**, poner el costo por km en 6000 y ver cómo Duhalde en pellet pasa a amarillo. "Restablecer" vuelve a los valores con fuente.

El círculo del mapa usa línea recta (radio por ruta ÷ 1,3), por eso se dibuja más chico que el radio que muestra el panel.

## Cómo funciona el cálculo

El cálculo está en funciones puras en `src/lib/viability/index.ts` (sin I/O). `src/lib/match/index.ts` arma las entradas a partir de los datos.

```
carga por camión (t)   = min(carga máx., volumen caja × densidad del estado)
toneladas/mes          = min(producción del origen ajustada por humedad, demanda del comprador)
viajes/mes             = ceil(toneladas/mes ÷ carga por camión)
distancia (km)         = distancia en línea recta × factor de ruta (1,3)
flete/mes              = viajes × distancia × 2 × costo por km      (ida y vuelta)
acondicionamiento/mes  = toneladas × costo de acondicionamiento por t del estado
ingreso/mes            = toneladas × precio por t del estado
margen/mes             = ingreso − flete − acondicionamiento
margen %               = margen / ingreso
semáforo vendedor      = verde si margen % ≥ 15 % · amarillo si 0 ≤ margen % < 15 % · rojo si < 0
semáforo del negocio   = el del vendedor, pero rojo si al comprador no le conviene (ahorro < 0)
radio máx. (ruta, km)  = (precio − acondicionamiento) × carga por camión / (2 × costo por km)
ahorro comprador/mes   = costo con su combustible actual − toneladas × precio por t
```

- **Factor de ruta (1,3):** las rutas no son rectas. 100 km en línea recta equivalen a unos 130 km de camino. Es un supuesto editable; con 1 queda la línea recta.
- **Ahorro:** el costo con el combustible actual se calcula por equivalencia energética (poder calorífico, eficiencia de cada equipo y precio del combustible). El precio es *puesto en destino*: el vendedor paga el flete, así que el comprador solo paga toneladas × precio.
- **Demanda:** el consumo del comprador está en t/mes de su combustible actual (GLP o leña) y se convierte a toneladas del producto por energía útil.
- **Radio y semáforo** usan el mismo costo por km y el mismo acondicionamiento que el margen, así que ambos cambian juntos al editar un supuesto.

## Datos

Todos los datos viven en el código, en `src/data/`:

| Archivo | Contenido |
|---|---|
| `generators.ts` | Generadores (aserraderos y molinos): 13 entradas |
| `buyers.ts` | Compradores posibles: 10 entradas |
| `materials.ts` | Materiales y sus estados (suelto, compactado, pellet) |
| `assumptions.ts` | Supuestos editables: costo por km, carga del camión, factor de ruta, umbral verde, dólar |
| `sources.ts` | Fuentes con título, URL y fecha |
| `types.ts` | Tipos compartidos |

**Etiquetas.** Cada valor tiene `tag`, `sourceIds` y `note`:

- `real`: tomado de una fuente publicada.
- `estimado`: calculado a partir de valores con fuente. La `note` muestra la fórmula.

Algunos supuestos no tienen fuente pública (por ejemplo, el volumen de la caja del camión o el umbral verde del 15 %). Lo dicen en su nota y la UI los marca como "Sin fuente publicada: supuesto del proyecto".

**Coordenadas.** Son el centro de cada localidad según OpenStreetMap Nominatim (16/10/2026). Cuando varias empresas caen en la misma localidad, se desplazan unos 1 km para que no se superpongan en el mapa; la nota lo indica.

**Editar datos:**

1. Cambiar los valores en `src/data/*.ts`. Con el servidor de desarrollo corriendo, la API local usa los cambios.
2. Regenerar el SQL de carga: `npm run db:seed`. Esto escribe `supabase/seed.sql`, que tiene una cabecera que dice "No editar a mano".

## Arquitectura

- **Una sola app Next.js** (App Router, TypeScript). Las páginas están en `src/app/` y el back son las rutas `src/app/api/*/route.ts`. Front y back se despliegan juntos.
- **Mapa:** Leaflet con react-leaflet, cargado solo en el cliente. Los tiles son de OpenStreetMap y no requieren API key.
- **Origen de datos:** `getDataSet()` en `src/server/repository.ts`. Si están `SUPABASE_URL` y `SUPABASE_ANON_KEY`, lee Supabase. Si faltan, o si la consulta falla, usa `src/data/` (en ese caso loguea el error en la consola del servidor). El campo `origin` de cada respuesta indica qué se usó (`"supabase"` o `"local"`).
- **Lógica de la UI:** la calculadora llama a la API; los números los calcula `src/lib/viability/`.

### Endpoints

Todas las respuestas son JSON y llevan `Cache-Control: no-store`. Los errores tienen la forma `{ "error": "..." }`.

| Método | Ruta | Parámetros | Respuesta |
|---|---|---|---|
| GET | `/api/catalog` | ninguno | `{ origin, sources, materials, alternatives, assumptions, generators, buyers }` |
| GET | `/api/generators` | `material` (opcional): `aserrin`, `chips`, `costaneros` o `cascarilla` | `{ origin, generators }`. 400 si el material no existe |
| GET | `/api/buyers` | `sector` (opcional): `yerbatera`, `central_biomasa`, `citricola`, `secadero_granos` o `frigorifico`; `accepts` (opcional): id de material | `{ origin, buyers }`. 400 si el sector o el material no existen |
| POST | `/api/viability` | Cuerpo JSON: `generatorId`, `buyerId`, `state` (`suelto`, `compactado` o `pellet`) y `overrides` (opcional) | `{ origin, request, result }` |

`overrides` admite las claves `costPerKm`, `truckMaxTons`, `truckVolumeM3`, `routeFactor`, `greenThreshold` y `usdArs`. Cada valor debe ser un número mayor que 0. `greenThreshold` debe ser menor que 1.

Errores de `POST /api/viability`:

- **400:** el cuerpo no es JSON válido, faltan campos o `overrides` tiene una clave o un valor inválido.
- **404:** no existe el generador, el comprador o el material.
- **422:** el material no está disponible en ese estado, o el comprador no acepta el material.

`result` incluye, entre otros: `distanceKm`, `productTonsPerMonth`, `truckLoadTons`, `tripsPerMonth`, `revenuePerMonth`, `freightPerMonth`, `conditioningPerMonth`, `marginPerMonth`, `marginPct`, `light` (`verde`, `amarillo` o `rojo`), `buyerSavingsPerMonth` y `maxViableDistanceKm`.

### Estructura de carpetas

```
src/
  app/                páginas (App Router) y api/ (back)
    api/catalog, generators, buyers, viability
  components/
    app/              carga del catálogo y estado de la app
    map/              mapa Leaflet, capas y círculo de radio
    panel/            filtros, calculadora, semáforo, supuestos y fuentes
  lib/
    viability/        cálculo puro (+ tests *.test.ts)
    match/            arma las entradas del cálculo a partir de los datos
    api/types.ts      contrato de la API
    db/               cliente Supabase (supabase.ts) y filas <-> tipos (rows.ts)
  server/             repository.ts (Supabase o src/data), http.ts
  data/               datos con fuente
scripts/gen-seed.ts   genera supabase/seed.sql desde src/data/
supabase/
  migrations/         esquema SQL (init)
  seed.sql            datos etiquetados (generado)
e2e/                  test Playwright
docs/desafio.md       enunciado y research del desafío
SPEC.md               especificación del MVP
AGENTS.md             reglas para agentes
```

## Scripts

Los scripts están en `package.json`.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo de Next.js en http://localhost:3000 |
| `npm run build` | Build de producción de Next.js |
| `npm run start` | Sirve el build de `next build` |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Tests unitarios con Vitest (`vitest run`) |
| `npm run test:watch` | Vitest en modo watch |
| `npm run test:e2e` | Tests Playwright. Levanta `npm run dev` si no hay servidor corriendo |
| `npm run preview` | Build con OpenNext para Cloudflare y preview en el runtime local de Workers. No despliega |
| `npm run deploy` | Build con OpenNext y deploy a Cloudflare Workers. **No ejecutar todavía** (ver más abajo) |
| `npm run cf-typegen` | Genera `cloudflare-env.d.ts` con los tipos de los bindings de Wrangler |
| `npm run db:seed` | Regenera `supabase/seed.sql` desde `src/data/` |

## Tests

- **Unitarios (Vitest):** `npm test`. Cubren, entre otros, `src/lib/viability/`, `src/lib/match/`, `src/data/`, las rutas de la API y los componentes del mapa y el estado de la app.
- **E2E (Playwright):** la primera vez instalar el navegador con `npx playwright install chromium`. Después, `npm run test:e2e`. Hoy el test de `e2e/smoke.spec.ts` solo verifica el título y el encabezado de la home. El recorrido completo del guion de la demo todavía no está escrito.
- **Calidad:** `npm run typecheck` y `npm run lint`.

## Conectar Supabase (cuando quieran)

Esto está documentado y **no se ejecutó todavía**. La base es Postgres en Supabase, con la migración y el seed ya listos en el repo.

1. Crear un proyecto en Supabase.
2. Vincular el repo con el proyecto:

   ```bash
   npx supabase login                     # si ya iniciaste sesión, no hace falta
   npx supabase link --project-ref <ref>  # <ref> está en la URL del proyecto en el dashboard
   ```

3. Aplicar la migración `supabase/migrations/20261016000000_init.sql`:

   ```bash
   npx supabase db push
   ```

   La migración crea las tablas `sources`, `materials`, `material_states`, `alternatives`, `assumptions`, `generators` y `buyers`, con RLS activado. La lectura es pública para `anon` y `authenticated`, y no hay políticas de escritura.

4. Cargar los datos con `supabase/seed.sql`. Se puede pegar el contenido en el SQL Editor de Supabase o correrlo con `psql`:

   ```bash
   psql "<connection string de la base>" -f supabase/seed.sql
   ```

   El seed corre en una transacción y empieza con `truncate ... cascade`, así que se puede volver a correr para recargar los datos: reemplaza todo el contenido de las 7 tablas. Si cambiás algo en `src/data/`, regeneralo con `npm run db:seed` antes de cargarlo.

5. Configurar las variables `SUPABASE_URL` y `SUPABASE_ANON_KEY`:

   - **Desarrollo (`npm run dev`):** copiar `.env.example` a `.env.local` y completar los valores.
   - **Preview de Workers (`npm run preview`):** copiar `.dev.vars.example` a `.dev.vars`.
   - **Producción:** secrets de Wrangler:

     ```bash
     npx wrangler secret put SUPABASE_URL
     npx wrangler secret put SUPABASE_ANON_KEY
     ```

   Los archivos `.env*.local` y `.dev.vars` están en `.gitignore`. En Workers, OpenNext expone las variables y secrets del Worker en `process.env`, que es donde las lee `src/lib/db/supabase.ts`.

**Importante:**

- Usar solo la **anon key**. Nunca la `service_role`, ni en el repo ni en las variables.
- Las claves van solo del lado del servidor. No ponerlas en el código del front.
- Con Supabase conectado, el badge pasa a "Datos: Supabase".

## Desplegar a Cloudflare Workers (cuando quieran)

**No se ejecutó todavía.** No hay cuenta de Cloudflare configurada ni deploy hecho.

1. Probar el runtime de Workers en local:

   ```bash
   npm run preview
   ```

2. Iniciar sesión en Wrangler (abre el navegador):

   ```bash
   npx wrangler login
   ```

3. Cargar las variables de Supabase como secrets (ver el paso 5 de la sección anterior).

4. Desplegar:

   ```bash
   npm run deploy
   ```

La configuración está en `wrangler.jsonc` (nombre del Worker `mapa-circular-nea`, `main` en `.open-next/worker.js`, assets en `.open-next/assets`, `nodejs_compat`) y en `open-next.config.ts`. `npm run preview` ya se probó en local (runtime de Workers en http://localhost:8787, la API responde). `npm run deploy` no se ejecutó.

## Trabajar con agentes (Claude Code / Gemini CLI)

- Las reglas compartidas están en `AGENTS.md`. `CLAUDE.md` y `GEMINI.md` lo importan y agregan lo específico de cada CLI.
- Las skills están en `.claude/skills/` (Claude Code) y `.agents/skills/` (Gemini CLI), con el mismo contenido.
- Comandos del ciclo de vida: `/spec` → `/planning` → `/build` → `/test` → `/review` → `/code-simplify` → `/ship`. Para trabajos grandes, `/orchestrate` coordina subagentes.
- Para actualizar las skills: `bash scripts/sync-agent-skills.sh`.

## Equipo

Equipo Ideathon NEA Tech 2026.
