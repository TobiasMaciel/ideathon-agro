import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { sql } from 'drizzle-orm';
import { alternatives, assumptions, buyers, curatedContacts, generators, materials, sources } from '@mapa/core/data';
import { contacts } from '../schema';
import { seedDatabase } from '../seed';
import { createTestDb } from '../testing';
import { loadCatalog } from './pg-catalog-repository';
import { createPgContactDirectory, getCuratedContact } from './pg-contact-directory';

const data = { sources, materials, alternatives, assumptions, generators, buyers, contacts: curatedContacts };

let ctx: Awaited<ReturnType<typeof createTestDb>>;
beforeAll(async () => {
  ctx = await createTestDb();
  await seedDatabase(ctx.db, data);
});
afterAll(async () => {
  await ctx.client.close();
});

describe('contactos curados en Postgres (PGlite)', () => {
  it('el seed los guarda y getCuratedContact los devuelve idénticos', async () => {
    for (const c of curatedContacts) expect(await getCuratedContact(ctx.db, c.entityId)).toEqual(c);
  });
  it('el directorio satisface el puerto', async () => {
    const dir = createPgContactDirectory(ctx.db);
    expect(await dir.get('molinos-ala-mercedes')).toEqual(curatedContacts.find((c) => c.entityId === 'molinos-ala-mercedes'));
  });
  it('un establecimiento sin contacto devuelve undefined', async () => {
    expect(await getCuratedContact(ctx.db, 'duhalde-curuzu')).toBeUndefined();
  });
  it('el seed es idempotente', async () => {
    await seedDatabase(ctx.db, data);
    expect(await ctx.db.select().from(contacts)).toHaveLength(curatedContacts.length);
  });
  it('loadCatalog no trae contactos', async () => {
    expect('contacts' in (await loadCatalog(ctx.db))).toBe(false);
  });
  it('mapa_readonly y mapa_api pueden SELECT; ninguno escribe', async () => {
    for (const role of ['mapa_readonly', 'mapa_api']) {
      const r = await ctx.db.execute(
        sql`select has_table_privilege(${role}, 'public.contacts', 'SELECT') as s, has_table_privilege(${role}, 'public.contacts', 'INSERT') as i, has_table_privilege(${role}, 'public.contacts', 'UPDATE') as u, has_table_privilege(${role}, 'public.contacts', 'DELETE') as d`,
      );
      expect(r.rows[0]).toEqual({ s: true, i: false, u: false, d: false });
    }
  });
  it('los checks rechazan formatos inválidos', async () => {
    const base = { entityId: 'x', name: 'Empresa X', sourceIds: ['s'] };
    await expect(ctx.db.insert(contacts).values({ ...base, email: 'sin-arroba' })).rejects.toThrow();
    await expect(ctx.db.insert(contacts).values({ ...base, website: 'http://inseguro.com' })).rejects.toThrow();
    await expect(ctx.db.insert(contacts).values({ ...base })).rejects.toThrow();
  });
});
