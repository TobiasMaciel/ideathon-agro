import type { ViabilityRequest, ViabilityResponse } from '@mapa/core/contracts';
import { availableStates, evaluateMatch as runMatch } from '@mapa/core/match';
import type { Deps } from './deps';
import { AppError } from './errors';

/** Evalúa un match generador → comprador del catálogo curado (mismo modelo que el front). */
export async function evaluateMatch(deps: Pick<Deps, 'catalog'>, request: ViabilityRequest): Promise<ViabilityResponse> {
  const data = await deps.catalog.load();
  const generator = data.generators.find((g) => g.id === request.generatorId);
  if (!generator) throw new AppError('not_found', `No existe el generador "${request.generatorId}".`);
  const buyer = data.buyers.find((x) => x.id === request.buyerId);
  if (!buyer) throw new AppError('not_found', `No existe el comprador "${request.buyerId}".`);
  const material = data.materials.find((m) => m.id === generator.materialId);
  if (!material) throw new AppError('not_found', `No existe el material "${generator.materialId}".`);

  if (!availableStates(material).includes(request.state)) {
    throw new AppError('unprocessable', `El material "${material.name}" no está disponible en estado "${request.state}".`);
  }
  if (!buyer.accepts.includes(material.id)) {
    throw new AppError('unprocessable', `El comprador "${buyer.name}" no acepta "${material.name}".`);
  }

  const result = runMatch({
    generator,
    buyer,
    material,
    state: request.state,
    alternatives: data.alternatives,
    assumptions: data.assumptions,
    overrides: request.overrides,
  });
  return { request, result };
}
