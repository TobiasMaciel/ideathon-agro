import { describe, expect, it } from 'vitest';
import { AppError } from '../application/errors';
import { readJsonBody } from './body';
import { errorResponse } from './respond';

const post = (body: string, headers: Record<string, string> = {}) =>
  new Request('http://localhost/api/x', { method: 'POST', body, headers });

/** Respuesta HTTP que produciría el error lanzado por readJsonBody. */
async function failure(run: Promise<unknown>): Promise<Response> {
  const err = await run.then(
    () => expect.fail('debía fallar'),
    (e: unknown) => e,
  );
  expect(err).toBeInstanceOf(AppError);
  return errorResponse(err);
}

describe('readJsonBody', () => {
  it('devuelve el valor parseado de un JSON válido', async () => {
    expect(await readJsonBody(post('{"a":1}'))).toEqual({ a: 1 });
  });

  it('responde 400 si el cuerpo no es JSON', async () => {
    const res = await failure(readJsonBody(post('no es json')));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'El cuerpo no es JSON válido.' });
  });

  it('responde 413 si content-length supera el máximo', async () => {
    expect((await failure(readJsonBody(post('{}', { 'content-length': '5000' })))).status).toBe(413);
  });

  it('responde 413 si el texto supera el máximo aunque no haya content-length', async () => {
    const big = JSON.stringify({ x: 'a'.repeat(5000) });
    expect((await failure(readJsonBody(post(big)))).status).toBe(413);
  });

  it('respeta un máximo personalizado', async () => {
    expect((await failure(readJsonBody(post('{"a":1}'), 3))).status).toBe(413);
  });
});

describe('errorResponse', () => {
  it('mapea cada código de AppError a su status', async () => {
    const cases = [
      ['invalid', 400],
      ['not_found', 404],
      ['too_large', 413],
      ['unprocessable', 422],
      ['rate_limited', 429],
    ] as const;
    for (const [code, status] of cases) expect(errorResponse(new AppError(code, 'x')).status).toBe(status);
  });

  it('incluye details cuando el error los trae', async () => {
    const res = errorResponse(new AppError('invalid', 'No válida.', ['a', 'b']));
    expect(await res.json()).toEqual({ error: 'No válida.', details: ['a', 'b'] });
  });

  it('cualquier otro error es 500 sin filtrar el mensaje interno', async () => {
    const original = console.error;
    console.error = () => {};
    try {
      const res = errorResponse(new Error('secreto de la base'));
      expect(res.status).toBe(500);
      expect(await res.text()).not.toContain('secreto');
    } finally {
      console.error = original;
    }
  });
});
