import { useId } from 'react';
import { Loader2 } from 'lucide-react';
import type { LatLng, ListingCreatedResponse, ListingKind, Material } from '@mapa/core/contracts';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { Field, Section } from './FormParts';
import LocationField from './LocationField';
import MaterialFields from './MaterialFields';
import { INPUT, TOGGLE } from './form-ui';
import { usePublishForm } from './use-publish-form';

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
  const form = usePublishForm({ location, onLocationChange, onCreated });
  const { draft, update, errorOf, submit, sending, formError, contentRef } = form;
  const formErrorId = useId();
  const kind = draft.kind;

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
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden border border-line bg-surface p-0 text-fg shadow-overlay ring-0 sm:max-w-xl"
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
              <div className="grid grid-cols-2 gap-3">
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
              <LocationField
                location={location}
                locality={draft.locality}
                error={errorOf('location')}
                onRequestPick={onRequestPick}
                canGeolocate={form.canGeolocate}
                locating={form.locating}
                onLocate={form.locateMe}
              />
            </Section>

            <MaterialFields form={form} materials={materials} />

            <Section title="Contacto" description="Dejá al menos un teléfono o un email. Solo se muestra a quien toca “Ver contacto”.">
              <Field field="contactName" label="Nombre de contacto" optional error={errorOf('contactName')}>
                {(aria) => (
                  <Input {...aria} name="name" autoComplete="name" value={draft.contactName} onChange={(e) => update('contactName', e.target.value)} className={INPUT} />
                )}
              </Field>
              <div className="grid grid-cols-2 gap-3">
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

          <div className="shrink-0 border-t border-line px-5 py-3">
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
            <div className="flex justify-end gap-2">
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
