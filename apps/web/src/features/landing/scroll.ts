// Navegación dentro de la portada: ir a una sección y saber cuál se está leyendo.
import { useEffect, useState } from 'react';

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
}

/** Id de la sección que ocupa la franja central de la pantalla (para marcar el link activo del header). */
export function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join('|');
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const id of key.split('|')) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [key]);
  return active;
}
