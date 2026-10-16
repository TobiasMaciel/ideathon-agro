import { describe, expect, it } from 'vitest';
import { fromRows, toRows, type DataSet } from '../db/rows';
import { alternatives, assumptions, buyers, curatedContacts, generators, getSource, materials, sources } from './index';
import type { Tagged } from './types';

const data: DataSet = { sources, materials, alternatives, assumptions, generators, buyers };

/** Todos los valores etiquetados con un nombre legible para los mensajes de error. */
function allTagged(): { where: string; t: Tagged<unknown> }[] {
  const out: { where: string; t: Tagged<unknown> }[] = [];
  for (const m of materials) {
    out.push({ where: `${m.id}.rawMoisture`, t: m.rawMoisture });
    for (const [state, spec] of Object.entries(m.states)) {
      for (const [field, t] of Object.entries(spec)) out.push({ where: `${m.id}.${state}.${field}`, t });
    }
  }
  for (const a of alternatives) {
    for (const f of ['pricePerUnit', 'lhvMJPerUnit', 'efficiency', 'biomassEfficiency'] as const) {
      out.push({ where: `${a.id}.${f}`, t: a[f] });
    }
  }
  for (const a of assumptions) out.push({ where: `assumption.${a.key}`, t: a });
  for (const g of generators) out.push({ where: `${g.id}.tonsPerMonth`, t: g.tonsPerMonth });
  for (const b of buyers) {
    out.push({ where: `${b.id}.demandTonsPerMonth`, t: b.demandTonsPerMonth });
    out.push({ where: `${b.id}.currentAlternativeTag`, t: b.currentAlternativeTag });
  }
  return out;
}

const dups = (ids: string[]) => ids.filter((id, i) => ids.indexOf(id) !== i);

describe('integridad de src/data', () => {
  it('los ids son únicos en cada colección', () => {
    expect(dups(sources.map((s) => s.id))).toEqual([]);
    expect(dups(materials.map((m) => m.id))).toEqual([]);
    expect(dups(alternatives.map((a) => a.id))).toEqual([]);
    expect(dups(assumptions.map((a) => a.key))).toEqual([]);
    expect(dups(generators.map((g) => g.id))).toEqual([]);
    expect(dups(buyers.map((b) => b.id))).toEqual([]);
  });

  it('todo sourceIds referencia una fuente existente', () => {
    const missing: string[] = [];
    const check = (where: string, ids: string[]) => {
      for (const id of ids) if (!getSource(id)) missing.push(`${where}: ${id}`);
    };
    for (const { where, t } of allTagged()) check(where, t.sourceIds);
    for (const g of generators) check(`${g.id}.sourceIds`, g.sourceIds);
    for (const b of buyers) check(`${b.id}.sourceIds`, b.sourceIds);
    expect(missing).toEqual([]);
  });

  it('todo valor etiquetado tiene tag real|estimado y los estimados llevan nota', () => {
    const bad: string[] = [];
    for (const { where, t } of allTagged()) {
      if (t.tag !== 'real' && t.tag !== 'estimado') bad.push(`${where}: tag inválido`);
      if (t.tag === 'estimado' && !t.note?.trim()) bad.push(`${where}: estimado sin nota`);
    }
    expect(bad).toEqual([]);
  });

  it('las coordenadas están dentro del NEA', () => {
    const bad = [...generators, ...buyers]
      .filter(({ location: l }) => l.lat < -31 || l.lat > -26 || l.lng < -60 || l.lng > -53)
      .map((x) => x.id);
    expect(bad).toEqual([]);
  });

  it('las referencias entre colecciones existen', () => {
    const materialIds = new Set<string>(materials.map((m) => m.id));
    const altIds = new Set<string>(alternatives.map((a) => a.id));
    expect(generators.filter((g) => !materialIds.has(g.materialId)).map((g) => g.id)).toEqual([]);
    expect(buyers.filter((b) => !altIds.has(b.currentAlternative)).map((b) => b.id)).toEqual([]);
    expect(buyers.filter((b) => b.currentAlternativeTag.value !== b.currentAlternative).map((b) => b.id)).toEqual([]);
    expect(buyers.filter((b) => b.accepts.some((id) => !materialIds.has(id))).map((b) => b.id)).toEqual([]);
  });

  it('cada material tiene al menos el estado suelto', () => {
    expect(materials.filter((m) => !m.states.suelto).map((m) => m.id)).toEqual([]);
  });

  it('los valores físicos están en rango', () => {
    const bad: string[] = [];
    for (const m of materials) {
      if (m.rawMoisture.value < 0 || m.rawMoisture.value > 0.7) bad.push(`${m.id}.rawMoisture`);
      for (const [state, s] of Object.entries(m.states)) {
        const at = `${m.id}.${state}`;
        if (s.moisture.value < 0 || s.moisture.value > 0.7) bad.push(`${at}.moisture`);
        if (s.bulkDensityTPerM3.value < 0.05 || s.bulkDensityTPerM3.value > 1) bad.push(`${at}.bulkDensity`);
        if (s.lhvMJPerKg.value < 5 || s.lhvMJPerKg.value > 50) bad.push(`${at}.lhv`);
        if (s.pricePerTon.value <= 0) bad.push(`${at}.price`);
        const cond = s.conditioningCostPerTon.value;
        if (state === 'suelto' ? cond !== 0 : cond <= 0) bad.push(`${at}.conditioningCost`);
      }
    }
    for (const a of alternatives) {
      if (a.pricePerUnit.value <= 0) bad.push(`${a.id}.price`);
      if (a.lhvMJPerUnit.value < 5 || a.lhvMJPerUnit.value > 50) bad.push(`${a.id}.lhv`);
    }
    expect(bad).toEqual([]);
  });
});

describe('filas de la base', () => {
  it('fromRows(toRows(data)) devuelve los mismos datos', () => {
    expect(fromRows(toRows(data))).toEqual(data);
  });

  it('el round trip sobrevive a la serialización JSON (como al leer de la base)', () => {
    const viaJson = JSON.parse(JSON.stringify(toRows(data)));
    expect(fromRows(viaJson)).toEqual(data);
  });
});

describe('contactos corporativos curados', () => {
  const entityIds = new Set([...generators.map((g) => g.id), ...buyers.map((b) => b.id)]);

  it('cada contacto apunta a un generador o comprador curado existente', () => {
    expect(curatedContacts.filter((c) => !entityIds.has(c.entityId)).map((c) => c.entityId)).toEqual([]);
  });

  it('no hay contactos duplicados por establecimiento', () => {
    expect(dups(curatedContacts.map((c) => c.entityId))).toEqual([]);
  });

  it('cada sourceIds existe y hay al menos una fuente', () => {
    for (const c of curatedContacts) {
      expect(c.sourceIds.length, c.entityId).toBeGreaterThan(0);
      for (const id of c.sourceIds) expect(getSource(id), `${c.entityId}: ${id}`).toBeDefined();
    }
  });

  it('cada contacto tiene nombre y al menos teléfono, email o sitio web', () => {
    for (const c of curatedContacts) {
      expect(c.name.trim(), c.entityId).not.toBe('');
      expect(Boolean(c.phone ?? c.email ?? c.website), c.entityId).toBe(true);
    }
  });

  it('las URLs son https y el email tiene formato válido', () => {
    for (const c of curatedContacts) {
      if (c.website) expect(c.website, c.entityId).toMatch(/^https:\/\//);
      if (c.email) expect(c.email, c.entityId).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    }
    for (const id of curatedContacts.flatMap((c) => c.sourceIds)) expect(getSource(id)?.url).toMatch(/^https:\/\//);
  });

  it('el contacto no viaja dentro de Generator ni Buyer', () => {
    const json = JSON.stringify({ generators, buyers });
    for (const c of curatedContacts) {
      if (c.email) expect(json).not.toContain(c.email);
      if (c.phone) expect(json).not.toContain(c.phone);
    }
  });
});
