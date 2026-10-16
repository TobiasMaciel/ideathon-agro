import type { Deps } from '../application/deps';
import type { Env } from '../config';

/** Tipos de Hono para toda la app: bindings del Worker y las deps del request. */
export interface AppEnv {
  Bindings: Env;
  Variables: { deps: Deps };
}
