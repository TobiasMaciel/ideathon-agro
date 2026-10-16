import { describe, expect, it } from 'vitest';
import { LIGHT_COLORS, MATERIAL_COLORS, MATERIAL_LABELS, lightColor, generatorStyle, buyerStyle } from './markers';

describe('lightColor', () => {
  it('devuelve el color del semáforo', () => {
    expect(lightColor('verde')).toBe('#16a34a');
    expect(lightColor('amarillo')).toBe('#ca8a04');
    expect(lightColor('rojo')).toBe('#dc2626');
  });
  it('devuelve gris si no hay evaluación', () => {
    expect(lightColor(undefined)).toBe('#94a3b8');
    expect(LIGHT_COLORS.sinEvaluar).toBe('#94a3b8');
  });
});

describe('materiales', () => {
  it('tiene 4 colores distintos y etiquetas en español', () => {
    expect(new Set(Object.values(MATERIAL_COLORS)).size).toBe(4);
    expect(MATERIAL_LABELS.cascarilla).toBe('Cascarilla');
  });
});

describe('generatorStyle', () => {
  it('seleccionado es más grande y de borde grueso', () => {
    const a = generatorStyle('aserrin', false, 'x');
    const b = generatorStyle('aserrin', true, 'x');
    expect(a.radius).toBe(8);
    expect(b.radius).toBe(12);
    expect(b.pathOptions.weight).toBeGreaterThan(a.pathOptions.weight);
    expect(a.pathOptions.fillColor).toBe(MATERIAL_COLORS.aserrin);
    expect(a.pathOptions.className).toBe('gen-x');
  });
});

describe('buyerStyle', () => {
  it('usa el color del semáforo, borde punteado y tamaño mayor si está seleccionado', () => {
    const a = buyerStyle('rojo', false, 'y');
    const b = buyerStyle('rojo', true, 'y');
    expect(a.pathOptions.fillColor).toBe('#dc2626');
    expect(a.pathOptions.dashArray).toBeTruthy();
    expect(a.pathOptions.className).toBe('buyer-y');
    expect(b.radius).toBeGreaterThan(a.radius);
  });
});
