import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const reduced = () => typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

/** true la primera vez que el elemento entra en pantalla (sin IntersectionObserver o con movimiento reducido, ya visible). */
function useSeen<T extends Element>(margin = '0px 0px -12% 0px') {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(() => typeof IntersectionObserver === 'undefined' || reduced());
  useEffect(() => {
    const el = ref.current;
    if (seen || !el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen, margin]);
  return [ref, seen] as const;
}

/** Aparece (sube y se funde) al entrar en pantalla. `delay` en ms para escalonar hermanos. */
export function Reveal({ children, delay = 0, className, as: Tag = 'div' }: { children: React.ReactNode; delay?: number; className?: string; as?: 'div' | 'li' | 'section' }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  return (
    <Tag
      ref={ref as React.Ref<never>}
      style={{ transitionDelay: seen ? `${delay}ms` : undefined }}
      className={cn('transition-[opacity,translate] duration-700 ease-out', seen ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0', className)}
    >
      {children}
    </Tag>
  );
}

/** Cifra que cuenta desde 0 cuando entra en pantalla. */
export function CountUp({ value, format, duration = 1100 }: { value: number; format: (n: number) => string; duration?: number }) {
  const [ref, seen] = useSeen<HTMLSpanElement>();
  const [shown, setShown] = useState(() => (reduced() ? value : 0));
  useEffect(() => {
    if (!seen || reduced()) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, value, duration]);
  return (
    <span ref={ref}>
      <span aria-hidden="true">{format(shown)}</span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}
