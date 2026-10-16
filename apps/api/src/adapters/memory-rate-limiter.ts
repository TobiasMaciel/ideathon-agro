import type { RateLimitBucket, RateLimiter } from '@mapa/core/ports';

// Rate limit best-effort en memoria del isolate (en producción: regla de rate limiting de Cloudflare).
export interface Limit {
  max: number;
  windowMs: number;
}

const HOUR = 3_600_000;
export const CREATE_LIMITS: Limit[] = [
  { max: 5, windowMs: HOUR },
  { max: 20, windowMs: 24 * HOUR },
];
export const CONTACT_LIMITS: Limit[] = [{ max: 30, windowMs: HOUR }];

export const DEFAULT_LIMITS: Record<RateLimitBucket, Limit[]> = { create: CREATE_LIMITS, contact: CONTACT_LIMITS };

const MAX_KEYS = 5000;

/** Limitador en memoria: cada instancia tiene su propio registro (la composición usa una por isolate). */
export function createMemoryRateLimiter(
  limits: Record<RateLimitBucket, Limit[]> = DEFAULT_LIMITS,
  now: () => number = Date.now,
) {
  const hits = new Map<string, number[]>();
  return {
    async allow(bucket: RateLimitBucket, key: string) {
      const t = now();
      const k = `${bucket}:${key}`;
      const bucketLimits = limits[bucket];
      const longest = Math.max(...bucketLimits.map((l) => l.windowMs));
      const recent = (hits.get(k) ?? []).filter((x) => t - x < longest);
      for (const { max, windowMs } of bucketLimits) {
        if (recent.filter((x) => t - x < windowMs).length >= max) {
          hits.set(k, recent);
          return false;
        }
      }
      recent.push(t);
      hits.delete(k);
      hits.set(k, recent);
      if (hits.size > MAX_KEYS) hits.delete(hits.keys().next().value as string);
      return true;
    },
  } satisfies RateLimiter;
}

/** Sin límite: solo para e2e locales (ENVIRONMENT=development + RATE_LIMIT_DISABLED=1). */
export const unlimitedRateLimiter = { allow: async () => true } satisfies RateLimiter;
