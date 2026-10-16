/** IP del cliente: `CF-Connecting-IP` o el primer valor de `x-forwarded-for`. */
export function clientIp(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip')?.trim() ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'desconocida'
  );
}
