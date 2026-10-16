import type { ApiError, ListingValidationError } from '@mapa/core/contracts';
import { AppError, type AppErrorCode } from '../application/errors';

export const NO_STORE = { 'Cache-Control': 'no-store' };

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: NO_STORE });
}

export function apiError(error: string, status: number): Response {
  return json({ error } satisfies ApiError, status);
}

const STATUS: Record<AppErrorCode, number> = {
  invalid: 400,
  not_found: 404,
  too_large: 413,
  unprocessable: 422,
  rate_limited: 429,
};

/** Único punto que traduce errores a HTTP: AppError -> su status; cualquier otro -> 500 sin detalles. */
export function errorResponse(err: unknown): Response {
  if (err instanceof AppError) {
    if (err.details) {
      return json({ error: err.message, details: err.details } satisfies ListingValidationError, STATUS[err.code]);
    }
    return apiError(err.message, STATUS[err.code]);
  }
  console.error('Error no controlado:', err instanceof Error ? err.message : String(err));
  return apiError('Error interno del servidor.', 500);
}
