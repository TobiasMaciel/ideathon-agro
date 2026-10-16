import type { AlternativeId, BuyerSector, Material, MaterialId } from '@mapa/core/contracts';
import { LISTING_ALTERNATIVES, LISTING_MATERIALS, LISTING_SECTORS } from '@mapa/core/listings';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { ALTERNATIVE_LABELS, SECTOR_SINGULAR } from '@/shared/labels';
import { Field, Section } from './FormParts';
import { INPUT, TOGGLE } from './form-ui';
import type { PublishForm } from './use-publish-form';

/** "Qué vendés" (material, t/mes, humedad, estacionalidad) o "Qué comprás" (material, sector, combustible y consumo). */
export default function MaterialFields({ form, materials }: { form: PublishForm; materials: Material[] }) {
  const { draft, update, errorOf } = form;
  const kind = draft.kind;
  const listingMaterials = materials.filter((m) => LISTING_MATERIALS.includes(m.id));
  const tonsInput = (aria: object) => (
    <Input {...aria} name="tons" inputMode="decimal" autoComplete="off" value={draft.tons} onChange={(e) => update('tons', e.target.value)} className={cn(INPUT, 'tabular-nums')} />
  );

  return (
    <Section title={kind === 'oferta' ? 'Qué vendés' : 'Qué comprás'}>
      <div className="grid grid-cols-2 gap-3">
        <Field field="materialId" label={kind === 'oferta' ? 'Material' : 'Material que querés comprar'} error={errorOf('materialId')}>
          {(aria) => (
            <Select value={draft.materialId} onValueChange={(v) => update('materialId', v as MaterialId)}>
              <SelectTrigger {...aria} data-testid="listing-material" className={cn(INPUT, 'w-full data-[size=default]:h-10')}>
                <SelectValue placeholder="Elegí un material" />
              </SelectTrigger>
              <SelectContent position="popper" className="border border-line bg-surface">
                {listingMaterials.map((m) => (
                  <SelectItem key={m.id} value={m.id} data-testid={`listing-material-${m.id}`}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Field>
        {kind === 'demanda' && (
          <Field field="sector" label="Sector" error={errorOf('sector')}>
            {(aria) => (
              <Select value={draft.sector} onValueChange={(v) => update('sector', v as BuyerSector)}>
                <SelectTrigger {...aria} data-testid="listing-sector" className={cn(INPUT, 'w-full data-[size=default]:h-10')}>
                  <SelectValue placeholder="Elegí un sector" />
                </SelectTrigger>
                <SelectContent position="popper" className="border border-line bg-surface">
                  {LISTING_SECTORS.map((s) => (
                    <SelectItem key={s} value={s} data-testid={`listing-sector-${s}`}>
                      {SECTOR_SINGULAR[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>
        )}
        {kind === 'oferta' && (
          <Field field="tons" label="Toneladas por mes" hint="Lo que generás en un mes típico." error={errorOf('tons')}>
            {tonsInput}
          </Field>
        )}
      </div>

      {kind === 'oferta' ? (
        <div className="grid grid-cols-2 gap-3">
          <Field field="moisture" label="Humedad aproximada (%)" optional error={errorOf('moisture')}>
            {(aria) => (
              <Input {...aria} name="moisture" inputMode="decimal" autoComplete="off" placeholder="Ej.: 40" value={draft.moisture} onChange={(e) => update('moisture', e.target.value)} className={cn(INPUT, 'tabular-nums')} />
            )}
          </Field>
          <Field field="seasonality" label="Estacionalidad" optional error={errorOf('seasonality')}>
            {(aria) => (
              <Input {...aria} name="seasonality" autoComplete="off" placeholder="Ej.: todo el año" value={draft.seasonality} onChange={(e) => update('seasonality', e.target.value)} className={INPUT} />
            )}
          </Field>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p id="listing-currentAlternative-label" className="mb-1.5 text-small font-medium text-fg-muted">
              Combustible que usás hoy
            </p>
            <ToggleGroup
              id="listing-currentAlternative"
              type="single"
              value={draft.currentAlternative}
              onValueChange={(v) => v && update('currentAlternative', v as AlternativeId)}
              aria-labelledby="listing-currentAlternative-label"
              aria-describedby={errorOf('currentAlternative') ? 'listing-currentAlternative-error' : undefined}
              spacing={2}
              className="flex w-full gap-2"
            >
              {LISTING_ALTERNATIVES.map((a) => (
                <ToggleGroupItem key={a} value={a} data-testid={`listing-alt-${a}`} className={cn(TOGGLE, errorOf('currentAlternative') && 'border-bad')}>
                  {ALTERNATIVE_LABELS[a]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            {errorOf('currentAlternative') && (
              <p id="listing-currentAlternative-error" className="mt-1 text-caption text-bad">
                {errorOf('currentAlternative')}
              </p>
            )}
          </div>
          <Field
            field="tons"
            label={draft.currentAlternative ? `Consumo de ${ALTERNATIVE_LABELS[draft.currentAlternative]} (t/mes)` : 'Consumo de ese combustible (t/mes)'}
            hint="Toneladas que quemás hoy por mes. Con eso calculamos cuánta biomasa lo reemplaza."
            error={errorOf('tons')}
          >
            {tonsInput}
          </Field>
        </div>
      )}
    </Section>
  );
}
