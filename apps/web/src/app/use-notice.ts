import { useEffect, useState } from 'react';

/** Texto del aviso flotante; se borra solo a los `ms` milisegundos. */
export function useNotice(ms = 5000): [string | null, (text: string | null) => void] {
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), ms);
    return () => window.clearTimeout(t);
  }, [notice, ms]);
  return [notice, setNotice];
}
