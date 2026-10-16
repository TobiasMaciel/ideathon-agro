import { describe, expect, it } from 'vitest';
import type { CatalogResponse } from '@mapa/core/contracts';
import { alternatives, assumptions, buyers, generators, materials, sources } from '@mapa/core/data';
import { buildKpis, countLights, dataItems, defaultGeneratorId, derive, mapGenerators, stateStats } from './derive';
import { initialState } from './state';

const catalog = { sources, materials, alternatives, assumptions, generators, buyers } as CatalogResponse;
const molinos = generators.find((g) => g.id === 'molinos-ala-mercedes')!;
const cascarilla = materials.find((m) => m.id === molinos.materialId)!;
const app = initialState(molinos.id);

describe('defaultGeneratorId', () => {
  it('arranca en Molinos Ala si está en el catálogo', () => {
    expect(defaultGeneratorId(catalog)).toBe('molinos-ala-mercedes');
  });
  it('si no está, la primera planta; sin plantas, vacío', () => {
    const others = generators.filter((g) => g.id !== 'molinos-ala-mercedes');
    expect(defaultGeneratorId({ ...catalog, generators: others })).toBe(others[0].id);
    expect(defaultGeneratorId({ ...catalog, generators: [] })).toBe('');
  });
});

describe('derive', () => {
  it('ranking ordenado por semáforo (verde primero) y un semáforo por comprador', () => {
    const d = derive(catalog, molinos, cascarilla, app);
    const order = { verde: 0, amarillo: 1, rojo: 2 };
    const lights = d.ranking.map((r) => order[r.result.light]);
    expect(lights).toEqual([...lights].sort((a, b) => a - b));
    expect(Object.keys(d.lights)).toHaveLength(d.ranking.length);
  });
  it('del suelto al pellet: Duhalde pasa de rojo a verde y el radio crece', () => {
    const suelto = derive(catalog, molinos, cascarilla, app);
    const pellet = derive(catalog, molinos, cascarilla, { ...app, state: 'pellet' });
    expect(suelto.lights['duhalde-curuzu']).toBe('rojo');
    expect(pellet.lights['duhalde-curuzu']).toBe('verde');
    expect(pellet.roadKm).toBeGreaterThan(suelto.roadKm * 5);
  });
  it('un estado que el material no tiene cae a suelto (costaneros solo se vende suelto)', () => {
    const costaneros = materials.find((m) => m.id === 'costaneros')!;
    const gen = generators.find((g) => g.materialId === 'costaneros')!;
    const d = derive(catalog, gen, costaneros, { ...app, state: 'pellet' });
    expect(d.states).toEqual(['suelto']);
    expect(d.state).toBe('suelto');
  });
  it('el filtro de sectores deja solo esos compradores', () => {
    const d = derive(catalog, molinos, cascarilla, { ...app, sectors: ['secadero_granos'] });
    expect(d.buyers.every((b) => b.sector === 'secadero_granos')).toBe(true);
  });
});

describe('stateStats y KPIs', () => {
  it('un dato por estado disponible, coherente con derive', () => {
    const d = derive(catalog, molinos, cascarilla, app);
    const stats = stateStats(catalog, molinos, cascarilla, app, d);
    expect(Object.keys(stats).sort()).toEqual([...d.states].sort());
    expect(stats.suelto?.closes).toBe(countLights(d.ranking).verde);
  });
  it('"Cierran" cuenta los verdes sobre el ranking y dice el estado', () => {
    const d = derive(catalog, molinos, cascarilla, { ...app, state: 'pellet' });
    const cierran = buildKpis(catalog, d, 5).find((k) => k.label === 'Cierran')!;
    expect(cierran.value).toBe(`${countLights(d.ranking).verde} de ${d.ranking.length}`);
    expect(cierran.sub).toBe('vendiendo en pellet');
  });
  it('mapGenerators: filtra por material pero siempre deja la planta elegida', () => {
    const shown = mapGenerators(catalog, molinos.id, ['aserrin']);
    expect(shown.some((g) => g.id === molinos.id)).toBe(true);
    expect(shown.every((g) => g.id === molinos.id || g.materialId === 'aserrin')).toBe(true);
  });
});

describe('dataItems', () => {
  it('cada valor lleva su etiqueta real/estimado; con comprador elegido suma su consumo', () => {
    const d = derive(catalog, molinos, cascarilla, app);
    const items = dataItems(catalog, molinos, cascarilla, d, d.ranking[0]);
    expect(items.every((i) => i.tagged.tag === 'real' || i.tagged.tag === 'estimado')).toBe(true);
    expect(items.some((i) => i.label.startsWith('Consumo actual del comprador'))).toBe(true);
    expect(items.at(-1)?.label).toBe('Generación de la planta');
  });
});
