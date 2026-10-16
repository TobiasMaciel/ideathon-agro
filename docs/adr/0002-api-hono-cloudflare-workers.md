# ADR-0002: API en Hono sobre Cloudflare Workers

- Estado: Aceptado
- Fecha: 2026-10-16

## Contexto

La API es chica (catálogo, evaluación de un match, publicaciones, contacto) y debe poder probarse sin levantar un servidor ni una base. Se busca un runtime sin servidores propios que administrar, con el flag `nodejs_compat` para el driver de Postgres.

## Decisión

La API usa Hono sobre Cloudflare Workers (`wrangler`; en local, `wrangler dev` en el puerto 8787).

- `createApp(makeDeps)` recibe sus dependencias (repositorios, configuración) y devuelve la app Hono. Los tests la ejercitan con `app.request(...)` y dependencias falsas, sin red.
- El estado en memoria del Worker (límites por IP, publicaciones sin base) es best-effort: se pierde al reiniciar o al cambiar de instancia. En producción, el límite por IP se complementa con una regla de rate limiting de Cloudflare.
- Se habilita `nodejs_compat` en la configuración del Worker.

## Consecuencias

- Las rutas se prueban de forma rápida y aislada.
- La API no tiene servidor propio que operar; el deploy es `wrangler deploy` (preparado, no ejecutado).
- El código de la API debe ser compatible con el runtime de Workers: no se puede asumir un proceso Node de larga vida ni estado compartido entre requests.
- Las conexiones a Postgres se abren y cierran por request (ver ADR-0003 y ADR-0009).
- Cambiar de runtime afecta solo a `index.ts`, `composition.ts` y la configuración; las rutas y los casos de uso no dependen de Cloudflare.
