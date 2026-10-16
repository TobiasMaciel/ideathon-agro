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

const hits = new Map<string, number[]>();
const MAX_KEYS = 5000;

/** Registra un intento de `key` y devuelve false si superó alguno de los límites (no cuenta los rechazados). */
export function allow(bucket: string, key: string, limits: Limit[], now = Date.now()): boolean {
  const k = `${bucket}:${key}`;
  const longest = Math.max(...limits.map((l) => l.windowMs));
  const recent = (hits.get(k) ?? []).filter((t) => now - t < longest);
  for (const { max, windowMs } of limits) {
    if (recent.filter((t) => now - t < windowMs).length >= max) {
      hits.set(k, recent);
      return false;
    }
  }
  recent.push(now);
  hits.delete(k);
  hits.set(k, recent);
  if (hits.size > MAX_KEYS) hits.delete(hits.keys().next().value as string);
  return true;
}

/** El límite se apaga solo con ENVIRONMENT=development y RATE_LIMIT_DISABLED=1 (wrangler dev para e2e). */
export function rateLimitDisabled(env: { ENVIRONMENT?: string; RATE_LIMIT_DISABLED?: string }): boolean {
  return env.ENVIRONMENT === 'development' && env.RATE_LIMIT_DISABLED === '1';
}

export function resetRateLimits(): void {
  hits.clear();
}

const DEV_SALT = 'mapa-circular-nea-dev-salt';

/** IP del cliente: `CF-Connecting-IP` o el primer valor de `x-forwarded-for`. */
export function clientIp(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip')?.trim() ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'desconocida'
  );
}

/** SHA-256 hex de `salt:ip`. Es lo único que se guarda de la IP. */
export async function hashIp(ip: string, salt?: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt || DEV_SALT}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
