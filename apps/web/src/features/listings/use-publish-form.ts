import { useMemo, useRef, useState } from 'react';
import type { LatLng, ListingCreatedResponse } from '@mapa/core/contracts';
import { postListing } from '@/api';
import { emptyDraft, inNea, mapServerDetails, validateDraft, type FieldErrors, type ListingDraft, type ListingField } from './form';
import { FIELD_ORDER, fieldId } from './form-ui';

type Geo = { kind: 'idle' } | { kind: 'loading' } | { kind: 'error'; message: string };

interface Args {
  location: LatLng | null;
  onLocationChange: (ll: LatLng | null) => void;
  onCreated: (created: ListingCreatedResponse) => void;
}

/** Borrador, validación (la misma de core), errores del servidor por campo, geolocalización y envío. */
export function usePublishForm({ location, onLocationChange, onCreated }: Args) {
  const [draft, setDraft] = useState<ListingDraft>(() => emptyDraft());
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<{ message: string; items: string[] } | null>(null);
  const [sending, setSending] = useState(false);
  const [geo, setGeo] = useState<Geo>({ kind: 'idle' });
  const contentRef = useRef<HTMLDivElement>(null);
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

  const locateMe = () => {
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

  return { draft, update, errorOf, submit, sending, formError, contentRef, canGeolocate, locating: geo.kind === 'loading', locateMe };
}

export type PublishForm = ReturnType<typeof usePublishForm>;
