// Constantes de presentación del formulario "Publicar" (ids, orden de foco, clases).
import type { LatLng } from '@mapa/core/contracts';
import type { ListingField } from './form';

/** Orden de foco ante errores: el mismo orden visual del formulario. */
export const FIELD_ORDER: ListingField[] = [
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

export const fieldId = (f: ListingField) => (f === 'contact' ? 'listing-phone' : `listing-${f}`);

export const INPUT = 'h-10 rounded-md bg-surface px-3 text-body text-fg focus-visible:ring-2 aria-invalid:border-bad aria-invalid:ring-0';
export const TOGGLE =
  'h-10 flex-1 rounded-md border border-line bg-surface px-3 text-body font-medium text-fg-muted transition-colors duration-120 ease-out hover:border-line-strong hover:bg-surface-subtle hover:text-fg focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-selection data-[state=on]:border-selection data-[state=on]:bg-selection-subtle data-[state=on]:text-fg';

/** "28,1234° S · 58,1234° O" */
export function coordText({ lat, lng }: LatLng): string {
  const f = (n: number) => Math.abs(n).toFixed(4).replace('.', ',');
  return `${f(lat)}° ${lat < 0 ? 'S' : 'N'} · ${f(lng)}° ${lng < 0 ? 'O' : 'E'}`;
}
