// Errores esperables de los casos de uso. No conocen HTTP: http/respond.ts traduce `code` a status.
export type AppErrorCode = 'invalid' | 'not_found' | 'unprocessable' | 'too_large' | 'rate_limited';

export class AppError extends Error {
  constructor(
    readonly code: AppErrorCode,
    message: string,
    /** Detalle de validación (p. ej. cada campo inválido de una publicación). */
    readonly details?: string[],
  ) {
    super(message);
    this.name = 'AppError';
  }
}
