import { useCallback, useState } from 'react';

/**
 * Ancho en px de un elemento, al día con sus cambios de tamaño (ResizeObserver).
 * Devuelve un callback ref para pasarle al elemento y el ancho (`fallback` hasta que se monte).
 */
export function useElementWidth<T extends HTMLElement>(fallback: number): [(el: T | null) => void, number] {
  const [width, setWidth] = useState(fallback);
  const ref = useCallback((el: T | null) => {
    if (!el) return;
    setWidth(el.offsetWidth);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setWidth(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}
