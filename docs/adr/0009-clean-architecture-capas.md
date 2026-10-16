# ADR-0009: Clean architecture y reglas de dependencia

- Estado: Aceptado
- Fecha: 2026-10-16

## Contexto

Una auditoría del repositorio detectó responsabilidades mezcladas: el entry point de la API resolvía HTTP, política de negocio y elección de persistencia; el dominio conocía el contrato HTTP y las filas de la base; las conexiones a Postgres se abrían sin cerrarse; y un componente de la web concentraba layout, cálculo y flujos. Sin reglas verificables, esas mezclas reaparecen.

## Decisión

Las dependencias apuntan siempre hacia el dominio: `domain` <- `ports` / `contracts` <- `application` <- `adapters` / `http` / UI. El detalle y las reglas numeradas están en `docs/architecture.md`. En resumen:

- `core/domain` es puro: no importa nada.
- Los casos de uso viven en `apps/api/src/application` y dependen solo de `core/{domain,ports,contracts}`.
- Los puertos (`CatalogRepository`, `ListingRepository`, `ContactDirectory`, `RateLimiter`) están en `@mapa/core/ports`; los adaptadores de Postgres y de memoria los implementan con `satisfies`.
- `apps/api/src/composition.ts` es el único lugar que importa `@mapa/db` y los adaptadores.
- Las fronteras se hacen cumplir con `no-restricted-imports` de ESLint, sin dependencias nuevas.
- Se usan factories y objetos planos: sin contenedor de inyección de dependencias, sin Zod ni tRPC.

## Consecuencias

- La lógica de negocio se prueba sin HTTP, base ni React; los casos de uso, con fakes.
- Cambiar de base, de runtime o de framework de UI afecta a una sola capa.
- Hay más archivos y una capa de indirección (puertos y casos de uso) para features pequeñas.
- Cada feature nueva debe seguir el recorrido dominio -> contrato -> puerto -> caso de uso -> ruta -> cliente web.
- Las reglas de ESLint pasan a ser parte del contrato: violar una frontera rompe `npm run lint`.

## Alternativas consideradas

- Contenedor de DI, Zod o tRPC: descartados porque factories y objetos planos alcanzan para el tamaño actual.
