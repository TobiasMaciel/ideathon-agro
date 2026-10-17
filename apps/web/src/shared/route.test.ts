import { describe, expect, it } from 'vitest';
import { routeFromHash } from './route';

describe('routeFromHash', () => {
  it('sin hash o con cualquier otro valor abre el mapa', () => {
    expect(routeFromHash('')).toBe('mapa');
    expect(routeFromHash('#/mapa')).toBe('mapa');
    expect(routeFromHash('#/algo')).toBe('mapa');
  });
  it('#/inicio y #inicio abren la portada', () => {
    expect(routeFromHash('#/inicio')).toBe('inicio');
    expect(routeFromHash('#inicio')).toBe('inicio');
  });
});
