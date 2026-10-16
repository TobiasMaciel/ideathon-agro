import { AppError } from '../application/errors';

const invalidJson = () => new AppError('invalid', 'El cuerpo no es JSON válido.');

/** Lee el cuerpo JSON con tope de tamaño. Lanza AppError `too_large` (413) o `invalid` (400). */
export async function readJsonBody(req: Request, maxBytes = 4096): Promise<unknown> {
  const tooLarge = () => new AppError('too_large', `El cuerpo supera el máximo de ${maxBytes} bytes.`);
  const declared = Number(req.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) throw tooLarge();
  let text: string;
  try {
    text = await req.text();
  } catch {
    throw invalidJson();
  }
  if (new TextEncoder().encode(text).length > maxBytes) throw tooLarge();
  try {
    return JSON.parse(text);
  } catch {
    throw invalidJson();
  }
}
