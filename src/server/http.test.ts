import { describe, expect, it } from 'vitest';
import { readJsonBody } from './http';

const post = (body: string, headers: Record<string, string> = {}) =>
  new Request('http://localhost/api/x', { method: 'POST', body, headers });

describe('readJsonBody', () => {
  it('devuelve el valor parseado de un JSON válido', async () => {
    const r = await readJsonBody(post('{"a":1}'));
    expect(r).toEqual({ ok: true, value: { a: 1 } });
  });

  it('responde 400 si el cuerpo no es JSON', async () => {
    const r = await readJsonBody(post('no es json'));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.response.status).toBe(400);
      expect(await r.response.json()).toEqual({ error: 'El cuerpo no es JSON válido.' });
    }
  });

  it('responde 413 si content-length supera el máximo', async () => {
    const r = await readJsonBody(post('{}', { 'content-length': '5000' }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.response.status).toBe(413);
  });

  it('responde 413 si el texto supera el máximo aunque no haya content-length', async () => {
    const big = JSON.stringify({ x: 'a'.repeat(5000) });
    const r = await readJsonBody(post(big));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.response.status).toBe(413);
  });

  it('respeta un máximo personalizado', async () => {
    const r = await readJsonBody(post('{"a":1}'), 3);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.response.status).toBe(413);
  });
});
