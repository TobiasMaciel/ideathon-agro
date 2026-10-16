import { useEffect, useRef } from 'react';
import type { CatalogResponse } from '@mapa/core/contracts';
import { getCatalog } from '@/api';
import { createPoller, diffCatalog, type CatalogDiff } from './poll';

/**
 * Consulta el catálogo cada `intervalMs` (pausado con la pestaña oculta) y avisa solo si trajo plantas o compradores
 * nuevos respecto del catálogo que ya tiene la app (que incluye lo que publiqué yo).
 */
export function useCatalogPoll(catalog: CatalogResponse, intervalMs: number, onNew: (next: CatalogResponse, diff: CatalogDiff) => void) {
  const latest = useRef({ catalog, onNew });
  useEffect(() => {
    latest.current = { catalog, onNew };
  });

  useEffect(() => {
    const poller = createPoller({
      fetchCatalog: async () => {
        const r = await getCatalog();
        if (!r.ok) throw new Error(r.message);
        return r.catalog;
      },
      onChange: (next) => {
        const diff = diffCatalog(latest.current.catalog, next);
        if (diff.generators.length > 0 || diff.buyers.length > 0) latest.current.onNew(next, diff);
      },
      intervalMs,
      isHidden: () => document.hidden,
    });
    poller.start();
    return () => poller.stop();
  }, [intervalMs]);
}
