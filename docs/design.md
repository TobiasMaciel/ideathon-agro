# Dirección de diseño: Circular NEA

App de una sola pantalla: mapa satelital de Corrientes a pantalla completa + calculadora "¿Cierra el negocio?" flotante. Dirección: **dashboard oscuro, sobrio y técnico** (referencia: tablero de créditos de carbono sobre Leaflet). Fondo negro con tinte verde, acentos terrosos apagados, títulos en sans y labels/cifras en mono. Este documento describe lo implementado en `apps/web`.

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

Tema oscuro único (`color-scheme: dark`). La paleta default de Tailwind se corta (`--color-*: initial`); las variables de shadcn (`--background`, `--primary`, `--ring`…) apuntan a estos valores.

| Token | Valor | Uso |
|---|---|---|
| `canvas` | `#0d1110` | fondo de página, centro de pines |
| `surface` | `#131917` | cards, panel |
| `surface-subtle` | `#1a211f` | elevado, hover, tracks |
| `line` / `divider` | `#26302c` / `#1f2724` | bordes 1 px y divisores (decorativos) |
| `line-strong` | `#5e6b65` | borde de inputs (≥ 3:1) |
| `fg` | `#e8ece9` | texto primario |
| `fg-muted` | `#9aa5a0` | secundario |
| `fg-subtle` | `#84908b` | labels/terciario (el `#6f7b76` de la referencia daba 4,05:1) |
| `selection` | `#8fb8a0` | acento salvia: foco, pestaña y card activas, links, círculo y ruta |
| `selection-solid` | `#6f9a83` | relleno sólido con texto `#0d1110` |
| `selection-subtle` | `rgb(143 184 160 / .10)` | fila/card elegida |
| `ok` / `warn` / `bad` | `#8fb8a0` / `#c9a86a` / `#c98b78` | semáforo (texto, discos, pines) |
| `*-bg` | mismo tono al 10 % | fondos tenues |

Tipografía: **Geist** (títulos, nombres) y **Geist Mono** (labels, metadatos, cifras), ambas vía `@fontsource-variable/*`.

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

`cn` (`src/lib/utils.ts`) se crea con `createCn` registrando estos tamaños como `font-size`; sin eso el merge confunde `text-caption` con un color y lo descarta.

## 3. Contraste medido

Script en el scratchpad (`colors.mjs`, fórmula WCAG + ΔE2000 con simulación Machado 2009).

| Par | Ratio |
|---|---|
| `fg` sobre card | 14,9 |
| `fg-muted` sobre card | 7,0 |
| `fg-subtle` sobre card / elevado / fila elegida | 5,4 / 5,0 / 4,5 |
| salvia sobre card / sobre su tenue | 8,1 / 6,8 |
| ámbar sobre card / tenue | 7,9 / 6,7 |
| coral sobre card / tenue | 6,3 / 5,5 |
| ícono `#0d1110` sobre disco salvia / ámbar / coral | 8,6 / 8,4 / 6,7 |
| `#0d1110` sobre `selection-solid` | 6,0 |
| borde de input sobre card | 3,0 |

Materiales (rombos de planta, ícono claro encima): `#6f4fa0`, `#287a78`, `#5a3826`, `#8a7a24` — ΔE2000 ≥ 14,9 entre sí con visión normal, deuteranopia, protanopia y tritanopia simuladas.

## 4. Layout

- **Mapa a pantalla completa**; no hay barra superior. El título completo es el `h1` (`sr-only`); a la vista, la pastilla "Circular NEA" arriba a la izquierda.
- **Franja de KPIs** flotante arriba: Plantas · Toneladas/mes · Compradores · Cierran (`3 de 6`, salvia si hay alguno, coral si no). Se recalcula con la planta y el estado.
- **Desktop (≥ 1024 px):** panel flotante a la derecha, 400 px, `top/right/bottom: 16px`, card con scroll interno. Zoom arriba a la izquierda; leyenda, escala y atribución abajo a la izquierda.
- **Mobile:** hoja inferior propia, **no modal**, de 470 px (manija para agrandarla al 92 %; elegir una pestaña la agranda). No se usa el Drawer de shadcn: `vaul` siempre monta un Dialog modal de Radix que pone `aria-hidden` en `#root` y atrapa el foco, y el mapa tiene que seguir usable detrás. KPIs compactos con scroll horizontal; atribución, escala y "Referencias" arriba a la derecha.
- El encuadre del mapa (`flyToBounds`) descuenta el panel o la hoja (`insets`).

## 5. Panel

**Bloque fijo**
1. **Tu planta**: combobox con búsqueda (shadcn Popover + Command). Muestra nombre, tipo, material, localidad y t/mes. Marca = rombo del material, igual que en el mapa.
2. **Cómo lo vendés**: tres cards (Radix ToggleGroup, `role="radio"`, flechas para moverse). Arriba el radio viable en km (mono), al medio el nombre, abajo cuántos negocios cierran en mono y color ("3 CIERRAN" / "NO CIERRA").
3. **Radio viable**: km por ruta y en línea recta (el círculo punteado del mapa).
4. **Resultado** (`data-testid="result-light"`): label RESULTADO, estado arriba a la derecha en mono y color con ícono ("✓ CIERRA: MARGEN 23,1 %"), comprador, metadatos `SECTOR · LOCALIDAD · KM`, margen por mes como KPI mono y, si cambió el estado, el trayecto "−281 % → +23 %". Si al comprador no le conviene, una línea en coral con ícono.

**Pestañas (shadcn Tabs)**
- **Compradores**: conteo por estado, Filtros (Collapsible + Toggle; "Quitar filtros") y ranking. Fila: disco del semáforo, nombre, metadatos mono, ahorro del comprador o "No le conviene al comprador", margen % mono en color y $/mes. Hover o foco en una fila agranda su pin.
- **Detalle**: título 20 px con el comprador, escala del margen (zona negativa coral, 0 % y umbral punteados, marcador), barra "distancia vs. radio viable", tabla del desglose (header mono, cifras mono a la derecha, margen en color) y ahorro del comprador.
- **Supuestos**: editor con inputs de 16 px en mobile, ayuda y error vinculados con `aria-describedby`, "Restablecer supuestos".
- **Fuentes**: tabla Dato · Valor · Tipo (`real` relleno / `estimado` punteado) · "Ver fuente ↗" (popover con nota y links).

## 6. Mapa

- **Tiles**: Esri World Imagery, atribución "Imagen © Esri, Maxar, Earthstar Geographics", levemente apagado (`saturate(.8) brightness(.82)`). CARTO (Positron y Dark Matter) hoy devuelve tiles con "API KEY REQUIRED"; queda comentado como alternativa.
- **Escala métrica** (`ScaleControl`).
- **Plantas**: rombo de 16 px del tono del material con ícono de 9 px (árbol para aserraderos/foresto-industria, trigo para el molino arrocero) y contorno claro.
- **Compradores**: punto de 16 px con ícono de sector de 9 px (rayo, hoja, cítrico, galpón, carne). Forma según estado: salvia relleno (Cierra), anillo grueso ámbar (Justo), hueco con borde coral (No cierra), gris punteado y atenuado (No compra este material).
- **Elegido**: 21 px, anillo salvia de 2 px + halo suave, etiqueta permanente con el nombre y estado.
- Área táctil ≥ 24 px; los pines son enfocables con teclado (Leaflet) y tienen `aria-label` con nombre, localidad y estado.
- Círculo de radio y línea al comprador en salvia al 80 %.
- Testabilidad: `data-marker="gen-<id>"` / `data-marker="buyer-<id>"`, `data-light` en compradores, clases `radius-circle` y `route-line`.
- Los trazos de los íconos de pin son los de lucide (ISC) copiados a `markers.ts` para armar el HTML sin renderizar React.

## 7. Copy

Español rioplatense, voseo, sentence case. Semáforo: **Cierra / Justo / No cierra / No compra este material** en todos lados. Sin texto de entorno ("local", "Supabase", "base de datos", "demo"): el origen de datos solo está en `GET /api/health`.

## 8. Checklist

- [x] Sin paleta default de Tailwind; hex solo en `markers.ts`/`MapView.tsx` como espejo de tokens.
- [x] Geist + Geist Mono; tema oscuro único.
- [x] Cifras en mono tabular; restas con "−".
- [x] Contraste AA medido (tabla de arriba).
- [x] Semáforo con ícono + texto; en el mapa, forma distinta por estado.
- [x] Foco visible (anillo salvia) en combobox, cards de estado, pestañas, filas, chips, inputs, links y pines.
- [x] `prefers-reduced-motion`: sin `flyTo`, sin transiciones ni `animate-pulse`.
- [x] 375 px sin scroll horizontal.
- [x] `npm run test:e2e` 8/8.
