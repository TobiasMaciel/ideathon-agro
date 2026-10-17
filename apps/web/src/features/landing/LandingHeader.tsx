import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/features/theme';
import { cn } from '@/lib/utils';
import Logo from '@/shared/Logo';
import { HREF } from '@/shared/route';
import { scrollToSection, useActiveSection } from './scroll';

export interface SectionLink {
  id: string;
  label: string;
}

export function Brand({ size = 28 }: { size?: number }) {
  return (
    <a href={HREF.inicio} aria-label="Circular NEA, inicio" className="inline-flex items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-selection">
      <Logo size={size} className="shrink-0 rounded-[3px]" />
      <span className="font-display text-[1.125rem] leading-none font-extrabold tracking-[-0.01em] whitespace-nowrap text-fg font-stretch-semi-expanded">
        Circular <span className="text-selection">NEA</span>
      </span>
    </a>
  );
}

/**
 * Barra de la portada: ancha y transparente arriba; al bajar se vuelve una píldora de vidrio, más angosta y flotante.
 * Marca la sección que se está leyendo. En pantallas chicas, los links van en un desplegable.
 */
export default function LandingHeader({ links }: { links: SectionLink[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(links.map((l) => l.id));
  const floating = scrolled || open;

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]">
      <div
        className={cn(
          'pointer-events-auto grid grid-cols-[auto_1fr_auto] items-center gap-5 border transition-[max-width,height,margin,padding,background-color,border-color,box-shadow,border-radius] duration-300 ease-out',
          floating
            ? 'mx-3 mt-2.5 h-14 rounded-xl border-line bg-surface/75 pr-2 pl-4 shadow-overlay backdrop-blur-xl backdrop-saturate-150 md:mx-auto md:max-w-5xl'
            : 'mx-auto h-16 max-w-6xl rounded-none border-transparent px-4 sm:px-6',
        )}
      >
        <Brand />
        <nav aria-label="Secciones" className="hidden justify-center gap-0.5 md:flex">
          {links.map((l) => {
            const on = l.id === active;
            return (
              <button
                key={l.id}
                type="button"
                aria-current={on ? 'true' : undefined}
                onClick={() => go(l.id)}
                className={cn(
                  'relative h-9 rounded-md px-3 text-small font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-selection',
                  on ? 'text-fg' : 'text-fg-muted hover:text-fg',
                  on && floating && 'bg-fg/8',
                  'after:absolute after:inset-x-3 after:bottom-0.5 after:h-0.5 after:bg-selection after:transition-opacity after:duration-200',
                  on && !floating ? 'after:opacity-100' : 'after:opacity-0',
                )}
              >
                {l.label}
              </button>
            );
          })}
        </nav>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <a
            href={HREF.mapa}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-selection-solid px-3.5 text-small font-bold whitespace-nowrap text-on-accent transition-[transform,filter] duration-150 hover:-translate-y-px hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-selection"
          >
            Abrir el mapa
            <ArrowRight size={15} aria-hidden="true" className="hidden sm:block" />
          </a>
          <button
            type="button"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex size-9 items-center justify-center rounded-md text-fg transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-selection md:hidden"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav
          aria-label="Secciones (móvil)"
          className="pointer-events-auto mx-3 mt-2 grid animate-in rounded-xl border border-line bg-surface px-4 py-1.5 shadow-overlay duration-200 fade-in-0 slide-in-from-top-1 md:hidden"
        >
          {links.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => go(l.id)}
              className={cn('border-b border-line py-3 text-left font-display text-[1.05rem] font-semibold last:border-0', l.id === active ? 'text-selection' : 'text-fg')}
            >
              {l.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
