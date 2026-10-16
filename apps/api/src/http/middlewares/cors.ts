import type { MiddlewareHandler } from 'hono';
import { cors } from 'hono/cors';
import { parseConfig } from '../../config';
import type { AppEnv } from '../types';

/** CORS: solo los orígenes de ALLOWED_ORIGINS (leídos del binding en cada request). */
export const corsFromEnv: MiddlewareHandler<AppEnv> = (c, next) => {
  const { allowedOrigins } = parseConfig(c.env ?? {});
  return cors({
    origin: (origin) => (allowedOrigins.includes(origin) ? origin : null),
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    maxAge: 600,
  })(c, next);
};
