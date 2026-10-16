// Único lugar de la web que hace fetch (lo exige ESLint). URL base de la API en un solo lugar.

/** Vacío en dev (Vite hace proxy de /api); en producción, la URL del Worker sin barra final. */
export const BASE = import.meta.env?.VITE_API_URL ?? '';

export interface RawResponse {
  status: number;
  body: unknown;
}

async function readJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/** GET/POST a la API con el cuerpo ya leído como JSON (null si no es JSON). Los errores de red se propagan. */
export async function request(path: string, init?: RequestInit): Promise<RawResponse> {
  const res = await fetch(`${BASE}${path}`, init);
  return { status: res.status, body: await readJson(res) };
}
