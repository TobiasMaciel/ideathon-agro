import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { sql } from 'drizzle-orm';
import { alternatives, assumptions, buyers, generators, materials, sources } from '@mapa/core/data';
import type { ListingInput } from '@mapa/core/listings';
import { getListing, insertListing, loadListings } from './listings';
import { loadDataSet } from './repository';
import { seedDatabase } from './seed';
import { createTestDb } from './testing';

const oferta: ListingInput = {
  kind: 'oferta',
  name: 'Aserradero Don Pepe',
  locality: 'Ituzaingó',
  lat: -27.58,
  lng: -56.69,
  materialId: 'aserrin',
  tonsPerMonth: 120,
  moisture: 0.4,
  seasonality: 'Todo el año',
  contact: { name: 'Pepe', phone: '+54 379 412-3456' },
};
const demanda: ListingInput = {
  kind: 'demanda',
  name: 'Secadero La Esperanza',
  lat: -28.05,
  lng: -56,
  materialId: 'aserrin',
  tonsPerMonth: 80,
  currentAlternative: 'lena',
  sector: 'secadero_granos',
  contact: { email: 'compras@esperanza.com.ar' },
};

let ctx: Awaited<ReturnType<typeof createTestDb>>;
beforeAll(async () => {
  ctx = await createTestDb();
  await seedDatabase(ctx.db, { sources, materials, alternatives, assumptions, generators, buyers });
});
afterAll(async () => {
  await ctx.client.close();
});

describe('listings en Postgres (PGlite)', () => {
  it('inserta y lista ofertas y demandas con su contacto', async () => {
    const a = await insertListing(ctx.db, oferta, 'hash1');
    const b = await insertListing(ctx.db, demanda, 'hash2');
    expect(a.input).toEqual(oferta);
    expect(b.input).toEqual(demanda);
    const all = await loadListings(ctx.db);
    expect(all.map((l) => l.id).sort()).toEqual([a.id, b.id].sort());
    expect(await getListing(ctx.db, a.id)).toEqual(a);
  });
  it('getListing devuelve undefined si no existe o el id no es uuid', async () => {
    expect(await getListing(ctx.db, '00000000-0000-4000-8000-000000000000')).toBeUndefined();
    expect(await getListing(ctx.db, 'curado-1')).toBeUndefined();
  });
  it('guarda el hash de la IP y nace sin verificar', async () => {
    const r = await ctx.client.query<{ ip_hash: string; verified: boolean }>(
      "select ip_hash, verified from listings where ip_hash = 'hash1'",
    );
    expect(r.rows[0]).toEqual({ ip_hash: 'hash1', verified: false });
  });
  it('loadDataSet sigue devolviendo solo lo curado', async () => {
    const data = await loadDataSet(ctx.db);
    expect(data.generators).toHaveLength(generators.length);
    expect(data.buyers).toHaveLength(buyers.length);
  });
  it('los checks rechazan datos inválidos aunque se salte la validación', async () => {
    await expect(insertListing(ctx.db, { ...oferta, lat: 10 }, 'h')).rejects.toThrow();
    await expect(insertListing(ctx.db, { ...oferta, tonsPerMonth: 0 }, 'h')).rejects.toThrow();
    await expect(insertListing(ctx.db, { ...oferta, contact: { name: 'solo nombre' } }, 'h')).rejects.toThrow();
    await expect(insertListing(ctx.db, { ...oferta, contact: { email: 'sin-arroba' } }, 'h')).rejects.toThrow();
    await expect(insertListing(ctx.db, { ...demanda, sector: undefined }, 'h')).rejects.toThrow();
  });
});

describe('rol mapa_api', () => {
  const priv = async (table: string, p: string) => {
    const r = await ctx.db.execute(sql`select has_table_privilege('mapa_api', ${table}, ${p}) as ok`);
    return (r.rows[0] as { ok: boolean }).ok;
  };
  it('puede INSERT y SELECT en listings', async () => {
    expect(await priv('listings', 'INSERT')).toBe(true);
    expect(await priv('listings', 'SELECT')).toBe(true);
  });
  it('NO puede escribir los datos curados ni UPDATE/DELETE en listings', async () => {
    for (const t of ['generators', 'buyers', 'materials', 'assumptions']) {
      expect(await priv(t, 'INSERT')).toBe(false);
      expect(await priv(t, 'UPDATE')).toBe(false);
      expect(await priv(t, 'DELETE')).toBe(false);
      expect(await priv(t, 'SELECT')).toBe(true);
    }
    expect(await priv('listings', 'UPDATE')).toBe(false);
    expect(await priv('listings', 'DELETE')).toBe(false);
  });
});
