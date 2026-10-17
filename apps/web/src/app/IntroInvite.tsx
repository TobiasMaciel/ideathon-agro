import { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { readString, writeString } from '@/shared/storage';
import { HREF, INTRO_SEEN_KEY } from '@/shared/route';
import Logo from '@/shared/Logo';
import { MAP_FREE } from './layout';

/**
 * Invitación discreta a la portada para quien llega directo al mapa por primera vez. No es modal: el mapa sigue
 * usable. Desaparece al cerrarla, al visitar la portada o mientras hay otro aviso abajo.
 */
export default function IntroInvite({ hidden }: { hidden: boolean }) {
  const [seen, setSeen] = useState(() => readString(INTRO_SEEN_KEY) === '1');
  if (seen || hidden) return null;
  const dismiss = () => {
    writeString(INTRO_SEEN_KEY, '1');
    setSeen(true);
  };
  return (
    <div className="pointer-events-none absolute z-[1030] flex justify-center px-3" style={{ ...MAP_FREE, bottom: 24 }}>
      <aside
        aria-label="Primera visita"
        className="pointer-events-auto flex max-w-full animate-in items-center gap-3 rounded-lg border border-line bg-surface/95 py-2 pr-2 pl-2.5 shadow-overlay backdrop-blur-md duration-500 fill-mode-both fade-in-0 slide-in-from-bottom-3"
        style={{ animationDelay: '1200ms' }}
      >
        <Logo size={30} className="shrink-0 rounded-[3px]" />
        <p className="text-small text-fg-muted">
          <span className="font-semibold text-fg">¿Primera vez?</span> En un minuto ves qué calcula y cómo leer el mapa.
        </p>
        <a
          href={HREF.inicio}
          onClick={() => writeString(INTRO_SEEN_KEY, '1')}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-selection-solid px-3 text-small font-bold text-on-accent transition-[transform,filter] duration-150 hover:-translate-y-px hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-selection"
        >
          Cómo funciona
          <ArrowRight size={14} aria-hidden="true" />
        </a>
        <button
          type="button"
          aria-label="Cerrar invitación"
          onClick={dismiss}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-fg-subtle transition-colors hover:bg-surface-subtle hover:text-fg focus-visible:outline-2 focus-visible:outline-selection"
        >
          <X size={15} aria-hidden="true" />
        </button>
      </aside>
    </div>
  );
}
