import type { MiddlewareHandler } from 'hono';

/** Headers de seguridad en todas las respuestas (incluidos 404 y errores). */
export const securityHeaders: MiddlewareHandler = async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('X-Frame-Options', 'DENY');
  c.header('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
};
