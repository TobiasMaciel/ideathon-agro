import { useCallback, useEffect, useState } from 'react';
import type { CatalogResponse, ListingCreatedResponse } from '@mapa/core/contracts';
import { getCatalog } from '@/api';
import { insertListing } from './insert-listing';

export type CatalogState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; catalog: CatalogResponse };

export function useCatalog() {
  const [state, setState] = useState<CatalogState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getCatalog(controller.signal)
      .then((r) => setState(r.ok ? { status: 'ready', catalog: r.catalog } : { status: 'error', message: r.message }))
      .catch(() => {
        /* abortado: el componente ya no está */
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

  /** Reemplaza el catálogo por uno más nuevo (la consulta periódica trajo publicaciones de otros). */
  const replace = useCallback((catalog: CatalogResponse) => {
    setState((s) => (s.status === 'ready' ? { status: 'ready', catalog } : s));
  }, []);

  return { state, retry, addListing, replace };
}
