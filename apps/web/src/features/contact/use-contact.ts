import { useState } from 'react';
import { getListingContact, type ContactInfo } from '@/api';

/** Respuestas ya pedidas en esta sesión (también los 404): no se vuelve a gastar el límite por IP. */
export type Settled = { kind: 'ready'; contact: ContactInfo } | { kind: 'none' };
const cache = new Map<string, Settled>();

export type ContactStatus = { kind: 'idle' } | { kind: 'loading' } | { kind: 'error'; message: string } | Settled;

/** Contacto de un establecimiento, pedido recién cuando se llama a `load` (al tocar "Ver contacto"). */
export function useContact(id: string): { status: ContactStatus; load: () => Promise<void> } {
  const [status, setStatus] = useState<ContactStatus>(() => cache.get(id) ?? { kind: 'idle' });
  const [forId, setForId] = useState(id);
  if (forId !== id) {
    // Cambió el establecimiento mostrado: arranca de nuevo (o del cache).
    setForId(id);
    setStatus(cache.get(id) ?? { kind: 'idle' });
  }

  const load = async () => {
    if (status.kind === 'loading') return;
    setStatus({ kind: 'loading' });
    const r = await getListingContact(id);
    if (r.ok || r.kind === 'notfound') {
      const settled: Settled = r.ok ? { kind: 'ready', contact: r.contact } : { kind: 'none' };
      cache.set(id, settled);
      setStatus(settled);
    } else {
      setStatus({ kind: 'error', message: r.message });
    }
  };

  return { status, load };
}
