export const NO_STORE = { 'Cache-Control': 'no-store' };

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: NO_STORE });
}

export function apiError(error: string, status: number): Response {
  return json({ error }, status);
}

export type JsonBody = { ok: true; value: unknown } | { ok: false; response: Response };

/** Lee el cuerpo JSON de un request con tope de tamaño (413 si se pasa, 400 si no es JSON). */
export async function readJsonBody(req: Request, maxBytes = 4096): Promise<JsonBody> {
  const tooLarge = (): JsonBody => ({
    ok: false,
    response: apiError(`El cuerpo supera el máximo de ${maxBytes} bytes.`, 413),
  });
  const declared = Number(req.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) return tooLarge();
  let text: string;
  try {
    text = await req.text();
  } catch {
    return { ok: false, response: apiError('El cuerpo no es JSON válido.', 400) };
  }
  if (new TextEncoder().encode(text).length > maxBytes) return tooLarge();
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, response: apiError('El cuerpo no es JSON válido.', 400) };
  }
}
