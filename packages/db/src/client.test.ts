import { describe, expect, it } from 'vitest';
import { createDb } from './client';

describe('createDb', () => {
  it('no conecta al crearse y close() termina sin haber abierto un socket', async () => {
    // Puerto 1: nada escucha ahí. Si createDb conectara al crearse, close() o el test fallarían.
    const conn = createDb('postgres://u:p@127.0.0.1:1/x');
    await expect(conn.close()).resolves.toBeUndefined();
  });

  it('close() es idempotente', async () => {
    const conn = createDb('postgres://u:p@127.0.0.1:1/x');
    await conn.close();
    await expect(conn.close()).resolves.toBeUndefined();
  });
});
