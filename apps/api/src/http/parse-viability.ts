import { isOneOf, MATERIAL_STATES } from '@mapa/core/catalog';
import type { ViabilityRequest } from '@mapa/core/contracts';
import type { Overrides } from '@mapa/core/match';
import { isEditableKey, OVERRIDE_RULES, validateOverride } from '@mapa/core/overrides';
import { AppError } from '../application/errors';

const fail = (message: string) => new AppError('invalid', message);

/** Valida el cuerpo de POST /api/viability. Lanza AppError `invalid` (400) con un mensaje en español. */
export function parseViabilityRequest(body: unknown): ViabilityRequest {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) throw fail('El cuerpo debe ser un objeto JSON.');
  const b = body as Record<string, unknown>;
  if (typeof b.generatorId !== 'string' || b.generatorId === '') throw fail('Falta "generatorId" (texto).');
  if (typeof b.buyerId !== 'string' || b.buyerId === '') throw fail('Falta "buyerId" (texto).');
  if (!isOneOf(MATERIAL_STATES, b.state)) throw fail('"state" debe ser suelto, compactado o pellet.');
  const value: ViabilityRequest = { generatorId: b.generatorId, buyerId: b.buyerId, state: b.state };
  if (b.overrides !== undefined) {
    const o = b.overrides;
    if (typeof o !== 'object' || o === null || Array.isArray(o)) throw fail('"overrides" debe ser un objeto.');
    const clean: Overrides = {};
    for (const [key, v] of Object.entries(o)) {
      if (!isEditableKey(key)) throw fail(`Supuesto desconocido o no editable en "overrides": "${key}".`);
      const valid = typeof v === 'number' ? validateOverride(key, v) : null;
      if (valid === null) {
        const { min, max, label } = OVERRIDE_RULES[key];
        throw fail(`"overrides.${key}" (${label}) debe ser un número entre ${min} y ${max}.`);
      }
      clean[key] = valid;
    }
    value.overrides = clean;
  }
  return value;
}
