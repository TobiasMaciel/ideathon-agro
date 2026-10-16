const DEV_SALT = 'mapa-circular-nea-dev-salt';

/** SHA-256 hex de `salt:ip`. Es lo único que se guarda de la IP. Sin sal, usa una fija de desarrollo. */
export async function hashIp(ip: string, salt?: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt || DEV_SALT}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
