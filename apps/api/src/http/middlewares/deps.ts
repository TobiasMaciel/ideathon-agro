import type { MiddlewareHandler } from 'hono';
import type { Deps } from '../../application/deps';
import type { Env } from '../../config';
import type { AppEnv } from '../types';

/** Dependencias de un request y cómo liberarlas (p. ej. cerrar la conexión a Postgres). */
export interface RequestScope {
  deps: Deps;
  close(): Promise<void>;
}

export type MakeDeps = (env: Env) => RequestScope;

/**
 * Arma las deps del request y las cierra al terminar. En Workers el cierre va a `waitUntil` (no demora la
 * respuesta); sin ExecutionContext (tests, `app.request`) se espera en línea.
 */
export function provideDeps(makeDeps: MakeDeps): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const scope = makeDeps(c.env ?? {});
    c.set('deps', scope.deps);
    try {
      await next();
    } finally {
      const closing = scope.close().catch((e: unknown) => {
        console.error('No se pudo cerrar la conexión:', e instanceof Error ? e.message : String(e));
      });
      let ctx: { waitUntil(p: Promise<unknown>): void } | undefined;
      try {
        ctx = c.executionCtx;
      } catch {
        ctx = undefined;
      }
      if (ctx) ctx.waitUntil(closing);
      else await closing;
    }
  };
}
