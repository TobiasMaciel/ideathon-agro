# ADR-0004: SPA con Vite, React y shadcn, solo escritorio

- Estado: Aceptado
- Fecha: 2026-10-16

## Contexto

La interfaz es un mapa a pantalla completa con un panel de cálculo. No necesita renderizado en servidor, y el back ya es una API separada. La versión inicial usaba Next.js con OpenNext; fue reemplazada al separar front y back. Además, el producto está pensado para usarse en escritorio (1280 px o más).

## Decisión

- La web es una SPA estática: Vite, React 19, TypeScript, Tailwind CSS 4 y Leaflet / react-leaflet.
- Los componentes de base son shadcn (Radix): se copian al repositorio en `apps/web/src/components/ui` y se pueden editar.
- Hay un único layout de escritorio. No se mantienen variantes mobile (hoja inferior, props `wide`/`compact`, tests e2e de 375 px).
- El estado se maneja con `useReducer` y hooks; no se usan Zustand ni React Query.
- En desarrollo, Vite hace proxy de `/api` a la API; en producción se define `VITE_API_URL`.

## Consecuencias

- El build es un directorio estático (`apps/web/dist`) que se sirve desde cualquier hosting estático.
- Se elimina el código responsive y la hoja inferior propia, que era una fuente de complejidad.
- Un usuario en un teléfono no tiene una experiencia diseñada; es una limitación explícita del alcance.
- Los componentes de `components/ui` son código propio: las actualizaciones de shadcn se aplican a mano.
- Agregar una librería de estado global requiere un ADR nuevo.

## Alternativas consideradas

- Next.js con OpenNext: SSR que la aplicación no usa y acoplamiento del front con el despliegue.
- Zustand o React Query: no se justifican con el volumen actual de estado y de llamadas.
