import { ThemeToggle } from '@/features/theme';
import Logo from '@/shared/Logo';
import { HREF } from '@/shared/route';

/** Marca chica flotante (el título completo es el h1 sr-only; la marca lleva a la portada) con el selector de tema. */
export default function BrandPill() {
  return (
    <div className="flex h-10 shrink-0 items-center gap-2.5 rounded-md border border-line bg-surface/90 pr-1.5 pl-1.5 shadow-overlay backdrop-blur-md backdrop-saturate-150">
      <a
        href={HREF.inicio}
        aria-label="Sobra: qué es y cómo funciona"
        className="flex items-center gap-2.5 rounded-sm transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-selection"
      >
        <Logo size={26} className="shrink-0 rounded-[3px]" />
        <span aria-hidden="true" className="font-display text-[1.0625rem] leading-none font-extrabold tracking-[-0.02em] text-fg font-stretch-semi-expanded">
          Sobra<span className="text-selection">.</span>
        </span>
      </a>
      <span aria-hidden="true" className="ml-0.5 h-5 w-px bg-line" />
      <ThemeToggle />
    </div>
  );
}
