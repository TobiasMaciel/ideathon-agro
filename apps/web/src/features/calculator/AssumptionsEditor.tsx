import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { AssumptionKey } from '@mapa/core/contracts';
import { formatNumber } from '@/shared/format';
import { OVERRIDE_RULES, parseAssumptionInput, type EditableKey } from '@mapa/core/overrides';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Props {
  values: Record<AssumptionKey, number>;
  hasOverrides: boolean;
  onChange: (key: AssumptionKey, value: number) => void;
  onReset: () => void;
}

const FIELDS: { key: EditableKey; label: string; unit: string }[] = [
  { key: 'costPerKm', label: 'Costo por km', unit: 'ARS/km' },
  { key: 'routeFactor', label: 'Factor de ruta', unit: '×' },
  { key: 'greenThreshold', label: 'Margen mínimo para "Cierra"', unit: '%' },
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
  const hintId = `assumption-${k}-hint`;
  return (
    <div>
      <Label htmlFor={`assumption-${k}`} className="mb-1.5 block text-small leading-snug font-medium text-fg-muted">
        {label} <span className="font-normal text-fg-subtle">({unit})</span>
      </Label>
      <Input
        id={`assumption-${k}`}
        data-testid={`assumption-${k}`}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={draft ?? display(k, value)}
        aria-invalid={invalid}
        aria-describedby={hintId}
        onChange={(e) => {
          setDraft(e.target.value);
          const parsed = parseAssumptionInput(k, e.target.value);
          if (parsed !== null) onChange(k, parsed);
        }}
        onBlur={() => setDraft(null)}
        className="h-10 rounded-md bg-surface px-3 text-body text-fg tabular-nums focus-visible:ring-2 aria-invalid:border-bad aria-invalid:ring-0"
      />
      <p id={hintId} className={cn('mt-1 text-caption', invalid ? 'text-bad-fg' : 'text-fg-subtle')}>
        {invalid ? `Ingresá un valor entre ${rangeText(k)}. Mientras tanto se usa el anterior.` : `Entre ${rangeText(k)}`}
      </p>
    </div>
  );
}

export default function AssumptionsEditor({ values, hasOverrides, onChange, onReset }: Props) {
  const [resetCount, setResetCount] = useState(0);
  return (
    <div className="space-y-4">
      <p className="text-small text-fg-muted">Cambiá un valor y el resultado se recalcula al instante.</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-4">
        {FIELDS.map((f) => (
          <Field key={`${f.key}-${resetCount}`} k={f.key} label={f.label} unit={f.unit} value={values[f.key]} onChange={onChange} />
        ))}
      </div>
      <Button
        variant="outline"
        disabled={!hasOverrides}
        data-testid="assumptions-reset"
        onClick={() => {
          onReset();
          setResetCount((n) => n + 1);
        }}
        className="h-9 text-body"
      >
        <RotateCcw aria-hidden="true" />
        Restablecer supuestos
      </Button>
    </div>
  );
}
