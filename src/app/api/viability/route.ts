import type { ViabilityRequest, ViabilityResponse } from '@/lib/api/types';
import { availableStates, evaluateMatch, type Overrides } from '@/lib/match';
import { isEditableKey, OVERRIDE_RULES, validateOverride } from '@/lib/overrides';
import type { MaterialState } from '@/lib/viability/types';
import { apiError, json, readJsonBody } from '@/server/http';
import { getDataSet } from '@/server/repository';

export const dynamic = 'force-dynamic';

const STATES: MaterialState[] = ['suelto', 'compactado', 'pellet'];
type Parsed = { ok: true; value: ViabilityRequest } | { ok: false; message: string };

function parseRequest(body: unknown): Parsed {
  const fail = (message: string): Parsed => ({ ok: false, message });
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return fail('El cuerpo debe ser un objeto JSON.');
  const b = body as Record<string, unknown>;
  if (typeof b.generatorId !== 'string' || b.generatorId === '') return fail('Falta "generatorId" (texto).');
  if (typeof b.buyerId !== 'string' || b.buyerId === '') return fail('Falta "buyerId" (texto).');
  if (typeof b.state !== 'string' || !STATES.includes(b.state as MaterialState)) {
    return fail('"state" debe ser suelto, compactado o pellet.');
  }
  const value: ViabilityRequest = { generatorId: b.generatorId, buyerId: b.buyerId, state: b.state as MaterialState };
  if (b.overrides !== undefined) {
    const o = b.overrides;
    if (typeof o !== 'object' || o === null || Array.isArray(o)) return fail('"overrides" debe ser un objeto.');
    const clean: Overrides = {};
    for (const [key, v] of Object.entries(o)) {
      if (!isEditableKey(key)) return fail(`Supuesto desconocido o no editable en "overrides": "${key}".`);
      const valid = typeof v === 'number' ? validateOverride(key, v) : null;
      if (valid === null) {
        const { min, max, label } = OVERRIDE_RULES[key];
        return fail(`"overrides.${key}" (${label}) debe ser un número entre ${min} y ${max}.`);
      }
      clean[key] = valid;
    }
    value.overrides = clean;
  }
  return { ok: true, value };
}

export async function POST(req: Request): Promise<Response> {
  const read = await readJsonBody(req);
  if (!read.ok) return read.response;
  const parsed = parseRequest(read.value);
  if (!parsed.ok) return apiError(parsed.message, 400);
  const request = parsed.value;

  const { origin, data } = await getDataSet();
  const generator = data.generators.find((g) => g.id === request.generatorId);
  if (!generator) return apiError(`No existe el generador "${request.generatorId}".`, 404);
  const buyer = data.buyers.find((x) => x.id === request.buyerId);
  if (!buyer) return apiError(`No existe el comprador "${request.buyerId}".`, 404);
  const material = data.materials.find((m) => m.id === generator.materialId);
  if (!material) return apiError(`No existe el material "${generator.materialId}".`, 404);

  if (!availableStates(material).includes(request.state)) {
    return apiError(`El material "${material.name}" no está disponible en estado "${request.state}".`, 422);
  }
  if (!buyer.accepts.includes(material.id)) {
    return apiError(`El comprador "${buyer.name}" no acepta "${material.name}".`, 422);
  }

  const result = evaluateMatch({
    generator,
    buyer,
    material,
    state: request.state,
    alternatives: data.alternatives,
    assumptions: data.assumptions,
    overrides: request.overrides,
  });
  const body: ViabilityResponse = { origin, request, result };
  return json(body);
}
