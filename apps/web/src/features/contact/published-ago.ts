// Antigüedad de una publicación, para mostrar junto al badge "Sin verificar".

/** "Publicado hace 5 min" a partir del `createdAt` ISO; null si la fecha no se puede leer. */
export function publishedAgo(createdAt: string, now: Date = new Date()): string | null {
  const t = Date.parse(createdAt);
  if (Number.isNaN(t)) return null;
  const minutes = Math.floor((now.getTime() - t) / 60_000);
  if (minutes < 1) return 'Publicado recién';
  if (minutes < 60) return `Publicado hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Publicado hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Publicado hace ${days} ${days === 1 ? 'día' : 'días'}`;
}
