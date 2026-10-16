# Dirección de diseño: Circular NEA

App de una sola pantalla: mapa de Corrientes a pantalla completa + calculadora "¿Cierra el negocio?" flotante. Dirección: **dashboard sobrio y técnico** (referencia: tablero de créditos de carbono sobre Leaflet), con **tema claro (principal)** y **tema oscuro (alternativa)**. Neutros con tinte verde, acentos terrosos apagados, títulos en sans y labels/cifras en mono. Este documento describe lo implementado en `apps/web`. Prioridad: escritorio (1280–1920 px); mobile solo tiene que funcionar.

Fuentes de criterio: skills `minimalist-ui`, `better-ui`, `better-layout`, `better-typography`, `better-colors`, `better-accessibility`, `better-writing`.

---

## 1. Principios

1. **La respuesta siempre a la vista.** Planta, estado y "¿Cierra?" viven en un bloque fijo del panel; el resto va en pestañas, una cosa por vez.
2. **Color semántico y apagado.** Salvia = activo/positivo/"cierra"; ámbar = "justo"; coral = "no cierra". Nada de neón ni brillos.
3. **Nada depende solo del color.** El semáforo siempre lleva ícono (✓ ! ✕) y texto; en el mapa los compradores cambian de forma según el estado.
4. **Cifras alineadas.** Labels, metadatos y números en Geist Mono con `tabular-nums`; montos negativos con signo menos tipográfico (−).
5. **Todo dato tiene origen.** Cada valor dice `real`/`estimado` y llega a su fuente en un clic (pestaña Fuentes).
6. **Producto en producción.** La UI no menciona entorno, origen de datos ni estado de desarrollo.

## 2. Tokens (`apps/web/src/index.css`)

Dos juegos de los **mismos tokens semánticos**: los componentes usan solo clases de token (`bg-surface`, `text-fg-subtle`, `text-ok`…) y no se duplican por tema. La paleta default de Tailwind se corta (`--color-*: initial`); las variables de shadcn (`--background`, `--primary`, `--ring`…) también tienen un valor por tema.

- `@theme` define los valores del tema oscuro; `:root[data-theme='light']` redefine las mismas variables (`--color-*`, shadcn y `--pin-*`) y pone `color-scheme: light`.
- `data-theme` en `<html>` siempre queda puesto antes del primer paint (§2.1), así que el default efectivo es el claro.

### 2.1 Selector de tema

- Botón de 28 px dentro de la pastilla "Circular NEA" (arriba a la izquierda), separado de la marca por un divisor. Ícono de lucide: **luna** en claro, **sol** en oscuro. `aria-label` "Cambiar a modo oscuro" / "Cambiar a modo claro", `aria-pressed` = tema claro activo, `data-testid="theme-toggle"`.
- Valor inicial: preferencia guardada en `localStorage` (`theme`) si existe; si no, **claro**. No sigue a `prefers-color-scheme` (decisión del usuario).
- Un script inline en `index.html` lo aplica antes del primer paint (sin parpadeo). `src/lib/theme.ts` es su espejo: `resolveTheme`, `readStoredTheme`/`storeTheme` (con try/catch: modo privado o almacenamiento bloqueado no rompen), `setTheme` y el hook `useTheme` (`useSyncExternalStore`).

### 2.2 Tema claro (principal)

| Token | Valor | Uso |
|---|---|---|
| `canvas` | `#f7f8f7` | fondo de página, fondo de etiquetas del mapa |
| `surface` | `#ffffff` | cards, panel |
| `surface-subtle` | `#f0f2f1` | elevado, hover, tracks |
| `line` / `divider` | `#dfe4e1` / `#e8ecea` | bordes 1 px y divisores (decorativos) |
| `line-strong` | `#7e8883` | borde de inputs (≥ 3:1) |
| `fg` | `#141a17` | texto primario |
| `fg-muted` | `#55605b` | secundario |
| `fg-subtle` | `#5f6a65` | labels/terciario (el `#6b7671` propuesto daba 4,2:1 sobre elevado) |
| `faint` | `#b4bdb8` | solo decorativo (manija, zoom deshabilitado) |
| `selection` | `#3a7254` | acento salvia: foco, pestaña y card activas, links, círculo y ruta (el `#3f7a5c` propuesto daba 4,45:1 sobre su tenue) |
| `selection-solid` | `#447d5f` | relleno sólido con texto blanco ("Publicar"); hover = `selection` (el `#4f8a6b` propuesto daba 4,05:1) |
| `selection-subtle` | `rgb(58 114 84 / .10)` | fila/card elegida |
| `ok` / `warn` / `bad` | `#3a7254` / `#806219` / `#a5523c` | semáforo: texto, discos con ícono blanco, pines (el ámbar `#8a6a1f` propuesto daba 4,44:1 sobre su tenue) |
| `on-accent` | `#ffffff` | ícono/texto sobre discos y relleno sólido |
| `*-bg` | mismo tono al 10 % | fondos tenues |
| `shadow-overlay` | `0 0 0 1px rgb(20 26 23/.06), 0 8px 24px -6px rgb(20 26 23/.18)` | lo que flota sobre el mapa |

### 2.3 Tema oscuro (alternativa)

| Token | Valor | Uso |
|---|---|---|
| `canvas` | `#0d1110` | fondo de página, centro de pines |
| `surface` | `#131917` | cards, panel |
| `surface-subtle` | `#1a211f` | elevado, hover, tracks |
| `line` / `divider` | `#26302c` / `#1f2724` | bordes 1 px y divisores (decorativos) |
| `line-strong` | `#5e6b65` | borde de inputs (≥ 3:1) |
| `fg` | `#e8ece9` | texto primario |
| `fg-muted` | `#9aa5a0` | secundario |
| `fg-subtle` | `#8c9893` | labels/terciario (antes `#84908b`; el `#6f7b76` de la referencia daba 4,05:1) |
| `selection` | `#8fb8a0` | acento salvia: foco, pestaña y card activas, links, círculo y ruta |
| `selection-solid` | `#6f9a83` | relleno sólido con texto `#0d1110` |
| `selection-subtle` | `rgb(143 184 160 / .10)` | fila/card elegida |
| `ok` / `warn` / `bad` | `#8fb8a0` / `#c9a86a` / `#c98b78` | semáforo (texto, discos, pines) |
| `on-accent` | `#0d1110` | ícono/texto sobre discos y relleno sólido |
| `*-bg` | mismo tono al 10 % | fondos tenues |

### 2.4 Pines (`--pin-*`)

`markers.ts` arma el HTML de los pines con variables CSS (`var(--color-ok)`, `var(--pin-center)`…), no con hex: cambiar de tema recolorea pines, leyenda y borrador sin rehacer los íconos. Solo los tonos de material (iguales en ambos temas) y el ícono blanco del rombo van en hex.

| Variable | Claro | Oscuro | Uso |
|---|---|---|---|
| `--pin-center` | `#ffffff` | `#0d1110` | centro de pines huecos, anillo interior del elegido |
| `--pin-on-fill` | `#ffffff` | `#0d1110` | ícono sobre el disco relleno (Cierra) |
| `--pin-glyph` | `#141a17` | `#e8ece9` | ícono sobre el centro |
| `--pin-muted` | `#55605b` | `#9aa5a0` | "No compra este material" |
| `--pin-outline` | `#ffffff` | `#e8ece9` | contorno de pines curados |
| `--pin-dash` | `#55605b` | `#e8ece9` | contorno punteado de publicaciones |
| `--pin-neutral` | `#55605b` | `#0d1110` | rombo neutro de la leyenda |
| `--pin-shadow` | `rgb(20 26 23/.35)` | `rgb(0 0 0/.6)` | sombra suave de los pines |

### 2.5 Tipografía

**Geist** (títulos, nombres) y **Geist Mono** (labels, metadatos, cifras), ambas vía `@fontsource-variable/*`.

| Token | Tamaño / interlínea | Uso |
|---|---|---|
| `eyebrow` (utility) | 12/16, mono, MAYÚSCULAS, tracking .08em, `fg-subtle` | "TU PLANTA", "RESULTADO", headers de tabla |
| `caption` | 12/16 | metadatos |
| `small` | 13/18 | textos de apoyo |
| `body` | 14/20 | cuerpo, filas |
| `heading` | 15/22 semibold | nombre del comprador en la respuesta |
| `title` | 20/26 semibold | nombre de planta, título del Detalle |
| `figure` | 28/32 bold mono | KPIs y margen por mes |

Nada por debajo de 12 px salvo la atribución del mapa (11 px). Radios: 6–8 px (`--radius: .5rem`). Sombra solo en lo que flota sobre el mapa (`shadow-overlay`).

`cn` (`src/lib/utils.ts`) se crea con `createCn` registrando estos tamaños como `font-size`; sin eso el merge confunde `text-caption` con un color y lo descarta. Ojo con `text-input`: aunque exista `--text-input`, Tailwind lo compila a `color: var(--input)` (el gris del borde de shadcn); para inputs usar `text-base sm:text-body`.

## 3. Contraste medido

Scripts en el scratchpad: `colors.mjs` (oscuro, con ΔE2000 y simulación Machado 2009) y `light-contrast.mjs` (ambos temas, fórmula WCAG; los fondos tenues se componen al 10 % sobre la card). Mapa claro medido contra `#eceeec` (muestreado de World Light Gray Canvas con el filtro aplicado); mapa oscuro contra `#2b2e2d` (aprox.).

| Par | Claro | Oscuro |
|---|---|---|
| `fg` sobre card / fondo | 17,7 / 16,6 | 14,9 |
| `fg-muted` sobre card / elevado | 6,5 / 5,8 | 7,0 |
| `fg-subtle` sobre card / elevado / fila elegida / fondo | 5,6 / 5,0 / 4,9 / 5,3 | 6,0 / 5,5 / 5,0 / 6,4 |
| salvia sobre card / elevado / su tenue | 5,7 / 5,0 / 4,9 | 8,1 / — / 6,8 |
| ámbar sobre card / elevado / tenue | 5,7 / 5,1 / 5,0 | 7,9 / — / 6,7 |
| coral sobre card / elevado / tenue | 5,4 / 4,8 / 4,7 | 6,3 / — / 5,5 |
| ícono sobre disco salvia / ámbar / coral | blanco: 5,7 / 5,7 / 5,4 | `#0d1110`: 8,6 / 8,4 / 6,7 |
| texto sobre `selection-solid` (y su hover) | blanco: 4,8 (5,7) | `#0d1110`: 6,0 |
| borde de input sobre card / elevado | 3,7 / 3,3 | 3,0 |
| foco (salvia) sobre card / fondo | 5,7 / 5,3 | 8,1 |
| pin salvia / ámbar / coral sobre el mapa | 4,9 / 4,9 / 4,7 | 6,2 / 6,1 / 4,9 |
| pin "no compra" (opacidad .75) sobre el mapa | 3,3 | 3,7 |
| contorno punteado de publicación sobre el mapa | 5,6 | 11,5 |
| círculo y ruta (opacidad .8) sobre el mapa | 3,3 | 4,6 |
| etiqueta del pin (`fg` sobre `canvas`) | 16,6 | 15,9 |

Materiales (rombos de planta, ícono blanco encima, iguales en ambos temas): `#6f4fa0`, `#287a78`, `#5a3826`, `#8a7a24` — ΔE2000 ≥ 14,9 entre sí con visión normal, deuteranopia, protanopia y tritanopia simuladas.

## 4. Layout

- **Mapa a pantalla completa**; no hay barra superior. El título completo es el `h1` (`sr-only`); a la vista, la pastilla "Circular NEA" arriba a la izquierda, con el selector de tema adentro, y al lado "Publicar".
- **Franja de KPIs** flotante arriba: Plantas · Toneladas/mes · Compradores · Cierran (`3 de 6`, salvia si hay alguno, coral si no). Se recalcula con la planta y el estado.
- **Desktop (≥ 1024 px):** panel flotante a la derecha, 400 px, `top/right/bottom: 16px`, card con scroll interno. Zoom arriba a la izquierda; leyenda, escala y atribución abajo a la izquierda.
- **Mobile:** hoja inferior propia, **no modal**, de 470 px (manija para agrandarla al 92 %; elegir una pestaña la agranda). No se usa el Drawer de shadcn: `vaul` siempre monta un Dialog modal de Radix que pone `aria-hidden` en `#root` y atrapa el foco, y el mapa tiene que seguir usable detrás. KPIs en **grilla 2×2** (cifra 20 px, sin sublabel) debajo de marca y "Publicar"; atribución y escala **debajo de los KPIs**, a la derecha (`top: 176px`); "Referencias" debajo de los KPIs, a la izquierda. Las etiquetas permanentes de los pines van **debajo** del pin (arriba está la atribución).
- El encuadre del mapa (`flyToBounds`) descuenta el panel o la hoja (`insets`).

## 5. Panel

**Bloque fijo**
1. **Tu planta**: combobox con búsqueda (shadcn Popover + Command). Muestra nombre, tipo, material, localidad y t/mes. Marca = rombo del material, igual que en el mapa.
2. **Cómo lo vendés**: tres cards (Radix ToggleGroup, `role="radio"`, flechas para moverse). Arriba el radio viable en km (mono), al medio el nombre, abajo cuántos negocios cierran en mono y color ("3 CIERRAN" / "NO CIERRA").
3. **Radio viable**: km por ruta y en línea recta (el círculo punteado del mapa).
4. **Resultado** (`data-testid="result-light"`): label RESULTADO, estado arriba a la derecha en mono y color con ícono ("✓ CIERRA: MARGEN 23,1 %"), comprador, metadatos `SECTOR · LOCALIDAD · KM`, margen por mes como KPI mono y el trayecto "−281,5 % → 23,1 %" **solo al cambiar de estado** (suelto/compactado/pellet) con la misma planta y el mismo comprador; cambiar de planta, de comprador o un supuesto lo resetea, sin flecha (`panel/trajectory.ts`). Si al comprador no le conviene, una línea en coral con ícono.

**Pestañas (shadcn Tabs)**
- **Compradores**: conteo por estado, Filtros (Collapsible + Toggle; "Quitar filtros") y ranking. Fila: disco del semáforo, nombre, metadatos mono, ahorro del comprador o "No le conviene al comprador", margen % mono en color y $/mes. Hover o foco en una fila agranda su pin.
- **Detalle**: título 20 px con el comprador, escala del margen (zona negativa coral, 0 % y umbral punteados, marcador), barra "distancia vs. radio viable", tabla del desglose (header mono, cifras mono a la derecha, margen en color) y ahorro del comprador.
- **Supuestos**: editor con inputs de 16 px en mobile (`text-base sm:text-body`), valores tipeados en `fg`, ayuda y error vinculados con `aria-describedby`, "Restablecer supuestos".
- **Fuentes**: tabla Dato · Valor · Tipo (`real` relleno / `estimado` punteado) · "Ver fuente ↗" (popover con nota y links).

## 6. Mapa

- **Tiles** (Esri Canvas, sin API key; atribución "© Esri, HERE, Garmin, © OpenStreetMap contributors"):
  - Claro: **World Light Gray Canvas** (`World_Light_Gray_Base` + `World_Light_Gray_Reference` para nombres). Filtro suave hacia el fondo `#f7f8f7`: `sepia(.06) hue-rotate(80deg) saturate(.9)`.
  - Oscuro: **World Dark Gray Canvas** (`World_Dark_Gray_Base` + `World_Dark_Gray_Reference`). Filtro `brightness(.85) sepia(.12) hue-rotate(95deg) saturate(.9)` para acercarlo a `#0d1110`.
  - Nombres al 75 % de opacidad en ambos. Cambiar de tema cambia la `url` de los `TileLayer` (react-leaflet hace `setUrl`): cambian los tiles sin recargar ni perder la vista.
  - El usuario descartó el satelital (World Imagery). CARTO (Positron y Dark Matter) hoy pide API key.
- Atribución y escala con fondo `canvas` al 80/75 % (`color-mix`), así acompañan al tema.
- **Escala métrica** (`ScaleControl`).
- **Plantas**: rombo de 16 px del tono del material con ícono blanco de 9 px (árbol para aserraderos/foresto-industria, trigo para el molino arrocero) y contorno `--pin-outline`.
- **Compradores**: punto de 16 px con ícono de sector de 9 px (rayo, hoja, cítrico, galpón, carne). Forma según estado: salvia relleno (Cierra), anillo grueso ámbar (Justo), hueco con borde coral (No cierra), gris punteado de 13 px atenuado a **opacidad .75** (No compra este material; con .55 el contorno quedaba en ~2,9:1).
- **Publicaciones** (`data-origin="publicacion"`, sin verificar): mismo pin, pero el contorno sólido se reemplaza por un **contorno punteado** de 1,5 px separado 2 px del pin (`--pin-dash`). Explicado en la leyenda ("Publicaciones").
- **Elegido**: 21 px, anillo salvia de 2 px + halo suave, etiqueta permanente (planta: nombre; comprador: nombre y estado) con fondo `canvas`, borde salvia y hasta 260 px de ancho en varias líneas.
- **Etiquetas que se pisan**: si la planta y el comprador elegidos quedan a < 200 px en horizontal y < 48 px en vertical en pantalla (p. ej. Molinos Ala e Iberá Mercantil, ambos en Mercedes), se muestra **una sola etiqueta** "Planta → Comprador · Estado" en el pin del extremo libre (el de más arriba; en mobile, donde las etiquetas van abajo, el de más abajo). Se recalcula al hacer zoom (`mergedLabelHost` en `markers.ts`). El otro pin conserva su tooltip al pasar el puntero.
- Área táctil ≥ 24 px; los pines son enfocables con teclado (Leaflet) y tienen `aria-label` con nombre, localidad y estado.
- Círculo de radio y línea al comprador en salvia al 80 %; el color sale del token por CSS sobre `path.radius-circle` / `path.route-line`, así sigue al tema.
- Testabilidad: `data-marker="gen-<id>"` / `data-marker="buyer-<id>"`, `data-light` en compradores, clases `radius-circle`, `route-line`, `tiles-base` y `tiles-labels`.
- Los trazos de los íconos de pin son los de lucide (ISC) copiados a `markers.ts` para armar el HTML sin renderizar React.

## 7. Copy

Español rioplatense, voseo, sentence case. Semáforo: **Cierra / Justo / No cierra / No compra este material** en todos lados. Sin texto de entorno ("local", "Supabase", "base de datos", "demo"): el origen de datos solo está en `GET /api/health`.

## 8. Checklist

- [x] Sin paleta default de Tailwind; hex de tema solo en `index.css` (los pines usan variables).
- [x] Geist + Geist Mono; tema claro (default) y oscuro con los mismos tokens.
- [x] Cifras en mono tabular; restas con "−".
- [x] Contraste AA medido en ambos temas (tabla de §3).
- [x] Semáforo con ícono + texto; en el mapa, forma distinta por estado.
- [x] Foco visible (anillo salvia) en combobox, cards de estado, pestañas, filas, chips, inputs, links, pines y selector de tema.
- [x] `prefers-reduced-motion`: sin `flyTo`, sin transiciones ni `animate-pulse`.
- [x] 375 px sin scroll horizontal.
- [x] `npm run test:e2e`, incluido `e2e/theme.spec.ts` (default claro, alternar, persistir al recargar, tiles del mapa).
