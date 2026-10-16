import { describe, expect, it } from 'vitest';
import { curatedContacts, generators } from '@mapa/core/data';
import { hashIp } from './ip-hash';
import { createLocalCatalogRepository } from './local-catalog-repository';
import { createLocalContactDirectory } from './local-contact-directory';

describe('createLocalCatalogRepository', () => {
  it('carga el catálogo curado de core y siempre responde ping', async () => {
    const repo = createLocalCatalogRepository();
    expect((await repo.load()).generators).toHaveLength(generators.length);
    expect(await repo.ping()).toBe(true);
  });
});

describe('createLocalContactDirectory', () => {
  it('devuelve el contacto curado por id, o undefined', async () => {
    const dir = createLocalContactDirectory();
    expect(await dir.get(curatedContacts[0].entityId)).toEqual(curatedContacts[0]);
    expect(await dir.get('duhalde-curuzu')).toBeUndefined();
  });
});

describe('hashIp', () => {
  it('es SHA-256 hex, determinista y depende de la sal', async () => {
    const a = await hashIp('1.2.3.4', 's1');
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(await hashIp('1.2.3.4', 's1')).toBe(a);
    expect(await hashIp('1.2.3.4', 's2')).not.toBe(a);
    expect(a).not.toContain('1.2.3.4');
  });
});
