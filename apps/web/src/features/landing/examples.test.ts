import { describe, expect, it } from 'vitest';
import type { CatalogResponse, Generator } from '@mapa/core/contracts';
import { alternatives, assumptions, buyers, generators, materials, sources } from '@mapa/core/data';
import { buildExample, catalogFigures, pickExamples } from './examples';

const catalog = { sources, materials, alternatives, assumptions, generators, buyers } as CatalogResponse;
const molinos = generators.find((g) => g.id === 'molinos-ala-mercedes')!;

describe('buildExample', () => {
  it('Molinos Ala: una fila por estado, el radio crece de suelto a pellet y el mejor negocio cierra', () => {
    const ex = buildExample(catalog, molinos)!;
    expect(ex.rows.map((r) => r.state)).toEqual(['suelto', 'compactado', 'pellet']);
    expect(ex.rows[2].roadKm).toBeGreaterThan(ex.rows[0].roadKm);
    expect(ex.best?.match.result.light).toBe('verde');
  });
  it('el mejor negocio sale de un estado donde algo cierra', () => {
    const ex = buildExample(catalog, molinos)!;
    const row = ex.rows.find((r) => r.state === ex.best!.state)!;
    expect(row.closes).toBeGreaterThan(0);
  });
  it('sin material conocido, null', () => {
    expect(buildExample(catalog, { ...molinos, materialId: 'nada' } as unknown as Generator)).toBeNull();
  });
});

describe('pickExamples', () => {
  it('la planta pedida va primera, solo curadas que cierran y respeta el máximo', () => {
    const list = pickExamples(catalog, 'molinos-ala-mercedes', 3);
    expect(list[0].generator.id).toBe('molinos-ala-mercedes');
    expect(list.length).toBeLessThanOrEqual(3);
    expect(list.every((e) => e.best !== null && e.generator.origin !== 'publicacion')).toBe(true);
  });
});

describe('catalogFigures', () => {
  it('cuenta plantas, compradores, toneladas y plantas con algún negocio que cierra', () => {
    const f = catalogFigures(catalog);
    expect(f.plants).toBe(generators.length);
    expect(f.buyers).toBe(buyers.length);
    expect(f.tonsPerMonth).toBeGreaterThan(0);
    expect(f.plantsThatClose).toBeGreaterThan(0);
    expect(f.plantsThatClose).toBeLessThanOrEqual(f.plants);
  });
});
