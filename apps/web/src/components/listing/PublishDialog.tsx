import { useId, useMemo, useRef, useState } from 'react';
import { Crosshair, Loader2, LocateFixed, MapPin } from 'lucide-react';
import type { ListingCreatedResponse } from '@mapa/core/api';
import type { AlternativeId, BuyerSector, Material, MaterialId } from '@mapa/core/data';
import { LISTING_ALTERNATIVES, LISTING_MATERIALS, LISTING_SECTORS, type ListingKind } from '@mapa/core/listings';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { SECTOR_SINGULAR } from '../panel/labels';
import { postListing } from './api';
import { emptyDraft, inNea, mapServerDetails, validateDraft, type FieldErrors, type LatLng, type ListingDraft, type ListingField } from './form';

const ALT_LABEL: Record<AlternativeId, string> = { glp: 'GLP', lena: 'Leña' };
/** Orden de foco ante errores: el mismo orden visual del formulario. */
const FIELD_ORDER: ListingField[] = [
  'name',
  'locality',
  'location',
  'materialId',
  'sector',
  'currentAlternative',
  'tons',
  'moisture',
  'seasonality',
  'contactName',
  'phone',
  'email',
  'contact',
];
const fieldId = (f: ListingField) => (f === 'contact' ? 'listing-phone' : `listing-${f}`);

const INPUT = 'h-10 rounded-md bg-surface px-3 text-base text-fg focus-visible:ring-2 aria-invalid:border-bad aria-invalid:ring-0 sm:text-body';
const TOGGLE =
  'h-10 flex-1 rounded-md border border-line bg-surface px-3 text-body font-medium text-fg-muted transition-colors duration-120 ease-out hover:border-line-strong hover:bg-surface-subtle hover:text-fg focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-selection data-[state=on]:border-selection data-[state=on]:bg-selection-subtle data-[state=on]:text-fg';

function coordText({ lat, lng }: LatLng): string {
  const f = (n: number) => Math.abs(n).toFixed(4).replace('.', ',');
  return `${f(lat)}° ${lat < 0 ? 'S' : 'N'} · ${f(lng)}° ${lng < 0 ? 'O' : 'E'}`;
}

interface FieldProps {
  field: ListingField;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: (aria: { id: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }) => React.ReactNode;
}

/** Label visible arriba, control, y abajo la ayuda o el error (los dos vinculados con aria-describedby). */
function Field({ field, label, optional, hint, error, className, children }: FieldProps) {
  const id = fieldId(field);
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-1.5 block text-small leading-snug font-medium text-fg-muted">
        {label} {optional && <span className="font-normal text-fg-subtle">(opcional)</span>}
      </Label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {error && (
        <p id={errorId} className="mt-1 text-caption text-bad">
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className="mt-1 text-caption text-fg-subtle">
          {hint}
        </p>
      )}
    </div>
  );
}

function Section({ title, children, description }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3 border-t border-line pt-4 first:border-t-0 first:pt-0">
      <legend className="eyebrow float-left mb-0.5 w-full">{title}</legend>
      {description && <p className="clear-both text-small text-fg-muted">{description}</p>}
      <div className="clear-both space-y-3">{children}</div>
    </fieldset>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materials: Material[];
  location: LatLng | null;
  onLocationChange: (ll: LatLng | null) => void;
  /** Cierra el diálogo y deja marcar la ubicación en el mapa. */
  onRequestPick: () => void;
  /** Vuelve de marcar en el mapa: el foco va a la ubicación. */
  returningFromPick: boolean;
  onCreated: (created: ListingCreatedResponse) => void;
}

/** Formulario "Publicar" (Vendo / Compro). El borrador vive acá aunque el diálogo se oculte para marcar en el mapa. */
export default function PublishDialog({ open, onOpenChange, materials, location, onLocationChange, onRequestPick, returningFromPick, onCreated }: Props) {
  const [draft, setDraft] = useState<ListingDraft>(() => emptyDraft());
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<{ message: string; items: string[] } | null>(null);
  const [sending, setSending] = useState(false);
  const [geo, setGeo] = useState<{ kind: 'idle' } | { kind: 'loading' } | { kind: 'error'; message: string }>({ kind: 'idle' });
  const contentRef = useRef<HTMLDivElement>(null);
  const formErrorId = useId();
  const canGeolocate = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const validation = useMemo(() => validateDraft({ ...draft, location }), [draft, location]);
  const clientErrors: FieldErrors = submitted && !validation.ok ? validation.fieldErrors : {};
  const geoError = geo.kind === 'error' ? geo.message : undefined;
  const errorOf = (f: ListingField) => serverErrors[f] ?? (f === 'location' ? (clientErrors.location ?? geoError) : clientErrors[f]);

  const update = <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    // Al corregir un campo se borra el error que había dado el servidor para ese campo.
    setServerErrors((e) => {
      const next = { ...e };
      delete next[key as ListingField];
      if (key === 'phone' || key === 'email') delete next.contact;
      return next;
    });
    setFormError(null);
  };

  const focusField = (f: ListingField) => {
    const el = contentRef.current?.querySelector<HTMLElement>(`#${fieldId(f)}`);
    const target = el?.matches('[role="group"]') ? el.querySelector<HTMLElement>('button') : el;
    target?.focus();
  };

  const useMyLocation = () => {
    if (!canGeolocate || geo.kind === 'loading') return;
    setGeo({ kind: 'loading' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const ll = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (!inNea(ll)) {
          setGeo({ kind: 'error', message: 'Tu ubicación queda fuera del NEA. Marcá el establecimiento en el mapa.' });
          return;
        }
        setGeo({ kind: 'idle' });
        onLocationChange(ll);
      },
      () => setGeo({ kind: 'error', message: 'No pudimos obtener tu ubicación. Marcá el establecimiento en el mapa.' }),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSubmitted(true);
    setFormError(null);
    if (!validation.ok) {
      const first = FIELD_ORDER.find((f) => validation.fieldErrors[f]);
      if (first) focusField(first);
      return;
    }
    setSending(true);
    const r = await postListing(validation.value);
    setSending(false);
    if (r.ok) {
      setDraft(emptyDraft(draft.kind));
      setSubmitted(false);
      setServerErrors({});
      setGeo({ kind: 'idle' });
      onCreated(r.created);
      return;
    }
    if (r.kind === 'validation') {
      const mapped = mapServerDetails(r.details);
      setServerErrors(mapped.fieldErrors);
      if (mapped.unmapped.length > 0 || Object.keys(mapped.fieldErrors).length === 0) {
        setFormError({ message: r.message, items: mapped.unmapped });
      }
      const first = FIELD_ORDER.find((f) => mapped.fieldErrors[f]);
      if (first) focusField(first);
      return;
    }
    setFormError({ message: r.message, items: [] });
  };

  const kind = draft.kind;
  const listingMaterials = materials.filter((m) => LISTING_MATERIALS.includes(m.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={contentRef}
        data-testid="publish-dialog"
        overlayClassName="bg-black/60"
        onOpenAutoFocus={(e) => {
          if (!returningFromPick) return;
          e.preventDefault();
          contentRef.current?.querySelector<HTMLElement>('#listing-location')?.focus();
        }}
        className={cn(
          'flex flex-col gap-0 overflow-hidden border border-line bg-surface p-0 text-fg shadow-overlay ring-0 sm:max-h-[calc(100dvh-2rem)] sm:max-w-xl',
          'max-sm:top-0 max-sm:left-0 max-sm:h-dvh max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none max-sm:border-0',
        )}
      >
        <DialogHeader className="shrink-0 gap-1 border-b border-line px-5 pt-5 pb-4 pr-12">
          <DialogTitle className="text-title text-fg">Publicar en el mapa</DialogTitle>
          <DialogDescription className="text-small text-pretty text-fg-muted">
            Tu publicación aparece en el mapa como “sin verificar”. Tu contacto solo lo ve quien toca “Ver contacto”.
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col" aria-describedby={formError ? formErrorId : undefined}>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-4">
            <Section title="Qué publicás">
              <ToggleGroup
                type="single"
                value={kind}
                onValueChange={(v) => v && update('kind', v as ListingKind)}
                aria-label="Tipo de publicación"
                spacing={2}
                className="flex w-full gap-2"
              >
                <ToggleGroupItem value="oferta" data-testid="kind-oferta" className={TOGGLE}>
                  Vendo
                </ToggleGroupItem>
                <ToggleGroupItem value="demanda" data-testid="kind-demanda" className={TOGGLE}>
                  Compro
                </ToggleGroupItem>
              </ToggleGroup>
              <p className="text-caption text-fg-subtle">
                {kind === 'oferta' ? 'Tenés un residuo de biomasa y buscás a quién vendérselo.' : 'Querés reemplazar GLP o leña por biomasa.'}
              </p>
            </Section>

            <Section title="Establecimiento">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field field="name" label="Nombre del establecimiento" error={errorOf('name')}>
                  {(aria) => (
                    <Input {...aria} name="organization" autoComplete="organization" value={draft.name} onChange={(e) => update('name', e.target.value)} className={INPUT} />
                  )}
                </Field>
                <Field field="locality" label="Localidad" optional error={errorOf('locality')}>
                  {(aria) => (
                    <Input {...aria} name="locality" autoComplete="address-level2" value={draft.locality} onChange={(e) => update('locality', e.target.value)} className={INPUT} />
                  )}
                </Field>
              </div>

              <div>
                <p id="listing-location-label" className="mb-1.5 text-small font-medium text-fg-muted">
                  Ubicación
                </p>
                <div
                  className={cn(
                    'flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border px-3 py-2.5',
                    errorOf('location') ? 'border-bad' : location ? 'border-line' : 'border-dashed border-line-strong',
                  )}
                >
                  <MapPin size={16} aria-hidden="true" className={cn('shrink-0', location ? 'text-selection' : 'text-fg-subtle')} />
                  <p className="min-w-0 flex-1 text-small" data-testid="listing-location-value">
                    {location ? (
                      <>
                        {draft.locality.trim() && <span className="mr-2 text-fg">{draft.locality.trim()}</span>}
                        <span className="font-mono text-fg-muted tabular-nums">{coordText(location)}</span>
                      </>
                    ) : (
                      <span className="text-fg-subtle">Sin marcar</span>
                    )}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    id="listing-location"
                    variant="outline"
                    data-testid="pick-on-map"
                    aria-describedby={['listing-location-label', errorOf('location') ? 'listing-location-error' : null].filter(Boolean).join(' ')}
                    onClick={onRequestPick}
                    className="h-9 px-3 text-body"
                  >
                    <Crosshair aria-hidden="true" />
                    {location ? 'Cambiar en el mapa' : 'Marcar en el mapa'}
                  </Button>
                  {canGeolocate && (
                    <Button type="button" variant="ghost" onClick={useMyLocation} aria-disabled={geo.kind === 'loading' || undefined} className="h-9 px-3 text-body text-fg-muted">
                      {geo.kind === 'loading' ? <Loader2 aria-hidden="true" className="animate-spin" /> : <LocateFixed aria-hidden="true" />}
                      {geo.kind === 'loading' ? 'Buscando tu ubicación…' : 'Usar mi ubicación'}
                    </Button>
                  )}
                </div>
                {errorOf('location') && (
                  <p id="listing-location-error" className="mt-1 text-caption text-bad">
                    {errorOf('location')}
                  </p>
                )}
              </div>
            </Section>

            <Section title={kind === 'oferta' ? 'Qué vendés' : 'Qué comprás'}>
              <div className="grid gap-3 sm:grid-cols-2">
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
                    {(aria) => (
                      <Input {...aria} name="tons" inputMode="decimal" autoComplete="off" value={draft.tons} onChange={(e) => update('tons', e.target.value)} className={cn(INPUT, 'tabular-nums')} />
                    )}
                  </Field>
                )}
              </div>

              {kind === 'oferta' ? (
                <div className="grid gap-3 sm:grid-cols-2">
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
                <div className="grid gap-3 sm:grid-cols-2">
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
                          {ALT_LABEL[a]}
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
                    label={draft.currentAlternative ? `Consumo de ${ALT_LABEL[draft.currentAlternative]} (t/mes)` : 'Consumo de ese combustible (t/mes)'}
                    hint="Toneladas que quemás hoy por mes. Con eso calculamos cuánta biomasa lo reemplaza."
                    error={errorOf('tons')}
                  >
                    {(aria) => (
                      <Input {...aria} name="tons" inputMode="decimal" autoComplete="off" value={draft.tons} onChange={(e) => update('tons', e.target.value)} className={cn(INPUT, 'tabular-nums')} />
                    )}
                  </Field>
                </div>
              )}
            </Section>

            <Section title="Contacto" description="Dejá al menos un teléfono o un email. Solo se muestra a quien toca “Ver contacto”.">
              <Field field="contactName" label="Nombre de contacto" optional error={errorOf('contactName')}>
                {(aria) => (
                  <Input {...aria} name="name" autoComplete="name" value={draft.contactName} onChange={(e) => update('contactName', e.target.value)} className={INPUT} />
                )}
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field field="phone" label="WhatsApp o teléfono" error={errorOf('phone') ?? errorOf('contact')}>
                  {(aria) => (
                    <Input {...aria} type="tel" name="tel" autoComplete="tel" placeholder="Ej.: 3794 412345" value={draft.phone} onChange={(e) => update('phone', e.target.value)} className={cn(INPUT, 'tabular-nums')} />
                  )}
                </Field>
                <Field field="email" label="Email" error={errorOf('email')}>
                  {(aria) => (
                    <Input {...aria} type="email" name="email" autoComplete="email" spellCheck={false} value={draft.email} onChange={(e) => update('email', e.target.value)} className={INPUT} />
                  )}
                </Field>
              </div>
            </Section>
          </div>

          <div className="shrink-0 border-t border-line px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {formError && (
              <div id={formErrorId} role="alert" data-testid="publish-error" className="mb-3 rounded-md border border-bad-line bg-bad-bg px-3 py-2 text-small text-bad">
                <p className="font-medium">{formError.message}</p>
                {formError.items.length > 0 && (
                  <ul className="mt-1 list-disc pl-4">
                    {formError.items.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-10 px-4 text-body text-fg-muted">
                Cancelar
              </Button>
              <Button type="submit" data-testid="publish-submit" aria-disabled={sending || undefined} className="h-10 px-4 text-body">
                {sending && <Loader2 aria-hidden="true" className="animate-spin" />}
                {sending ? 'Publicando…' : 'Publicar'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
