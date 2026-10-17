# Spec: Mapa Circular NEA — ¿Cierra el negocio?

> Estado: **APROBADO** (16/10/2026)
> Fuente: recomendación de [docs/desafio.md](docs/desafio.md#recomendación-para-este-desafío) (A1 + B1 + B2), más A3.
> Plazo: demo en **menos de 48 h**.

---

## Supuestos

1. **Ningún dato simulado.** Empresas, ubicaciones, precios y parámetros salen de fuentes públicas de Corrientes/NEA. Cada número lleva etiqueta `real` (tomado de una fuente) o `estimado` (calculado a partir de valores con fuente, con la fórmula a la vista) y su URL de fuente.
2. No hay login ni cuentas de usuario. La carga de publicaciones (oferta y demanda) es abierta y sin cuenta ("sin verificar", con límite por IP). Los generadores y compradores del mapa base vienen precargados en el catálogo curado (seed).
3. La distancia es la **línea recta** entre origen y destino multiplicada por un **factor de corrección por ruta** (por defecto 1,3: las rutas no son rectas, 100 km en línea recta ≈ 130 km de camino). Es un supuesto editable; con 1 queda línea recta pura. Sin ruteo real.
4. El mapa usa Leaflet con tiles de OpenStreetMap/CARTO, sin API key.
5. Front y back son **dos apps separadas** (ver Arquitectura v2). La API corre en **Cloudflare Workers** (Hono) y la base es **PostgreSQL estándar** accedida con **Drizzle ORM**, sin depender de ningún proveedor (Docker local, Neon, Supabase, RDS…: solo cambia `DATABASE_URL`). Se entregan esquema, migraciones y seed listos; demo web desplegada en Vercel.
6. **Solo web de escritorio** (1280 px o más), en español. Mobile fuera de alcance (decisión del usuario, 16/10/2026).
7. Si falta `DATABASE_URL`, la API sirve los mismos datos desde `packages/core/src/data/` (fuente única de la que también sale el seed de la base), así la demo funciona antes de conectar la base.

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

**Fuera de alcance (MVP inicial):** C1 (ficha técnica y QR), ruteo real, logística compartida (B3), login, pagos y panel de administración. *Nota:* la carga abierta de ofertas y demandas (A2) con contacto WhatsApp fue incorporada en la fase F1 y está 100% implementada.

### Guion de la demo (≤ 2 minutos)

1. La app abre con **Molinos Ala (Adecoagro), Mercedes**: ~1.615 t/mes de cascarilla de arroz (estimado con fuente).
2. El mapa muestra los compradores posibles (capa A3): centrales de biomasa, yerbateras, citrícola, secadero de arroz, frigorífico.
3. Con la cascarilla **suelta** (108 kg/m³, el camión se llena de aire) el radio viable es de ~25 km por ruta: solo el secadero vecino cierra; el **Frigorífico Duhalde** en Curuzú Cuatiá (~88 km) queda en rojo.
4. Al pasar a **pellet**, el radio salta a ~310 km y Duhalde pasa a verde: al vendedor le cierra y el frigorífico **ahorra $X/mes frente al GLP**. Los compradores que hoy queman leña barata quedan en rojo con "no le conviene al comprador" (honestidad del modelo).
5. El semáforo queda en verde y el detalle del cálculo se ve con cada supuesto etiquetado.

---

## Publicaciones abiertas (F1: oferta y demanda)

Decisiones del usuario (16/10/2026): el mapa es un **punto en común** donde vendedores y compradores publican su oferta o demanda.

- **Acceso abierto, sin cuenta.** Cada publicación se ve en el mapa marcada **"sin verificar"**. Límite de envíos por IP (best-effort en el Worker; en producción, regla de rate limiting de Cloudflare).
- **Qué se publica:** *Vendo* (oferta) o *Compro* (demanda), con material, toneladas por mes, ubicación (click en el mapa), localidad y nombre del establecimiento. Oferta: humedad y estacionalidad. Demanda: combustible actual (GLP o leña), su consumo mensual y el sector.
- **Entra al cálculo** como cualquier generador o comprador: aparece en el ranking, en el radio y en el semáforo. Los valores declarados van con etiqueta `estimado` y nota "declarado por quien publicó, sin verificar".
- **Contacto al hacer click:** quien publica deja WhatsApp/teléfono y/o email (al menos uno). El contacto **no** viaja en el catálogo: se pide con `GET /api/listings/:id/contact` al tocar "Ver contacto" (con límite por IP) e incluye un link de WhatsApp con mensaje armado. Los establecimientos curados (empresas reales) llevan solo su **contacto corporativo público** (sitio web, teléfono o email general publicados por la empresa o un directorio comercial), cada dato con su fuente; nunca contactos personales ni datos inventados. Si no hay dato público, no tienen contacto.
- **Notificaciones de match (sin servicios externos):** al publicar se muestran los matches que cierran; una campanita avisa matches nuevos para las publicaciones propias (recordadas en el navegador), consultando novedades cada ~20 s. Email y WhatsApp automáticos quedan para el roadmap.
- **Aspecto de producto en producción:** la UI no muestra el origen de los datos ni textos de entorno (local, demo, base); eso solo queda en `GET /api/health`.
- **Persistencia:** con `DATABASE_URL`, tabla `listings` en Postgres (Drizzle). El rol de la API tiene `INSERT` solo en `listings`. Sin base, las publicaciones viven en memoria de la API (modo demo: se pierden al reiniciar).
- **API:** `POST /api/listings` (validación estricta, tope de body, límites de texto y de coordenadas al NEA); `GET /api/catalog` incluye las publicaciones mezcladas con los datos curados, con `origin: 'publicacion'` y `verified: false`.

## Modelo de cálculo (B1 / B2)

Funciones puras en `packages/core/src/domain/viability/`, sin I/O y con tests unitarios.

```
carga_t      = min(cap_peso_t, cap_volumen_m3 × densidad_t_m3[estado])
viajes_mes   = ceil(cantidad_t_mes / carga_t)
distancia_km = haversine(origen, destino) × factor_tortuosidad
flete_mes    = viajes_mes × distancia_km × 2 × costo_km           # ida y vuelta
acond_mes    = cantidad_t_mes × costo_acond_t[estado]
ingreso_mes  = cantidad_t_mes × precio_t[material][estado]
margen_mes   = ingreso_mes − flete_mes − acond_mes
margen_pct   = margen_mes / ingreso_mes
semaforo_vendedor = verde si margen_pct ≥ 15% · amarillo si 0 ≤ margen_pct < 15% · rojo si margen_pct < 0

# El precio es "puesto en destino": el vendedor paga el flete y el comprador paga solo ingreso_mes.
ahorro_comprador_mes = costo_alternativa_mes − ingreso_mes
  con costo_alternativa por equivalencia energética (PCI × eficiencia de caldera) o sustitución de volumen (sustratos)

semaforo_negocio = semaforo_vendedor, salvo rojo si ahorro_comprador_mes < 0 (al comprador no le conviene)

# La demanda del comprador está en t de su combustible actual; se convierte a t del producto por energía útil:
demanda_producto_t = demanda_t × PCI_alt × ef_alt / (PCI_producto × ef_biomasa)

radio_max_km (B2) = (precio_t − costo_acond_t) × carga_t / (2 × costo_km)   # por ruta, con camión lleno
radio_mapa_km     = radio_max_km / factor_ruta                            # línea recta, para dibujar
```

Los parámetros (densidades, capacidades del camión, costo por km, precios, PCI, umbrales del semáforo) viven en la base (`assumptions`). Cada uno tiene `valor`, `unidad`, `etiqueta` (real/estimado), `fuente` y `fecha`, y el usuario puede editarlos en la UI solo para su sesión.

---

## Arquitectura (v2: front y back separados)

Monorepo con **npm workspaces**. El front y el back son dos apps independientes que comparten un paquete de dominio.

Estructura por capas, reglas de dependencia y flujo de un request: [docs/architecture.md](docs/architecture.md). Decisiones y sus motivos: [docs/adr/](docs/adr/README.md).

```
apps/
  api/        → BACK: Hono sobre Cloudflare Workers (wrangler). Lee Postgres vía Drizzle o, sin DATABASE_URL, los datos de core.
  web/        → FRONT: Vite + React + TypeScript + Tailwind + Leaflet (SPA estática). Consume la API por HTTP.
packages/
  core/       → DOMINIO compartido: modelo de viabilidad, adaptador match, validación de supuestos,
                datos de Corrientes con fuentes, tipos del contrato de la API.
  db/         → BASE: esquema Drizzle, migraciones SQL (drizzle-kit), seed y repositorio Postgres.
docker-compose.yml → Postgres 17 local opcional para desarrollo
e2e/          → Playwright contra web + api levantados juntos
docs/         → desafío y dirección de diseño
```

| Capa | Tecnología |
|---|---|
| Back | Hono + TypeScript en Cloudflare Workers (`wrangler dev` en local, puerto 8787); conexión con `DATABASE_URL` desde bindings |
| Front | Vite + React 19 + TypeScript + Tailwind CSS 4 + Leaflet/react-leaflet (puerto 5173); en dev, Vite hace proxy de `/api` a la API |
| Dominio | Paquete TypeScript sin dependencias de runtime (funciones puras + datos) |
| Base | PostgreSQL 15+ cualquiera + Drizzle ORM (`drizzle-orm`, `drizzle-kit`, driver `postgres`); usuario de solo lectura para la API; tests contra Postgres real en memoria (PGlite) |
| Deploy (preparado, no ejecutado) | API: `wrangler deploy` del Worker. Web: build estático servido como Worker de assets (o Pages), con `VITE_API_URL` apuntando a la API; la API permite ese origen por CORS (`ALLOWED_ORIGINS`) |
| Tests | Vitest por workspace; Playwright e2e en la raíz |

### Commands

```
Dev (todo):   npm run dev              # api (8787) + web (5173) en paralelo
Dev por app:  npm run dev:api  ·  npm run dev:web
Test:         npm test                 # vitest en todos los workspaces
Test e2e:     npm run test:e2e
Lint:         npm run lint
Typecheck:    npm run typecheck
Build:        npm run build            # core + api (dry-run de wrangler) + web (vite build)
DB:           npm run db:generate      # genera migraciones SQL desde el esquema Drizzle
              npm run db:migrate       # aplica migraciones a DATABASE_URL
              npm run db:seed          # carga los datos de packages/core en DATABASE_URL
              docker compose up -d db  # (opcional) Postgres local en :5432
```

### Endpoints (apps/api)

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/api/catalog` | materiales, alternativas, supuestos, fuentes, generadores y compradores |
| GET | `/api/generators?material=` | generadores filtrados |
| GET | `/api/buyers?sector=&accepts=` | compradores filtrados |
| POST | `/api/viability` | evaluación de un match (mismo modelo que el front) |
| GET | `/api/health` | estado y origen de datos |
| POST | `/api/listings` | crea una publicación de oferta o demanda (abierta, "sin verificar") |
| GET | `/api/listings/:id/contact` | datos de contacto de una publicación (al hacer click) |

### Diseño visual

Estética minimalista y limpia, definida en `docs/design.md` con las skills `minimalist-ui` y `better-*` (superficies, tipografía, color, layout, accesibilidad). La UI usa solo tokens de ese documento.

## Code Style

TypeScript estricto. Lógica de dominio en funciones puras. La UI no calcula: solo llama a `@mapa/core/viability`. Ejemplo del estilo: `packages/core/src/domain/viability/index.ts`.

- Identificadores en inglés; literales de dominio (`suelto`, `compactado`, `pellet`, textos de la UI) en español.
- Componentes en PascalCase (`PascalCase.tsx`), funciones en camelCase y el resto de los archivos en kebab-case (`kebab-case.ts`).
- Los montos se muestran en ARS, con la fecha del supuesto visible.
- Ningún número aparece en la UI sin su etiqueta `real` o `estimado` y acceso a su fuente.

## Testing Strategy

- **Unitarios (Vitest), obligatorios:** todo `packages/core/src/domain/viability/`: carga del camión, viajes, flete, margen, semáforo (bordes en 0% y 15%), radio máximo y ahorro del comprador. Objetivo de cobertura: ≥ 90% en `domain/viability`.
- **API:** tests de las rutas con un DataSource fake (forma de la respuesta y errores); tests de integración de la base contra PGlite.
- **E2E (Playwright):** un test que recorre el guion de la demo (elige el aserradero, ve compradores, cambia suelto a pellet, el semáforo pasa a verde).
- Escribir los tests primero para la lógica de cálculo (skill `test-driven-development`).

## Boundaries

- **Always:** correr `npm test` y `npm run typecheck` antes de cada commit; etiquetar cada dato; mantener `DATABASE_URL` solo en el servidor (`.dev.vars` / secrets de Wrangler); commits atómicos en español.
- **Ask first:** agregar dependencias fuera de este spec; cambiar el esquema después del seed; usar servicios pagos o APIs con key (ruteo, geocoding); sumar alcance (A2, C1, B3).
- **Never:** commitear secretos o credenciales de la base; dar permisos de escritura al usuario de la API; mostrar números sin etiqueta ni fuente; inventar datos.

## Success Criteria
 
- [x] El guion de la demo se puede recorrer completo en ≤ 2 minutos corriendo en local (`npm run dev`). Demo web pública desplegada en Vercel: [https://ideathon-agro-9u3t-flax.vercel.app/](https://ideathon-agro-9u3t-flax.vercel.app/).
- [x] El mapa muestra ≥ 10 generadores (13 curados) y ≥ 10 compradores (10 curados) reales servidos por la API (Postgres si hay `DATABASE_URL`; si no, los datos de `packages/core`), filtrables por material o sector.
- [x] Al cambiar suelto → compactado → pellet, el radio B2 y el semáforo se actualizan en < 200 ms, sin recargar la página.
- [x] Con los datos del seed, la cascarilla de Molinos Ala (Mercedes) suelta tiene un radio de ~25 km por ruta y da rojo para el Frigorífico Duhalde (Curuzú Cuatiá, ~88 km); pelletizada el radio pasa a ~310 km y el mismo comprador da verde con ahorro frente al GLP.
- [x] Cada número de la UI muestra su etiqueta y su fuente, y los supuestos se pueden editar en la sesión.
- [x] `npm test`, `npm run typecheck`, `npm run lint` y el e2e pasan.
- [x] Se ve impecable en escritorio (1280–1920 px) con soporte para pantallas bajas y notebooks chicas, y modos claro y oscuro. Mobile fuera de alcance.

## Decisiones tomadas

- Distancia: línea recta × factor de corrección por ruta editable (1,3 por defecto).
- Datos: solo fuentes reales de Corrientes/NEA, etiquetados `real` o `estimado`.
- Despliegue: demo web en vivo desplegada en Vercel (`ideathon-agro-9u3t-flax.vercel.app`) y API lista para Cloudflare Workers con o sin Postgres.
- Base de datos: PostgreSQL estándar con Drizzle ORM, sin atarse a un proveedor (decisión del usuario).
- Ejecución: el MVP completo y el refactor a Clean Architecture (V6) fueron construidos y verificados con éxito.
