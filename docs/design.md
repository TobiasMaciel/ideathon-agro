# Dirección de diseño: Sobra

App de una sola pantalla: mapa de Corrientes a pantalla completa + calculadora "¿Cierra el negocio?" flotante. Dirección: **dashboard sobrio y técnico** (referencia: tablero de créditos de carbono sobre Leaflet), con **tema claro (principal)** y **tema oscuro (alternativa)**. Identidad cobalto (2026-10): neutros con tinte cobalto, un acento cobalto (vivo en claro, cobalto profundo con acento celeste en oscuro), marca de píxeles, títulos y cifras en Archivo semiexpandida, labels en mono, radios rectos y grilla de instrumento. Mismo nivel de terminación que Dosel (proyecto hermano), con otra paleta, otra marca y otras fuentes. Este documento describe lo implementado en `apps/web`. Prioridad: escritorio (1280–1920 px); mobile solo tiene que funcionar.

Fuentes de criterio: skills `minimalist-ui`, `better-ui`, `better-layout`, `better-typography`, `better-colors`, `better-accessibility`, `better-writing`.

---

## 1. Principios

1. **La respuesta siempre a la vista.** Planta, estado y "¿Cierra?" viven en un bloque fijo del panel; el resto va en pestañas, una cosa por vez.
2. **Un acento, un semáforo.** Azul = activo, selección, links y marca. Verde = "cierra"; ámbar = "justo"; coral = "no cierra". El azul nunca significa resultado.
3. **Nada depende solo del color.** El semáforo siempre lleva ícono (✓ ! ✕) y texto; en el mapa los compradores cambian de forma según el estado.
4. **Cifras alineadas.** Labels, metadatos y números en Geist Mono con `tabular-nums`; montos negativos con signo menos tipográfico (−).
5. **Todo dato tiene origen.** Cada valor dice `real`/`estimado` y llega a su fuente en un clic (pestaña Fuentes).
6. **Producto en producción.** La UI no menciona entorno, origen de datos ni estado de desarrollo.

## 2. Tokens (`apps/web/src/index.css`)

Dos juegos de los **mismos tokens semánticos**: los componentes usan solo clases de token (`bg-surface`, `text-fg-subtle`, `text-ok`…) y no se duplican por tema. La paleta default de Tailwind se corta (`--color-*: initial`); las variables de shadcn (`--background`, `--primary`, `--ring`…) también tienen un valor por tema.

- `@theme` define los valores del tema oscuro; `:root[data-theme='light']` redefine las mismas variables (`--color-*`, shadcn y `--pin-*`) y pone `color-scheme: light`.
- `data-theme` en `<html>` siempre queda puesto antes del primer paint (§2.1), así que el default efectivo es el claro.

### 2.1 Selector de tema

- Botón de 28 px dentro de la pastilla "Sobra" (arriba a la izquierda), separado de la marca por un divisor. Ícono de lucide: **luna** en claro, **sol** en oscuro. `aria-label` "Cambiar a modo oscuro" / "Cambiar a modo claro", `aria-pressed` = tema claro activo, `data-testid="theme-toggle"`.
- Valor inicial: preferencia guardada en `localStorage` (`theme`) si existe; si no, **claro**. No sigue a `prefers-color-scheme` (decisión del usuario).
- Un script inline en `index.html` lo aplica antes del primer paint (sin parpadeo). `src/lib/theme.ts` es su espejo: `resolveTheme`, `readStoredTheme`/`storeTheme` (con try/catch: modo privado o almacenamiento bloqueado no rompen), `setTheme` y el hook `useTheme` (`useSyncExternalStore`).

### 2.2 Tema claro (principal)

| Token | Valor | Uso |
|---|---|---|
| `canvas` | `#eef3fd` | fondo de página, fondo de etiquetas del mapa |
| `surface` | `#ffffff` | cards, panel |
| `surface-subtle` | `#e6edfb` | elevado, hover, tracks |
| `line` / `divider` | `#d3def3` / `#e2e9f7` | bordes 1 px y divisores (decorativos) |
| `line-strong` | `#6e80a3` | borde de inputs (≥ 3:1) |
| `fg` / `fg-muted` / `fg-subtle` | `#0a1433` / `#45547a` / `#52618a` | texto primario, secundario, labels |
| `faint` | `#aebbd8` | solo decorativo |
| `selection` / `selection-solid` | `#2150e8` | acento cobalto: foco, pestaña activa, links, círculo, ruta, marca; relleno de "Publicar" con texto blanco |
| `selection-subtle` | `rgb(33 80 232 / .08)` | fila/card elegida |
| `ok` / `warn` / `bad` | `#17784a` / `#8a6410` / `#b5402a` | semáforo: texto, discos con ícono blanco, pines |
| `on-accent` | `#ffffff` | ícono/texto sobre discos y relleno sólido |
| `--grid` / `--map-grid` | tinta al 5 % / cobalto al 7 % | grilla del bloque fijo del panel / retícula del mapa |
| `shadow-overlay` | anillo 1 px + `0 14px 36px -14px` naval | lo que flota sobre el mapa |

### 2.3 Tema oscuro (alternativa)

| Token | Valor | Uso |
|---|---|---|
| `canvas` | `#0b1640` | fondo de página, centro de pines |
| `surface` | `#101e52` | cards, panel |
| `surface-subtle` | `#17286a` | elevado, hover, tracks |
| `line` / `divider` | `#24377a` / `#1c2e6c` | bordes 1 px y divisores (decorativos) |
| `line-strong` | `#5d74b8` | borde de inputs (≥ 3:1 sobre card) |
| `fg` / `fg-muted` / `fg-subtle` | `#eef2ff` / `#b0bde6` / `#9fb0e0` | texto primario, secundario, labels |
| `selection` / `selection-solid` | `#7aa7ff` | acento celeste sobre cobalto profundo; relleno de "Publicar" con texto `#071033` |
| `selection-subtle` | `rgb(122 167 255 / .14)` | fila/card elegida |
| `ok` / `warn` / `bad` | `#6fe0a8` / `#ffd06b` / `#ff9a80` | semáforo (texto, discos, pines) |
| `on-accent` | `#071033` | ícono/texto sobre discos y relleno sólido |
| `*-bg` | mismo tono al 12–14 % | fondos tenues |

### 2.3.1 Marca

**Nombre: Sobra.** Doble sentido: lo que sobra en la planta (el residuo) y "de sobra" (abundancia, la plata que aparece). Reemplaza a "Circular NEA" (2026-10): ese nombre era descriptivo pero genérico. Se escribe con punto final en el acento, "Sobra.", como afirmación.

`src/shared/Logo.tsx` (copias en `public/favicon.svg`, `public/logo-mark.svg` y `docs/images/logo-*.svg`): grilla de 9 × 9 píxeles sobre un cuadrado redondeado de color `selection-solid`. Una pila de residuo (opacidad .3–.7, más densa al centro) de la que sale una diagonal de tres píxeles que sube y se enciende hasta 1: lo que sobra gana valor. Los píxeles usan `on-accent`, así la marca sigue al tema. Al lado, "Sobra" en Archivo 800 semiexpandida con el punto final en el acento.

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

**Archivo** (`font-display`, variable con eje de ancho: marca, títulos y cifras grandes, semiexpandida en marca y KPIs), **Geist** (texto) y **Geist Mono** (labels, metadatos, cifras chicas), todas vía `@fontsource-variable/*`.

| Token | Tamaño / interlínea | Uso |
|---|---|---|
| `eyebrow` (utility) | 11/16, mono, MAYÚSCULAS, tracking .12em, `fg-subtle` | headers de tabla, labels |
| `kicker` (utility) | igual que `eyebrow` con un cuadrito de acento delante | encabezados de bloque: "Tu planta", "Resultado", "Leyenda" |
| `caption` | 12/16 | metadatos |
| `small` | 13/18 | textos de apoyo |
| `body` | 14/20 | cuerpo, filas |
| `heading` | 15/22 semibold | nombre del comprador en la respuesta (display) |
| `title` | 20/26 semibold | nombre de planta, título del Detalle y del diálogo (display) |
| `figure` | 28/32 bold display | KPIs (semiexpandida) y margen por mes |

Nada por debajo de 11 px. Radios rectos, de instrumento: `--radius: .3125rem` (controles 3–5 px), panel 8 px. Pestañas del panel subrayadas (variante `line`). Sombra teñida de naval solo en lo que flota sobre el mapa (`shadow-overlay`). "Publicar" sube 1 px y aclara al pasar el puntero.

`cn` (`src/lib/utils.ts`) se crea con `createCn` registrando estos tamaños como `font-size`; sin eso el merge confunde `text-caption` con un color y lo descarta. Ojo con `text-input`: aunque exista `--text-input`, Tailwind lo compila a `color: var(--input)` (el gris del borde de shadcn); para inputs usar `text-base sm:text-body`.

## 3. Contraste medido

Fórmula WCAG; los fondos tenues se componen al 12 % sobre la card. Los pares sobre el mapa (pines, círculo y ruta) no se volvieron a medir con la paleta cobalto: revisarlos antes de la próxima entrega.

| Par | Claro | Oscuro |
|---|---|---|
| `fg` sobre card / elevado | 18,1 / 15,4 | 14,1 / 12,1 |
| `fg-muted` sobre card / elevado | 7,5 / 6,4 | 8,5 / 7,3 |
| `fg-subtle` sobre card / elevado / tenue | 6,1 / 5,2 / 5,2 | 7,3 / 6,3 / 5,9 |
| acento sobre card / elevado / su tenue | 6,2 / 5,3 / 5,2 | 6,6 / 5,7 / 5,4 |
| verde / ámbar / coral sobre card | 5,5 / 5,4 / 5,6 | 9,7 / 10,9 / 7,7 |
| verde / ámbar / coral sobre su tenue | 4,7 / 4,6 / 4,7 | 7,5 / 8,4 / 6,3 |
| texto sobre `selection-solid` | blanco: 6,2 | `#071033`: 7,8 |
| ícono sobre disco verde / ámbar / coral | blanco: 5,5 / 5,4 / 5,6 | `#071033`: 11,4 / 12,8 / 9,0 |
| borde de input sobre card / elevado | 4,0 / 3,4 | 3,5 / 3,0 |

Materiales (rombos de planta, ícono blanco encima, iguales en ambos temas): `#6f4fa0`, `#287a78`, `#5a3826`, `#8a7a24` — ΔE2000 ≥ 14,9 entre sí con visión normal, deuteranopia, protanopia y tritanopia simuladas.

## 4. Layout

### 4.0 Pantallas y ruteo

Ruteo por hash (`src/shared/route.ts`): el mapa en `/` y `#/mapa` (la demo abre directo en la app) y la **portada** en `#/inicio`, a la que lleva la marca de la pastilla. La portada (`src/features/landing`, carga diferida) tiene: hero con el titular resaltado en cobalto, un **ejemplo en vivo** que recorre plantas reales y calcula con el catálogo el radio por estado y el mejor negocio (`examples.ts`, lógica pura con tests), cifras del catálogo, "Cómo funciona" en cuatro pasos, dos puertas (tengo residuo / necesito calor) y un llamado final en bloque cobalto.

- **Barra de la portada** (mismo mecanismo que Dosel, clases `.lnav` en `index.css`): una sola caja ancha y transparente arriba; al bajar 8 px anima a una píldora de vidrio más angosta y flotante (`max-width` 72 → 67 rem, alto 72 → 60 px, margen, padding, fondo, borde y sombra; el radio y el borde existen siempre, transparentes). Marca la sección que se está leyendo (subrayado arriba, pastilla en modo flotante). En móvil, los links van en un desplegable.
- **Movimiento**: entrada escalonada del hero; el resaltado del titular se "pinta" de izquierda a derecha (`.mark-sweep`); dos luces de fondo que derivan lento; cifras que cuentan desde 0 al entrar en pantalla; secciones que suben y se funden al aparecer (`Reveal`); el punto activo del ejemplo en vivo se llena como barra de progreso y al completarse pasa a la planta siguiente (se pausa con el puntero o el foco). Con `prefers-reduced-motion` todo queda estático.
- **Invitación en el mapa** (`app/IntroInvite.tsx`): quien llega directo al mapa por primera vez ve abajo una tarjeta no modal "¿Primera vez?" con un botón a la portada. Se oculta al cerrarla, al visitar la portada (`intro-seen` en `localStorage`) o mientras hay otro aviso o el formulario abierto. Decisión: el mapa sigue siendo la entrada (`/`) porque la demo del pitch abre con la app cargada; la portada es para quien llega sin contexto.

### 4.1 Mapa

- **Un solo scroll en el panel**: el bloque fijo y las pestañas scrollean juntos; la barra de pestañas queda pegada arriba (`sticky`). No hay scroll anidado dentro de las pestañas.
- **La respuesta es un bloque cobalto**: "Resultado", comprador y margen por mes en `selection-solid` con texto `on-accent`; el semáforo va en una ficha clara para mantener su color. Debajo, en la card, el aviso de "al comprador le sale más caro" y el contacto.

- **Mapa a pantalla completa**; no hay barra superior. El título completo es el `h1` (`sr-only`); a la vista, la pastilla "Sobra" arriba a la izquierda, con el selector de tema adentro, y al lado "Publicar".
- **Franja de KPIs** flotante arriba: Plantas · Toneladas/mes · Compradores · Cierran (`3 de 6`, verde si hay alguno, coral si no). Se recalcula con la planta y el estado.
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
- **Compradores**: punto de 16 px con ícono de sector de 9 px (rayo, hoja, cítrico, galpón, carne). Forma según estado: verde relleno (Cierra), anillo grueso ámbar (Justo), hueco con borde coral (No cierra), gris punteado de 13 px atenuado a **opacidad .75** (No compra este material; con .55 el contorno quedaba en ~2,9:1).
- **Publicaciones** (`data-origin="publicacion"`, sin verificar): mismo pin, pero el contorno sólido se reemplaza por un **contorno punteado** de 1,5 px separado 2 px del pin (`--pin-dash`). Explicado en la leyenda ("Publicaciones").
- **Elegido**: 21 px, anillo de acento de 2 px + halo suave, etiqueta permanente (planta: nombre; comprador: nombre y estado) con fondo `canvas`, borde de acento y hasta 260 px de ancho en varias líneas.
- **Etiquetas que se pisan**: si la planta y el comprador elegidos quedan a < 200 px en horizontal y < 48 px en vertical en pantalla (p. ej. Molinos Ala e Iberá Mercantil, ambos en Mercedes), se muestra **una sola etiqueta** "Planta → Comprador · Estado" en el pin del extremo libre (el de más arriba; en mobile, donde las etiquetas van abajo, el de más abajo). Se recalcula al hacer zoom (`mergedLabelHost` en `markers.ts`). El otro pin conserva su tooltip al pasar el puntero.
- Área táctil ≥ 24 px; los pines son enfocables con teclado (Leaflet) y tienen `aria-label` con nombre, localidad y estado.
- Círculo de radio y línea al comprador en el acento al 80 %; el color sale del token por CSS sobre `path.radius-circle` / `path.route-line`, así sigue al tema.
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
- [x] Foco visible (anillo de acento) en combobox, cards de estado, pestañas, filas, chips, inputs, links, pines y selector de tema.
- [x] `prefers-reduced-motion`: sin `flyTo`, sin transiciones ni `animate-pulse`.
- [x] 375 px sin scroll horizontal.
- [x] `npm run test:e2e`, incluido `e2e/theme.spec.ts` (default claro, alternar, persistir al recargar, tiles del mapa).
