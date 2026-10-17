import { describe, expect, it } from 'vitest';
import {
  GENERATOR_KIND_ICON,
  LIGHT_COLORS,
  MAP_COLORS,
  MATERIAL_COLORS,
  SECTOR_ICON,
  buyerPinHtml,
  buyerPinSpec,
  generatorPinHtml,
  generatorPinSpec,
  lightColor,
  mergedLabelHost,
} from './markers';
import { LIGHT_LABELS, MATERIAL_LABELS } from '@/shared/labels';

const idle = { selected: false, hot: false };

describe('colores del semáforo', () => {
  it('verde, ámbar y coral: los tokens ok/warn/bad (siguen al tema claro u oscuro); el pin usa los mismos tonos', () => {
    expect(lightColor('verde')).toBe('var(--color-ok)');
    expect(lightColor('amarillo')).toBe('var(--color-warn)');
    expect(lightColor('rojo')).toBe('var(--color-bad)');
    expect(buyerPinSpec('verde', idle).color).toBe(LIGHT_COLORS.verde);
  });
  it('el HTML de los pines no lleva hex del tema: solo variables (cambian sin rehacer los íconos)', () => {
    const buyer = buyerPinHtml(buyerPinSpec('amarillo', { selected: true, hot: false }, true), 'zap', 'buyer-t', 'amarillo').html;
    const gen = generatorPinHtml(generatorPinSpec('aserrin', { selected: true, hot: false }), 'tree-pine', 'gen-t').html;
    for (const html of [buyer, gen]) {
      expect(html).not.toMatch(/#0d1110|#8fb8a0|#e8ece9|#9aa5a0/i);
      expect(html).toContain('var(--');
    }
  });
  it('gris para "no compra este material"', () => {
    expect(lightColor(undefined)).toBe(LIGHT_COLORS.sinEvaluar);
  });
});

describe('etiquetas e íconos', () => {
  it('el semáforo usa el mismo vocabulario que el panel', () => {
    expect(LIGHT_LABELS).toEqual({ verde: 'Cierra', amarillo: 'Justo', rojo: 'No cierra', sinEvaluar: 'No compra este material' });
  });
  it('materiales: 4 tonos distintos, ninguno del semáforo ni del acento', () => {
    const colors = Object.values(MATERIAL_COLORS);
    expect(new Set(colors).size).toBe(4);
    for (const c of [...Object.values(LIGHT_COLORS), MAP_COLORS.selection]) expect(colors).not.toContain(c);
    expect(MATERIAL_LABELS.cascarilla).toBe('Cascarilla');
  });
  it('planta: árbol para aserraderos y foresto-industria, trigo para el molino arrocero', () => {
    expect(GENERATOR_KIND_ICON).toEqual({ aserradero: 'tree-pine', foresto_industria: 'tree-pine', molino_arrocero: 'wheat' });
  });
  it('cada sector comprador tiene un ícono propio', () => {
    expect(new Set(Object.values(SECTOR_ICON)).size).toBe(Object.keys(SECTOR_ICON).length);
    expect(SECTOR_ICON.central_biomasa).toBe('zap');
  });
});

describe('generatorPinSpec (rombo)', () => {
  it('normal: rombo de 16 px del tono del material, sin anillo ni etiqueta', () => {
    expect(generatorPinSpec('aserrin', idle)).toMatchObject({ size: 16, fill: MATERIAL_COLORS.aserrin, ring: false, label: false });
  });
  it('elegida: 21 px, anillo esmeralda y etiqueta, arriba de todo', () => {
    const s = generatorPinSpec('aserrin', { selected: true, hot: false });
    expect(s).toMatchObject({ size: 21, ring: true, label: true });
    expect(s.zIndexOffset).toBeGreaterThan(generatorPinSpec('aserrin', idle).zIndexOffset);
  });
});

describe('buyerPinSpec (punto)', () => {
  it('la forma cambia con el estado, así no depende solo del color', () => {
    expect(buyerPinSpec('verde', idle).shape).toBe('fill');
    expect(buyerPinSpec('amarillo', idle).shape).toBe('ring');
    expect(buyerPinSpec('rojo', idle).shape).toBe('hollow');
    expect(buyerPinSpec(undefined, idle).shape).toBe('muted');
  });
  it('evaluado: 16 px con el tono del semáforo; "no compra" más chico', () => {
    expect(buyerPinSpec('rojo', idle)).toMatchObject({ size: 16, color: LIGHT_COLORS.rojo });
    expect(buyerPinSpec(undefined, idle).size).toBeLessThan(16);
  });
  it('elegido: 21 px, anillo esmeralda y etiqueta, arriba', () => {
    const s = buyerPinSpec('verde', { selected: true, hot: false });
    expect(s).toMatchObject({ size: 21, ring: true, label: true });
    expect(s.zIndexOffset).toBeGreaterThan(buyerPinSpec('verde', idle).zIndexOffset);
  });
  it('resaltado desde el ranking: sube sin volverse elegido', () => {
    const h = buyerPinSpec('verde', { selected: false, hot: true });
    expect(h).toMatchObject({ hot: true, ring: false });
    expect(h.zIndexOffset).toBeGreaterThan(buyerPinSpec('verde', idle).zIndexOffset);
  });
});

describe('HTML de los pines', () => {
  it('planta: data-marker, ícono SVG y área táctil ≥ 24 px', () => {
    const { html, width, height } = generatorPinHtml(generatorPinSpec('chips', idle), 'wheat', 'gen-x');
    expect(html).toContain('data-marker="gen-x"');
    expect(html).toContain('<svg');
    expect(Math.min(width, height)).toBeGreaterThanOrEqual(24);
  });
  it('comprador: data-marker, data-light y un ícono de sector chiquito', () => {
    const { html, width } = buyerPinHtml(buyerPinSpec('amarillo', idle), 'zap', 'buyer-y', 'amarillo');
    expect(html).toContain('data-marker="buyer-y"');
    expect(html).toContain('data-light="amarillo"');
    expect(html.match(/<svg/g)?.length).toBe(1);
    expect(html).toContain('width="9"');
    expect(width).toBeGreaterThanOrEqual(24);
  });
  it('"no compra" se atenúa poco (opacidad 0,75) para que el contorno siga en ≥ 3:1', () => {
    const { html } = buyerPinHtml(buyerPinSpec(undefined, idle), 'zap', 'buyer-m', 'none');
    expect(html).toContain('opacity:0.75');
  });
  it('publicación: contorno punteado y data-origin; curado: sin punteado', () => {
    const pub = buyerPinHtml(buyerPinSpec('verde', idle, true), 'zap', 'buyer-pub-1', 'verde').html;
    expect(pub).toContain('data-origin="publicacion"');
    expect(pub).toContain('dashed');
    const cur = buyerPinHtml(buyerPinSpec('verde', idle), 'zap', 'buyer-x', 'verde').html;
    expect(cur).not.toContain('data-origin="publicacion"');
    expect(cur).not.toContain('dashed');
    const gen = generatorPinHtml(generatorPinSpec('aserrin', idle, true), 'tree-pine', 'gen-pub-1').html;
    expect(gen).toContain('data-origin="publicacion"');
    expect(gen).toContain('dashed');
  });
  it('escapa los atributos', () => {
    expect(buyerPinHtml(buyerPinSpec('verde', idle), 'zap', 'buyer-"x', 'verde').html).not.toContain('buyer-"x');
  });
});

describe('mergedLabelHost (etiquetas de planta y comprador que se pisan)', () => {
  it('lejos en pantalla: cada pin con su etiqueta', () => {
    expect(mergedLabelHost({ x: 0, y: 0 }, { x: 400, y: 0 })).toBeNull();
    expect(mergedLabelHost({ x: 0, y: 0 }, { x: 0, y: 120 })).toBeNull();
  });
  it('cerca: una sola etiqueta combinada, en el pin de más arriba', () => {
    expect(mergedLabelHost({ x: 0, y: 10 }, { x: 30, y: 0 })).toBe('buyer');
    expect(mergedLabelHost({ x: 0, y: 0 }, { x: 30, y: 20 })).toBe('gen');
  });
  it('mismo lugar: la etiqueta va en la planta', () => {
    expect(mergedLabelHost({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe('gen');
  });
});
