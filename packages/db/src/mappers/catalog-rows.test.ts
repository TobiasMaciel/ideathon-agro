import { describe, expect, it } from 'vitest';
import { alternatives, assumptions, buyers, generators, materials, sources } from '@mapa/core/data';
import { fromRows, toRows } from './catalog-rows';

const data = { sources, materials, alternatives, assumptions, generators, buyers };

describe('fromRows / toRows', () => {
  it('reconstruye el catálogo local sin cambios (ida y vuelta)', () => {
    expect(fromRows(toRows(data))).toEqual(data);
  });

  it('el round trip sobrevive a la serialización JSON (como al leer de la base)', () => {
    const viaJson = JSON.parse(JSON.stringify(toRows(data)));
    expect(fromRows(viaJson)).toEqual(data);
  });

  it("reemplaza por '#' las URLs de fuentes que no son http(s)", () => {
    const rows = toRows(data);
    rows.sources = [
      { ...rows.sources[0], id: 'a', url: 'javascript:alert(1)' },
      { ...rows.sources[0], id: 'b', url: 'data:text/html,x' },
      { ...rows.sources[0], id: 'c', url: 'https://ejemplo.org/x' },
      { ...rows.sources[0], id: 'd', url: 'http://ejemplo.org/x' },
    ];
    expect(fromRows(rows).sources.map((s) => s.url)).toEqual(['#', '#', 'https://ejemplo.org/x', 'http://ejemplo.org/x']);
  });
});
