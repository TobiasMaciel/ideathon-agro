import type { HealthResponse } from '@mapa/core/contracts';
import type { Deps } from './deps';

/** Estado y origen de datos sin cargar el catálogo: con base configurada, 'database' solo si responde. */
export async function getHealth(deps: Pick<Deps, 'origin' | 'catalog'>): Promise<HealthResponse> {
  const origin = deps.origin === 'database' && (await deps.catalog.ping()) ? 'database' : 'local';
  return { ok: true, origin };
}
