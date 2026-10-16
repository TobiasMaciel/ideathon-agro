import type { AssumptionKey } from '../catalog';

// Validación de supuestos editables, compartida entre la UI (cliente) y POST /api/viability (servidor).

export type EditableKey = Exclude<AssumptionKey, 'usdArs'>;

export interface OverrideRule {
  min: number;
  max: number;
  /** Nombre legible para mensajes de error. */
  label: string;
}

/** Rangos válidos en las unidades del modelo (umbral verde como fracción 0–1). */
export const OVERRIDE_RULES: Record<EditableKey, OverrideRule> = {
  costPerKm: { min: 100, max: 100_000, label: 'Costo del camión por km (ARS/km)' },
  truckMaxTons: { min: 1, max: 60, label: 'Carga útil máxima (t)' },
  truckVolumeM3: { min: 5, max: 200, label: 'Volumen útil de la caja (m³)' },
  routeFactor: { min: 1, max: 3, label: 'Factor de ruta (×)' },
  greenThreshold: { min: 0, max: 0.9, label: 'Umbral verde (fracción)' },
};

export function isEditableKey(key: string): key is EditableKey {
  return Object.prototype.hasOwnProperty.call(OVERRIDE_RULES, key);
}

/** Devuelve n si es finito y está dentro del rango de la clave; si no, null. */
export function validateOverride(key: string, n: number): number | null {
  if (!isEditableKey(key) || typeof n !== 'number' || !Number.isFinite(n)) return null;
  const { min, max } = OVERRIDE_RULES[key];
  return n >= min && n <= max ? n : null;
}

const THOUSANDS_ES_AR = /^\d{1,3}(\.\d{3})+(,\d+)?$/;
const PLAIN_NUMBER = /^\d*[.,]?\d+$/;

/**
 * Convierte el texto de un input a valor del modelo. null = inválido (se ignora).
 * Acepta coma decimal y formato de miles es-AR ('1.234,5'). El umbral verde se escribe en % y se guarda como fracción.
 */
export function parseAssumptionInput(key: string, raw: string): number | null {
  if (!isEditableKey(key)) return null;
  const text = raw.trim();
  let normalized: string;
  if (THOUSANDS_ES_AR.test(text)) normalized = text.replace(/\./g, '').replace(',', '.');
  else if (PLAIN_NUMBER.test(text)) normalized = text.replace(',', '.');
  else return null;
  const n = Number(normalized);
  if (!Number.isFinite(n)) return null;
  return validateOverride(key, key === 'greenThreshold' ? n / 100 : n);
}
