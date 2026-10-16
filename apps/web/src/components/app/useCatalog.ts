import { useCallback, useEffect, useState } from 'react';
import type { CatalogResponse, ListingCreatedResponse } from '@mapa/core/api';
import { insertListing } from '../listing/after-create';

export type CatalogState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; catalog: CatalogResponse };

export function useCatalog(): { state: CatalogState; retry: () => void; addListing: (created: ListingCreatedResponse) => void } {
  const [state, setState] = useState<CatalogState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/catalog`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`El servidor respondió ${res.status}`);
        return (await res.json()) as CatalogResponse;
      })
      .then((catalog) => setState({ status: 'ready', catalog }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: 'error', message: err instanceof Error ? err.message : 'Error desconocido' });
      });
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  /** Suma al catálogo la publicación recién creada (sin volver a pedir todo). */
  const addListing = useCallback((created: ListingCreatedResponse) => {
    setState((s) => (s.status === 'ready' ? { status: 'ready', catalog: insertListing(s.catalog, created) } : s));
  }, []);

  return { state, retry, addListing };
}
