<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/images/logo-dark.svg">
  <img src="docs/images/logo-light.svg" alt="Circular NEA" width="312" height="64">
</picture>

### ¿Cierra el negocio?

Un mapa de Corrientes donde quien genera residuos de madera o arroz y quien puede usarlos se encuentran,<br>
y cada match dice si vender cierra después de pagar el flete.

[![Node ≥22](https://img.shields.io/badge/Node-%E2%89%A522-3c873a?logo=nodedotjs&logoColor=white)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](tsconfig.base.json)
[![React 19](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](apps/web)
[![Hono en Cloudflare Workers](https://img.shields.io/badge/Hono-Cloudflare%20Workers-f38020?logo=cloudflare&logoColor=white)](apps/api)
[![PostgreSQL opcional](https://img.shields.io/badge/PostgreSQL-opcional-4169e1?logo=postgresql&logoColor=white)](packages/db)
[![Licencia MIT](https://img.shields.io/badge/licencia-MIT-4f8a6b)](LICENSE)

</div>

<!--
Capturas pendientes: generar docs/images/app-light.png y docs/images/app-dark.png (1440×900,
Molinos Ala en pellet con Frigorífico Duhalde elegido) y descomentar este bloque.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/images/app-dark.png">
    <img src="docs/images/app-light.png" alt="Circular NEA: mapa de Corrientes con Molinos Ala en pellet, el radio viable dibujado y el Frigorífico Duhalde en verde" width="900">
  </picture>
</p>
-->

---

## Qué resuelve

- **Hay residuo de sobra.** Corrientes produjo el 48,5 % del arroz del país en 2025/26 ([Bichos de Campo](https://bichosdecampo.com/se-confirma-la-retraccion-del-arroz-tras-perder-un-12-de-area-sembrada-la-produccion-cayo-14-en-la-campana-2025-26/)), y la cascarilla es el 20–22 % del grano: unas 140.000–157.000 t/año (estimación propia).
- **Mucho se quema.** Corrientes es la provincia más forestada del país, con 516.771 ha ([CONICET](https://ri.conicet.gov.ar/handle/11336/162643)). Solo en el parque foresto-industrial de Santa Rosa se estimaban 200.000 t/año de residuos de aserradero que se queman ([El Inversor Energético](https://www.elinversorenergetico.com/?p=16526)).
- **El flete decide.** La cascarilla suelta pesa 108 kg/m³ ([Dyna, UNAL](https://revistas.unal.edu.co/index.php/dyna)): el camión se llena de aire antes que de peso. Con los supuestos del modelo, pelletizarla multiplica por más de 5 la distancia a la que la venta sigue cerrando.

## Funcionalidades

- **Mapa de oferta y demanda:** 13 plantas que generan aserrín, chips, costaneros o cascarilla de arroz, y 10 compradores (centrales de biomasa, yerbateras, citrícola, secadero, frigorífico), filtrables por material y sector.
- **¿Cierra el negocio?:** se elige planta, comprador y estado del material (suelto, compactado o pellet) y se ve ingreso, flete, acondicionamiento, margen y un semáforo.
- **Ahorro del comprador** frente al GLP o la leña que usa hoy, convertido por energía útil.
- **Radio viable** dibujado en el mapa, que cambia con el estado del material.
- **Publicaciones abiertas:** cualquiera publica una oferta (*Vendo*) o una demanda (*Compro*) sin crear cuenta. Aparece marcada "sin verificar" y entra al cálculo como cualquier otro punto.
- **Contacto al hacer click:** el contacto no viaja con el catálogo; se pide aparte, con límite por IP y link de WhatsApp armado.
- **Avisos de match:** al publicar se muestran los matches que cierran, y una campanita avisa los nuevos para tus publicaciones (consulta cada 20 s, sin servicios externos).
- **Supuestos editables** para tu sesión (camión, costo por km, precios, factor de ruta).
- **Cada número con su origen:** etiqueta `real` o `estimado` y link a la fuente.
- **Tema claro y oscuro.**

## Cómo funciona el cálculo

Todo vive en `packages/core` como funciones puras con tests. La pantalla y `POST /api/viability` usan el mismo código.

```text
carga_t       = min(capacidad_peso_t, capacidad_volumen_m3 × densidad_t_m3[estado])
viajes_mes    = ceil(cantidad_t_mes / carga_t)
distancia_km  = línea recta (haversine) × factor de ruta (1,3 por defecto)
flete_mes     = viajes_mes × distancia_km × 2 × costo_km        # ida y vuelta
acond_mes     = cantidad_t_mes × costo_acondicionamiento_t[estado]
ingreso_mes   = cantidad_t_mes × precio_t[material][estado]
margen_mes    = ingreso_mes − flete_mes − acond_mes
margen_pct    = margen_mes / ingreso_mes
```

| Resultado | Regla |
|---|---|
| Semáforo del vendedor | Verde si `margen_pct` ≥ 15 %, amarillo entre 0 y 15 %, rojo si es negativo. |
| Ahorro del comprador | `costo de su alternativa − ingreso_mes`, con la alternativa convertida por energía útil (poder calorífico × eficiencia de caldera). El precio es puesto en destino: el flete lo paga el vendedor. |
| Semáforo del negocio | El del vendedor, salvo que el ahorro del comprador sea negativo: ahí es rojo ("no le conviene al comprador"). |
| Demanda en producto | `demanda_t × PCI_alt × ef_alt / (PCI_producto × ef_biomasa)`: el consumo del comprador está en toneladas de su combustible actual. |
| Radio viable | `(precio_t − costo_acond_t) × carga_t / (2 × costo_km)` por ruta, con camión lleno. En el mapa se divide por el factor de ruta. |

El factor de ruta 1,3 representa que 100 km en línea recta son unos 130 km de camino. No hay ruteo real; con factor 1 queda línea recta.

## Empezar en 2 minutos

Requisitos: Node 22 o superior y npm.

```bash
npm install
npm run dev
```

| Servicio | URL |
|---|---|
| Web | http://localhost:5173 |
| API | http://localhost:8787 (`/api/health` devuelve el estado) |

No hace falta base de datos: sin `DATABASE_URL`, la API sirve los datos de Corrientes incluidos en `packages/core/src/data` y guarda las publicaciones nuevas en memoria (se pierden al reiniciar la API).

Cada app por separado:

```bash
npm run dev:web   # solo la web, puerto 5173 (Vite hace proxy de /api a 127.0.0.1:8787)
npm run dev:api   # solo la API, puerto 8787 (wrangler dev)
```

## Con Postgres (opcional)

Sirve cualquier Postgres estándar (Docker local, Neon, Supabase, RDS): solo cambia `DATABASE_URL`.

1. Levantar una base local (o usar la URL de tu proveedor):

   ```bash
   docker compose up -d db
   ```

2. Copiar `.env.example` a `.env` en la raíz. Trae `DATABASE_URL=postgres://mapa:mapa@localhost:5432/mapa`, que coincide con `docker-compose.yml`.
3. Crear las tablas y cargar los datos (los dos scripts leen `.env` de la raíz si existe):

   ```bash
   npm run db:migrate
   npm run db:seed     # borra y reinserta los datos curados; no toca las publicaciones
   ```

4. La API no se conecta con el usuario dueño de las tablas. Las migraciones crean el rol `mapa_api` (lectura, más `INSERT` solo en publicaciones). Crear un usuario que lo herede:

   ```sql
   CREATE ROLE mapa_api_login LOGIN PASSWORD 'cambiar-esto' IN ROLE mapa_api;
   ```

5. Copiar `apps/api/.dev.vars.example` a `apps/api/.dev.vars` y completar:

   ```ini
   DATABASE_URL=postgres://mapa_api_login:cambiar-esto@localhost:5432/mapa
   IP_SALT=<texto-aleatorio>
   ```

6. Reiniciar `npm run dev`. `GET /api/health` pasa a informar el origen `database`.

Tras editar `packages/db/src/schema.ts`, `npm run db:generate` crea la migración nueva; `npm run db:studio` abre Drizzle Studio. Roles y pooling: [packages/db/README.md](packages/db/README.md).

## Arquitectura

Monorepo con npm workspaces: dos apps que comparten un paquete de dominio.

```text
apps/web  ──HTTP──▶  apps/api  ──▶  packages/db  ──▶  PostgreSQL (opcional)
   │                    │
   └────────┬───────────┘
            ▼
      packages/core   dominio: cálculo, validaciones, contratos, datos curados
```

| Capa | Tecnología |
|---|---|
| Web | Vite, React 19, TypeScript, Tailwind CSS 4, shadcn (Radix), Leaflet / react-leaflet, fuentes Geist |
| API | Hono + TypeScript en Cloudflare Workers (`wrangler`) |
| Dominio | TypeScript: funciones puras y datos, sin dependencias de runtime |
| Base | PostgreSQL + Drizzle ORM (`drizzle-orm`, `drizzle-kit`, driver `postgres`) |
| Tests | Vitest por workspace, PGlite para la base, Playwright para e2e |

Una fórmula se escribe una vez en `packages/core`, y la pantalla y la API dan el mismo resultado.

Más detalle:

- [docs/architecture.md](docs/architecture.md): capas, reglas de dependencia, estructura por workspace y flujo de un request.
- [docs/adr/](docs/adr/README.md): decisiones de arquitectura y su motivo.
- [docs/contributing.md](docs/contributing.md): convenciones, cómo agregar una feature y checklist de PR.

## API

Base local: `http://localhost:8787`.

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/health` | Estado y origen de los datos (`database` o `local`). |
| `GET` | `/api/catalog` | Materiales, alternativas, supuestos, fuentes, generadores y compradores, con las publicaciones abiertas mezcladas (sin contacto). |
| `GET` | `/api/generators?material=` | Generadores, filtrados por material. |
| `GET` | `/api/buyers?sector=&accepts=` | Compradores, filtrados por sector o por material que aceptan. |
| `POST` | `/api/viability` | Evalúa un match: `generatorId`, `buyerId`, `state` (`suelto`, `compactado`, `pellet`) y `overrides` opcionales. |
| `POST` | `/api/listings` | Crea una oferta o demanda "sin verificar". Valida el cuerpo y limita por IP (5 por hora, 20 por día). |
| `GET` | `/api/listings/:id/contact` | Contacto con link de WhatsApp. Limita por IP (30 por hora). Ver orden abajo. |

Contacto: para una publicación, el que dejó quien publicó; para un establecimiento curado, su contacto corporativo público (con fuente) si lo tiene; si no, el de la plataforma como intermediaria cuando `PLATFORM_CONTACT_PHONE` o `PLATFORM_CONTACT_EMAIL` están configurados; si no hay ninguno, 404.

CORS: la API acepta solo los orígenes de `ALLOWED_ORIGINS`.

## Scripts

Desde la raíz:

| Script | Qué hace |
|---|---|
| `npm run dev` | API (8787) y web (5173) en paralelo. |
| `npm run dev:web` / `npm run dev:api` | Cada app por separado. |
| `npm run build` | Build de todos los workspaces: API (dry-run de wrangler) y web (`tsc` + `vite build`). |
| `npm run verify` | `typecheck`, `lint` y `test` en secuencia. Correrlo antes de cada commit. |
| `npm run typecheck` | `tsc` en la raíz y en cada workspace. |
| `npm run lint` | ESLint sobre todo el repo. |
| `npm test` | Vitest en cada workspace. |
| `npm run test:e2e` | Playwright. |
| `npm run db:generate` | Genera migraciones SQL desde el esquema Drizzle. |
| `npm run db:migrate` | Aplica las migraciones a `DATABASE_URL`. |
| `npm run db:seed` | Carga los datos de `packages/core` en `DATABASE_URL`. |
| `npm run db:studio` | Abre Drizzle Studio. |

## Tests

- **Unitarios:** `npm test` corre Vitest en `packages/core`, `packages/db`, `apps/api` y `apps/web`. Uno solo: `npm test -w @mapa/core`. Los de `@mapa/db` usan PGlite (Postgres en memoria), sin Docker.
- **E2E:** la primera vez hay que instalar el navegador.

  ```bash
  npx playwright install chromium
  npm run test:e2e
  ```

  Playwright levanta la API y la web solo (puertos 8787 y 5173, o reutiliza las que ya estén corriendo). Los tests están en `e2e/`.

## Datos y fuentes

- Empresas, ubicaciones, precios y parámetros salen de fuentes públicas de Corrientes y el NEA. No hay datos inventados.
- Cada número lleva la etiqueta `real` (tomado de una fuente) o `estimado` (calculado desde valores con fuente) y un link a esa fuente, visible en la pestaña Fuentes.
- Las publicaciones abiertas se marcan **"sin verificar"**: sus valores los declara quien publica y entran al cálculo como `estimado`.
- Los establecimientos curados solo llevan contacto corporativo público (sitio, teléfono o email general de la empresa) con su fuente. Nunca contactos personales.

Los datos curados están en `packages/core/src/data` (`materials.ts`, `generators.ts`, `buyers.ts`, `assumptions.ts`, `sources.ts`, `contacts.ts`). Es la fuente única: de ahí leen la API sin base y el seed. Con Postgres, después de editarlos: `npm run db:seed`.

La investigación de contexto, con todas sus fuentes, está en [docs/desafio.md](docs/desafio.md).

## Despliegue

Hoy no hay nada desplegado; todo queda listo para hacerlo.

**API (Cloudflare Workers):**

```bash
cd apps/api
npx wrangler secret put DATABASE_URL   # usuario mapa_api_login, idealmente vía pooler o Hyperdrive
npx wrangler secret put IP_SALT
npx wrangler deploy
```

`ALLOWED_ORIGINS` (lista separada por comas) está en `vars` de `apps/api/wrangler.jsonc`; hoy vale `http://localhost:5173`. En producción, poner la URL de la web.

**Web (build estático):**

```bash
VITE_API_URL=https://<url-de-la-api> npm run build -w @mapa/web
```

Sale en `apps/web/dist`, para servir en Cloudflare (Workers assets o Pages). `VITE_API_URL` es la URL base del Worker, sin barra final.

Notas:

- El mapa base es Esri Canvas (gris claro u oscuro según el tema, sin API key) con la capa de nombres encima. Revisar los términos de Esri antes de un uso comercial.
- El límite por IP de la API es best-effort (memoria del Worker). En producción, sumar una regla de rate limiting de Cloudflare.

## Estructura del repositorio

```text
.
├── apps/
│   ├── api/              API HTTP: Hono sobre Cloudflare Workers
│   └── web/              Web: SPA de escritorio con Vite, React y Leaflet
├── packages/
│   ├── core/             Dominio: cálculo de viabilidad, validaciones, contratos y datos curados
│   └── db/               Postgres: esquema Drizzle, migraciones, seed y repositorios
├── e2e/                  Tests Playwright contra web y API juntas
├── docs/                 Arquitectura, ADRs, guía de contribución, diseño e investigación
├── scripts/              Utilidades del entorno de agentes de IA
├── tasks/                Plan y lista de tareas del proyecto
├── SPEC.md               Especificación del producto
├── AGENTS.md             Reglas para agentes de IA (CLAUDE.md y GEMINI.md lo importan)
├── docker-compose.yml    Postgres 17 local para desarrollo
├── playwright.config.ts  Configuración de e2e
└── LICENSE               Licencia MIT
```

## Trabajar con agentes de IA

El repo se trabaja con Claude Code y Gemini CLI. Las reglas compartidas están en [AGENTS.md](AGENTS.md) (`CLAUDE.md` y `GEMINI.md` lo importan), y las skills en `.claude/skills/` y `.agents/skills/`. Antes de tocar código, los agentes leen [docs/architecture.md](docs/architecture.md).

## Licencia

[MIT](LICENSE) © 2026 Equipo Circular NEA
