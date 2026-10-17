// Lógica pura de los pines del mapa (sin Leaflet ni React): colores, íconos, tamaños y su HTML.
// Leaflet no lee clases de Tailwind: el HTML usa las variables CSS de los tokens (src/index.css), así los pines
// siguen al tema claro u oscuro sin rehacerse. Solo los tonos de material (iguales en ambos temas) van en hex.
import type { BuyerSector, GeneratorKind, MaterialId } from '@mapa/core/contracts';
import type { TrafficLight } from '@mapa/core/contracts';

export const MAP_COLORS = {
  ink: 'var(--pin-center)', // centro de los pines huecos (tinta oscura en el tema oscuro, blanco en el claro)
  onFill: 'var(--pin-on-fill)', // ícono sobre el disco relleno
  glyph: 'var(--pin-glyph)', // ícono sobre el centro
  selection: 'var(--color-selection)', // acento azul: anillo, halo, borrador
  surface: 'var(--pin-outline)', // contorno de los pines curados
  dash: 'var(--pin-dash)', // contorno punteado de las publicaciones
  neutral: 'var(--pin-neutral)', // rombo neutro de la leyenda
  shadow: 'var(--pin-shadow)',
} as const;

/** Semáforo: verde / ámbar / coral (--color-ok/warn/bad); gris para "no compra". */
export const LIGHT_COLORS = {
  verde: 'var(--color-ok)',
  amarillo: 'var(--color-warn)',
  rojo: 'var(--color-bad)',
  sinEvaluar: 'var(--pin-muted)',
} as const;

/**
 * Tono de la gota de cada planta (ícono blanco encima, ≥ 4,3:1). Medidos con ΔE2000: ≥ 14,9 entre sí con visión
 * normal y con deuteranopia, protanopia y tritanopia simuladas, y ≥ 17 contra el semáforo, el acento y la tinta.
 */
export const MATERIAL_COLORS: Record<MaterialId, string> = {
  aserrin: '#6f4fa0',
  chips: '#287a78',
  costaneros: '#5a3826',
  cascarilla: '#8a7a24',
};

/**
 * Trazos de lucide (ISC, https://lucide.dev) copiados para armar el HTML del pin sin renderizar React.
 * Mismo dibujo que los componentes de lucide-react que usa el panel.
 */
export const ICON_PATHS = {
  'tree-pine':
    '<path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z"/><path d="M12 22v-3"/>',
  wheat:
    '<path d="M2 22 16 8"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/>',
  zap: '<path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"/>',
  leaf: '<path d="M11 20a10 10 0 0010-10 25.9 25.9 0 00-1.04-7.281 1 1 0 00-1.755-.325C15.833 5.5 13 5.5 9.8 6.1A7 7 0 0011 20"/><path d="M2 21a5 5 0 012.911-4.544C7.613 15.212 8.351 15.24 11 13"/>',
  citrus:
    '<path d="M21.66 17.67a1.08 1.08 0 0 1-.04 1.6A12 12 0 0 1 4.73 2.38a1.1 1.1 0 0 1 1.61-.04z"/><path d="M19.65 15.66A8 8 0 0 1 8.35 4.34"/><path d="m14 10-5.5 5.5"/><path d="M14 17.85V10H6.15"/>',
  warehouse:
    '<path d="M18 21V10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v11"/><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 1.132-1.803l7.95-3.974a2 2 0 0 1 1.837 0l7.948 3.974A2 2 0 0 1 22 8z"/><path d="M6 13h12"/><path d="M6 17h12"/>',
  beef: '<path d="M16.4 13.7A6.5 6.5 0 1 0 6.28 6.6c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c4 0 8.4-1.8 11.4-4.3"/><path d="m18.5 6 1.754 3.5a6.48 6.48 0 0 1-1.854 8.2C15.4 20.2 11 22 7 22a3 3 0 0 1-2.68-1.66L2.4 16.5"/><circle cx="12.5" cy="8.5" r="2.5"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  bang: '<path d="M12 5v9"/><path d="M12 19v.01"/>',
} as const;

export type PinIcon = keyof typeof ICON_PATHS;

export const GENERATOR_KIND_ICON: Record<GeneratorKind, PinIcon> = {
  aserradero: 'tree-pine',
  foresto_industria: 'tree-pine',
  molino_arrocero: 'wheat',
};

export const SECTOR_ICON: Record<BuyerSector, PinIcon> = {
  central_biomasa: 'zap',
  yerbatera: 'leaf',
  citricola: 'citrus',
  secadero_granos: 'warehouse',
  frigorifico: 'beef',
};

export function lightColor(light: TrafficLight | undefined): string {
  return light ? LIGHT_COLORS[light] : LIGHT_COLORS.sinEvaluar;
}

export interface PinState {
  selected: boolean;
  /** Resaltado desde el ranking (hover o foco en la fila). */
  hot: boolean;
}

/** Área táctil mínima (WCAG 2.5.8). */
const HIT = 24;
const RING = `0 0 0 2px ${MAP_COLORS.ink}, 0 0 0 4px ${MAP_COLORS.selection}, 0 0 0 10px color-mix(in srgb, ${MAP_COLORS.selection} 18%, transparent)`;
const SOFT = `0 1px 3px ${MAP_COLORS.shadow}`;
/** Publicación sin verificar: contorno punteado separado del pin (en vez del contorno sólido). */
const DASHED = `outline:1.5px dashed ${MAP_COLORS.dash};outline-offset:2px`;

/** Contorno del pin: anillo si está elegido; si no, sólido (curado) o punteado (publicación). */
function outlineStyle(ring: boolean, published: boolean): string {
  if (ring) return `box-shadow:${RING}`;
  return published ? `box-shadow:${SOFT};${DASHED}` : `box-shadow:0 0 0 1.5px ${MAP_COLORS.surface}, ${SOFT}`;
}

function originAttr(published: boolean): string {
  return published ? ' data-origin="publicacion"' : '';
}

function svgIcon(icon: PinIcon, size: number, color: string, strokeWidth: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block">${ICON_PATHS[icon]}</svg>`;
}

function attr(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

export interface GeneratorPinSpec {
  size: number;
  fill: string;
  ring: boolean;
  label: boolean;
  hot: boolean;
  /** Publicación abierta (sin verificar): contorno punteado. */
  published: boolean;
  zIndexOffset: number;
}

export function generatorPinSpec(materialId: MaterialId, { selected, hot }: PinState, published = false): GeneratorPinSpec {
  return {
    published,
    size: selected ? 21 : 16,
    fill: MATERIAL_COLORS[materialId],
    ring: selected,
    label: selected,
    hot,
    zIndexOffset: selected ? 2000 : hot ? 1500 : 400,
  };
}

function wrap(box: number, inner: string, attrs: string, extraStyle = ''): string {
  return `<div class="pin-body" ${attrs} style="position:relative;display:flex;align-items:center;justify-content:center;width:${box}px;height:${box}px;${extraStyle}">${inner}</div>`;
}

/** Ícono claro sobre los tonos de material (iguales en ambos temas). */
const MATERIAL_GLYPH = '#ffffff';

/** Rombo del tono del material con un ícono blanco chiquito (árbol o trigo) sin rotar. */
export function generatorPinHtml(spec: GeneratorPinSpec, icon: PinIcon, marker: string): { html: string; width: number; height: number } {
  // El rombo es un cuadrado rotado: su diagonal ocupa ~1,41 × el lado.
  const side = Math.round(spec.size / Math.SQRT2 + 3);
  const box = Math.max(HIT, spec.size + 10);
  const diamond = `<span style="position:absolute;width:${side}px;height:${side}px;background:${spec.fill};border-radius:3px;transform:rotate(45deg);${outlineStyle(spec.ring, spec.published)}"></span>`;
  const glyph = `<span style="position:relative">${svgIcon(icon, spec.ring ? 11 : 9, MATERIAL_GLYPH, 2.5)}</span>`;
  return { html: wrap(box, diamond + glyph, `data-marker="${attr(marker)}"${originAttr(spec.published)}`), width: box, height: box };
}

/** verde = relleno · amarillo = anillo grueso con centro blanco · rojo = hueco con borde · no compra = gris chico. */
export type BuyerShape = 'fill' | 'ring' | 'hollow' | 'muted';
const SHAPES: Record<TrafficLight, BuyerShape> = { verde: 'fill', amarillo: 'ring', rojo: 'hollow' };

export interface BuyerPinSpec {
  size: number;
  shape: BuyerShape;
  color: string;
  ring: boolean;
  label: boolean;
  hot: boolean;
  /** Publicación abierta (sin verificar): contorno punteado. */
  published: boolean;
  zIndexOffset: number;
}

export function buyerPinSpec(light: TrafficLight | undefined, { selected, hot }: PinState, published = false): BuyerPinSpec {
  return {
    published,
    size: light ? (selected ? 21 : 16) : selected ? 16 : 13,
    shape: light ? SHAPES[light] : 'muted',
    color: LIGHT_COLORS[light ?? 'sinEvaluar'],
    ring: selected,
    label: selected,
    hot,
    zIndexOffset: selected ? 1800 : hot ? 1500 : light ? 300 : 0,
  };
}

/** Punto con la forma del semáforo y el ícono del sector (sobre el relleno o sobre el centro, según el tema). */
export function buyerPinHtml(spec: BuyerPinSpec, icon: PinIcon, marker: string, light: string): { html: string; width: number; height: number } {
  const s = spec.size;
  const box = Math.max(HIT, s + 10);
  const styles: Record<BuyerShape, string> = {
    fill: `background:${spec.color}`,
    ring: `background:${MAP_COLORS.ink};border:3px solid ${spec.color}`,
    hollow: `background:${MAP_COLORS.ink};border:2px solid ${spec.color}`,
    muted: `background:${MAP_COLORS.ink};border:1.5px dashed ${spec.color}`,
  };
  const iconColor = spec.shape === 'fill' ? MAP_COLORS.onFill : spec.shape === 'muted' ? LIGHT_COLORS.sinEvaluar : MAP_COLORS.glyph;
  const iconSize = spec.ring ? 11 : spec.shape === 'muted' ? 7 : 9;
  const dot = `<span style="display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:${s}px;height:${s}px;border-radius:9999px;${styles[spec.shape]};${outlineStyle(spec.ring, spec.published)}">${svgIcon(icon, iconSize, iconColor, 2.5)}</span>`;
  return {
    html: wrap(box, dot, `data-marker="${attr(marker)}" data-light="${attr(light)}"${originAttr(spec.published)}`,
      // Atenuado, pero con el contorno claro en ≥ 3:1 sobre el mapa (0,55 daba ~2,9:1).
      spec.shape === 'muted' && !spec.ring ? 'opacity:0.75;' : '',
    ),
    width: box,
    height: box,
  };
}

type Pt = { x: number; y: number };

/**
 * Las etiquetas permanentes van arriba de cada pin: si la planta y el comprador elegidos quedan cerca en pantalla, se
 * pisan. En ese caso se muestra una sola etiqueta "Planta → Comprador" en el pin de más arriba (empate: la planta).
 * Umbral: ancho típico de una etiqueta (~200 px) y alto de etiqueta + pin (~48 px). Devuelve null si no se pisan.
 */
export function mergedLabelHost(gen: Pt, buyer: Pt, minDx = 200, minDy = 48): 'gen' | 'buyer' | null {
  if (Math.abs(gen.x - buyer.x) >= minDx || Math.abs(gen.y - buyer.y) >= minDy) return null;
  return buyer.y < gen.y ? 'buyer' : 'gen';
}
