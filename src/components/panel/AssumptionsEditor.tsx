'use client';

import { useState } from 'react';
import type { AssumptionKey } from '@/data/assumptions';
import { formatNumber } from '@/lib/format';
import { OVERRIDE_RULES, parseAssumptionInput, type EditableKey } from '@/lib/overrides';

interface Props {
  values: Record<AssumptionKey, number>;
  hasOverrides: boolean;
  onChange: (key: AssumptionKey, value: number) => void;
  onReset: () => void;
}

const FIELDS: { key: EditableKey; label: string; unit: string }[] = [
  { key: 'costPerKm', label: 'Costo por km', unit: 'ARS/km' },
  { key: 'routeFactor', label: 'Factor de ruta', unit: '×' },
  { key: 'greenThreshold', label: 'Umbral verde', unit: '%' },
  { key: 'truckVolumeM3', label: 'Volumen del camión', unit: 'm³' },
  { key: 'truckMaxTons', label: 'Carga máxima del camión', unit: 't' },
];

function display(key: AssumptionKey, v: number): string {
  return String(key === 'greenThreshold' ? Math.round(v * 1000) / 10 : v);
}

function rangeText(k: EditableKey): string {
  const { min, max } = OVERRIDE_RULES[k];
  const f = k === 'greenThreshold' ? 100 : 1;
  return `${formatNumber(min * f)} y ${formatNumber(max * f)}`;
}

function Field({ k, label, unit, value, onChange }: {
  k: EditableKey; label: string; unit: string; value: number; onChange: (key: AssumptionKey, v: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const invalid = draft !== null && parseAssumptionInput(k, draft) === null;
  return (
    <div>
      <label htmlFor={`assumption-${k}`} className="block text-xs font-medium text-stone-800">
        {label} ({unit})
      </label>
      <input
        id={`assumption-${k}`}
        data-testid={`assumption-${k}`}
        type="text"
        inputMode="decimal"
        value={draft ?? display(k, value)}
        aria-invalid={invalid}
        onChange={(e) => {
          setDraft(e.target.value);
          const parsed = parseAssumptionInput(k, e.target.value);
          if (parsed !== null) onChange(k, parsed);
        }}
        onBlur={() => setDraft(null)}
        className={`mt-0.5 w-full rounded-md border bg-white px-2 py-1.5 text-sm text-stone-900 focus-visible:outline-2 focus-visible:outline-green-800 ${
          invalid ? 'border-red-700' : 'border-stone-400'
        }`}
      />
      {invalid ? (
        <p className="text-[11px] text-red-800">Fuera de rango: entre {rangeText(k)} (se usa el valor anterior).</p>
      ) : (
        <p className="text-[11px] text-stone-700">Rango: {rangeText(k)}</p>
      )}
    </div>
  );
}

export default function AssumptionsEditor({ values, hasOverrides, onChange, onReset }: Props) {
  const [resetCount, setResetCount] = useState(0);
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {FIELDS.map((f) => (
          <Field key={`${f.key}-${resetCount}`} k={f.key} label={f.label} unit={f.unit} value={values[f.key]} onChange={onChange} />
        ))}
      </div>
      <button
        type="button"
        disabled={!hasOverrides}
        data-testid="assumptions-reset"
        onClick={() => {
          onReset();
          setResetCount((n) => n + 1);
        }}
        className="rounded-md border border-stone-500 px-3 py-1.5 text-sm font-medium text-stone-900 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800 disabled:cursor-not-allowed disabled:text-stone-500"
      >
        Restablecer
      </button>
    </div>
  );
}
