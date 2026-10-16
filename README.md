# Circular NEA: ¿Cierra el negocio?

Mapa de Corrientes donde quien genera residuos de madera o arroz y quien podría usarlos se encuentran, y donde cada match dice si vender cierra después de pagar el flete.

Proyecto de la Ideathon NEA Tech 2026 (Corrientes), Desafío 03 "Del subproducto al mercado".

Qué resuelve:

- **Para quien vende** (aserraderos, molinos arroceros): ve quién le puede comprar aserrín, chips, costaneros o cascarilla de arroz, y a qué distancia le sigue conviniendo.
- **Para quien compra** (centrales de biomasa, yerbateras, citrícolas, secaderos, frigoríficos): ve cuánto ahorra frente al GLP o la leña que usa hoy.
- **Para los dos**: el negocio se calcula según el material vaya suelto, compactado o en pellet, porque el estado cambia cuánto entra en el camión. Cualquiera puede publicar una oferta o una demanda (aparece "sin verificar") y el contacto se muestra al hacer click.

---

## Levantarlo en local

Requisitos: Node 22 o superior y npm.

```bash
npm install
npm run dev
```

- Web: http://localhost:5173
- API: http://localhost:8787 (`/api/health` indica el estado)

Sin base de datos alcanza: si no hay `DATABASE_URL`, la API usa los datos de Corrientes incluidos en `packages/core/src/data` y las publicaciones nuevas se guardan en memoria (se pierden al reiniciar la API).

Cada app por separado:

```bash
npm run dev:web   # solo el front, puerto 5173 (Vite hace proxy de /api a 127.0.0.1:8787)
npm run dev:api   # solo la API, puerto 8787 (wrangler dev)
```

## Con Postgres (opcional)

Sirve cualquier Postgres estándar: Docker local, Neon, Supabase, RDS, etc. Solo cambia `DATABASE_URL`.

1. Base local con Docker (o saltear este paso y usar la URL de tu proveedor):

   ```bash
   docker compose up -d db
   ```

2. Copiar `.env.example` a `.env` en la raíz. Trae `DATABASE_URL=postgres://mapa:mapa@localhost:5432/mapa`, que coincide con `docker-compose.yml`.
3. Crear tablas y cargar datos:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

   Los dos scripts leen `.env` de la raíz si existe. `db:seed` borra y reinserta los datos curados (no toca las publicaciones).

4. La API no debería conectarse con el usuario dueño de las tablas. Las migraciones crean el rol `mapa_api` (solo lectura, más insertar publicaciones). Creá un usuario que lo herede:

   ```sql
   CREATE ROLE mapa_api_login LOGIN PASSWORD 'cambiar-esto' IN ROLE mapa_api;
   ```

5. Copiar `apps/api/.dev.vars.example` a `apps/api/.dev.vars` y completar:

   ```
   DATABASE_URL=postgres://mapa_api_login:cambiar-esto@localhost:5432/mapa
   IP_SALT=<texto-aleatorio>
   ```

6. Reiniciar `npm run dev`. `GET /api/health` pasa a informar el origen `database`.

Otros comandos de la base:

```bash
npm run db:generate   # genera una migración nueva tras editar packages/db/src/schema.ts
npm run db:studio     # abre Drizzle Studio sobre DATABASE_URL
```

Detalle de roles y pooling en [packages/db/README.md](packages/db/README.md).

## Guion de la demo (2 minutos)

1. La app abre con **Molinos Ala (Mercedes)**: cascarilla de arroz, unas 1.615 t/mes.
2. Con la cascarilla **suelta**, el camión se llena de aire: el radio viable es de ~25 km por ruta. El **Frigorífico Duhalde** (Curuzú Cuatiá, ~88 km) queda en rojo.
3. Se pasa a **pellet**: el radio sube a ~310 km y Duhalde pasa a verde, con un ahorro de ≈ $15 M/mes frente al GLP.
4. **UTE BV** muestra los tres colores según el estado del material.
5. Una yerbatera que hoy quema leña barata queda en "no le conviene al comprador": el modelo no promete lo que no cierra.
6. Se **publica una oferta** en vivo desde el mapa y se ve su contacto al hacer click en "Ver contacto".

## Arquitectura

Monorepo con npm workspaces. Front y back son apps separadas que comparten un paquete de dominio.

```
apps/
  web/          Front: SPA estática (Vite + React + Leaflet). Consume la API por HTTP.
  api/          Back: Hono sobre Cloudflare Workers. Lee Postgres o, sin DATABASE_URL, los datos de core.
packages/
  core/         Dominio compartido: modelo de viabilidad, datos de Corrientes con fuentes,
                validación de supuestos y de publicaciones, tipos del contrato de la API.
  db/           Base: esquema Drizzle, migraciones SQL, seed y acceso a Postgres.
e2e/            Tests Playwright contra web y API levantadas juntas.
docs/           Desafío y dirección de diseño.
```

**Por qué `packages/`:** el front y el back usan el mismo modelo de cálculo y los mismos tipos. Una fórmula se escribe una vez en `packages/core`, y la pantalla y `POST /api/viability` dan el mismo resultado.

| Capa | Tecnología |
|---|---|
| Front | Vite, React 19, TypeScript, Tailwind CSS 4, Leaflet / react-leaflet, shadcn (Radix), fuentes Geist |
| Back | Hono + TypeScript en Cloudflare Workers (`wrangler`) |
| Dominio | TypeScript: funciones puras y datos, sin dependencias de runtime |
| Base | PostgreSQL + Drizzle ORM (`drizzle-orm`, `drizzle-kit`, driver `postgres`) |
| Tests | Vitest por workspace, PGlite para la base, Playwright para e2e |

La estética (dashboard oscuro, sobrio, con mapa oscuro a pantalla completa) está en [docs/design.md](docs/design.md). La especificación completa, en [SPEC.md](SPEC.md).

## API

Base: `http://localhost:8787`.

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/health` | Estado y origen de los datos (`database` o `local`). |
| GET | `/api/catalog` | Materiales, alternativas, supuestos, fuentes, generadores y compradores, con las publicaciones abiertas mezcladas (sin contacto). |
| GET | `/api/generators?material=` | Generadores, filtrados por material. |
| GET | `/api/buyers?sector=&accepts=` | Compradores, filtrados por sector o por material que aceptan. |
| POST | `/api/viability` | Evalúa un match: `generatorId`, `buyerId`, `state` (`suelto`, `compactado`, `pellet`) y `overrides` opcionales. |
| POST | `/api/listings` | Crea una oferta o demanda, marcada "sin verificar". Valida el cuerpo y limita por IP (5 por hora, 20 por día). |
| GET | `/api/listings/:id/contact` | Contacto de una publicación (WhatsApp, teléfono o email), con link de WhatsApp. Limita por IP (30 por hora). Los establecimientos curados no tienen contacto y responden 404. |

CORS: la API solo acepta los orígenes de `ALLOWED_ORIGINS`.

## Cómo se calcula

Todo está en `packages/core` como funciones puras con tests.

```
carga_t       = min(capacidad_peso_t, capacidad_volumen_m3 × densidad_t_m3[estado])
viajes_mes    = ceil(cantidad_t_mes / carga_t)
distancia_km  = línea recta (haversine) × factor de ruta (1,3 por defecto)
flete_mes     = viajes_mes × distancia_km × 2 × costo_km        # ida y vuelta
acond_mes     = cantidad_t_mes × costo_acondicionamiento_t[estado]
ingreso_mes   = cantidad_t_mes × precio_t[material][estado]
margen_mes    = ingreso_mes − flete_mes − acond_mes
margen_pct    = margen_mes / ingreso_mes
```

- **Semáforo del vendedor:** verde si el margen es 15 % o más, amarillo entre 0 y 15 %, rojo si es negativo.
- **Ahorro del comprador:** `costo de su alternativa (GLP, leña) − ingreso_mes`, con la alternativa convertida por energía útil (poder calorífico × eficiencia de la caldera). El precio es puesto en destino: el vendedor paga el flete.
- **Semáforo del negocio:** el del vendedor, salvo que el ahorro del comprador sea negativo: ahí es rojo ("no le conviene al comprador").
- **Demanda convertida por energía:** el consumo del comprador está en toneladas de su combustible actual; se pasa a toneladas de producto con `demanda_t × PCI_alt × ef_alt / (PCI_producto × ef_biomasa)`.
- **Radio viable con camión lleno:** `(precio_t − costo_acond_t) × carga_t / (2 × costo_km)` por ruta. Para dibujar el círculo se divide por el factor de ruta (1,3).
- **Factor de ruta 1,3:** las rutas no son rectas; 100 km en línea recta equivalen a unos 130 km de camino. No hay ruteo real y el factor se puede editar (con 1 queda línea recta).

Los supuestos (densidades, camión, costo por km, precios, poderes caloríficos, umbrales) se pueden editar en la pestaña Supuestos, solo para tu sesión.

## Datos

- Empresas, ubicaciones, precios y parámetros salen de fuentes públicas de Corrientes y el NEA. No hay datos inventados.
- Cada número lleva la etiqueta `real` (tomado de una fuente) o `estimado` (calculado desde valores con fuente) y un link a esa fuente (pestaña Fuentes).
- Las publicaciones abiertas se marcan **"sin verificar"**: sus valores son declarados por quien publica y entran al cálculo como `estimado`.
- Los establecimientos curados no tienen contacto cargado: no se inventan teléfonos ni emails de terceros.

**Editar los datos curados:** están en `packages/core/src/data` (`materials.ts`, `generators.ts`, `buyers.ts`, `assumptions.ts`, `sources.ts`). Es la fuente única: de ahí leen la API sin base y el seed. Con Postgres, después de editar:

```bash
npm run db:seed
```

## Scripts

Desde la raíz:

| Script | Qué hace |
|---|---|
| `npm run dev` | API (8787) y web (5173) en paralelo. |
| `npm run dev:web` | Solo el front. |
| `npm run dev:api` | Solo la API. |
| `npm run build` | Build de todos los workspaces: API (dry-run de wrangler) y web (`tsc` + `vite build`). |
| `npm run typecheck` | `tsc` en la raíz y en cada workspace. |
| `npm run lint` | ESLint sobre todo el repo. |
| `npm test` | Vitest en cada workspace. |
| `npm run test:e2e` | Playwright. |
| `npm run db:generate` | Genera migraciones SQL desde el esquema Drizzle. |
| `npm run db:migrate` | Aplica las migraciones a `DATABASE_URL`. |
| `npm run db:seed` | Carga los datos de `packages/core` en `DATABASE_URL`. |
| `npm run db:studio` | Abre Drizzle Studio. |

## Tests

- **Unitarios:** `npm test` corre Vitest en `packages/core`, `packages/db`, `apps/api` y `apps/web`. Se puede correr uno solo, por ejemplo `npm test -w @mapa/core`. Los de `@mapa/db` usan PGlite (Postgres en memoria): no necesitan Docker.
- **E2E (Playwright):** la primera vez, instalar el navegador:

  ```bash
  npx playwright install chromium
  npm run test:e2e
  ```

  Playwright levanta solo la API y la web con `npm run dev:api` y `npm run dev:web`. Los tests están en `e2e/`.

## Desplegar

Cuando quieran. Hoy no hay nada desplegado.

**API (Cloudflare Workers):**

```bash
cd apps/api
npx wrangler secret put DATABASE_URL   # URL del usuario mapa_api_login (idealmente vía pooler o Hyperdrive)
npx wrangler secret put IP_SALT
npx wrangler deploy
```

`ALLOWED_ORIGINS` (lista separada por comas) se define en `vars` de `apps/api/wrangler.jsonc`; hoy vale `http://localhost:5173`. En producción, poner la URL de la web.

**Web (build estático):**

```bash
VITE_API_URL=https://<url-de-la-api> npm run build -w @mapa/web
```

Sale en `apps/web/dist`, para servir en Cloudflare (Workers assets o Pages). `VITE_API_URL` es la URL base del Worker de la API, sin barra final.

Notas:

- El mapa base es Esri World Dark Gray Canvas (oscuro y plano, sin API key) con la capa de nombres encima. Revisar los términos de Esri antes de un uso comercial.
- El límite de envíos por IP de la API es best-effort (memoria del Worker). En producción, sumar una regla de rate limiting de Cloudflare.

## Trabajar con agentes

Este repo se trabaja con Claude Code y Gemini CLI.

- Las reglas compartidas están en [AGENTS.md](AGENTS.md); `CLAUDE.md` y `GEMINI.md` lo importan.
- Las skills viven en `.claude/skills/` (Claude Code) y `.agents/skills/` (Gemini CLI).
- Para UI hay skills de estética (`minimalist-ui`, `better-ui`, `better-layout`, `better-typography`, `better-colors`, `better-accessibility`, `better-writing`).
- `/orchestrate` arma el trabajo con un agente principal que reparte tareas a subagentes más chicos.
