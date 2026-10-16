// Polling del catálogo para avisar de publicaciones nuevas (lógica pura, timers inyectables).
import type { CatalogResponse } from '@mapa/core/api';

export interface CatalogDiff {
  generators: string[];
  buyers: string[];
}

/** Ids de generators/buyers que están en `next` y no en `prev`. Sin `prev` no hay nada "nuevo". */
export function diffCatalog(prev: CatalogResponse | undefined, next: CatalogResponse): CatalogDiff {
  if (!prev) return { generators: [], buyers: [] };
  const g = new Set(prev.generators.map((x) => x.id));
  const b = new Set(prev.buyers.map((x) => x.id));
  return {
    generators: next.generators.filter((x) => !g.has(x.id)).map((x) => x.id),
    buyers: next.buyers.filter((x) => !b.has(x.id)).map((x) => x.id),
  };
}

export interface Poller {
  start(): void;
  stop(): void;
  /** Una consulta ahora (no hace nada si hay una en vuelo, está pausado o detenido). */
  tick(): Promise<void>;
}

const MAX_BACKOFF_MS = 120_000;

export function createPoller(opts: {
  fetchCatalog: () => Promise<CatalogResponse>;
  onChange: (catalog: CatalogResponse) => void;
  intervalMs?: number;
  /** Si devuelve true (p. ej. `document.hidden`) se omite la consulta y se reprograma. */
  isHidden?: () => boolean;
  setTimeoutFn?: typeof setTimeout;
  clearTimeoutFn?: typeof clearTimeout;
}): Poller {
  const { fetchCatalog, onChange, isHidden } = opts;
  const intervalMs = opts.intervalMs ?? 20_000;
  const setT = opts.setTimeoutFn ?? setTimeout;
  const clearT = opts.clearTimeoutFn ?? clearTimeout;

  let running = false;
  let inFlight = false;
  let delay = intervalMs;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const schedule = (ms: number) => {
    if (!running) return;
    timer = setT(() => void tick(), ms);
  };

  async function tick(): Promise<void> {
    if (!running || inFlight) return;
    if (isHidden?.()) {
      schedule(delay);
      return;
    }
    inFlight = true;
    try {
      const catalog = await fetchCatalog();
      delay = intervalMs;
      if (running) onChange(catalog);
    } catch {
      delay = Math.min(delay * 2, MAX_BACKOFF_MS); // backoff simple ante error
    } finally {
      inFlight = false;
      schedule(delay);
    }
  }

  return {
    start() {
      if (running) return;
      running = true;
      delay = intervalMs;
      schedule(0);
    },
    stop() {
      running = false;
      if (timer !== undefined) clearT(timer);
      timer = undefined;
    },
    tick,
  };
}
