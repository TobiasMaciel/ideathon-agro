# Declaración de uso de IA, componentes previos y datos

**Circular NEA · Ideathon NEA Tech 2026 · Desafío 03: Del subproducto al mercado**

[Equipo]

16 de octubre de 2026

---

## 1. Autoría

La identificación del problema, la investigación del desafío, la idea de producto, la definición y priorización de cada funcionalidad, y las decisiones de diseño y de negocio son de autoría del equipo.

## 2. Uso de inteligencia artificial

- **Programación.** Para programar utilizamos asistentes de IA (Claude Code, de Anthropic) bajo nuestra dirección. El equipo definió los requisitos, revisó y validó el resultado.
- **Búsqueda de fuentes y redacción.** También usamos IA como apoyo para buscar fuentes públicas y para redactar y revisar textos. Cada dato fue contrastado con su fuente y está citado.
- **El producto no usa IA.** Circular NEA no incluye modelos de IA: el cálculo de viabilidad son fórmulas explícitas y auditables, con cada parámetro a la vista.

## 3. Componentes previos

El prototipo se construyó sobre componentes de terceros, usados según sus licencias:

| Componente | Uso en el proyecto |
|---|---|
| React, Vite, Tailwind CSS, shadcn/ui, Radix, lucide | Interfaz web, estilos, componentes e íconos |
| Leaflet y react-leaflet | Mapa interactivo |
| Hono | API web |
| Drizzle ORM | Acceso a la base PostgreSQL |
| PGlite | Base PostgreSQL en memoria para tests |
| Vitest y Playwright | Tests unitarios y de punta a punta |
| Mapas base de Esri | Fondo cartográfico del mapa |
| OpenStreetMap (Nominatim) | Coordenadas de las localidades |
| Fuentes tipográficas Geist | Tipografía (licencia SIL Open Font License) |

El código propio del proyecto se publica con licencia MIT.

## 4. Datos

- **No hay datos simulados.** Las empresas y sus ubicaciones son reales y provienen de fuentes públicas y de OpenStreetMap.
- **Valores sin dato público.** Están marcados como "estimado", con su cálculo y su fuente visibles en la aplicación.
- **Publicaciones de usuarios.** Se marcan "sin verificar": sus valores los declara quien publica.
- **Contactos.** Solo se muestran contactos corporativos publicados por las propias empresas. Nunca contactos personales.

---

[Firma / Equipo]

Corrientes, 16 de octubre de 2026
