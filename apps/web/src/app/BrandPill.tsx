import { ThemeToggle } from '@/features/theme';
import Logo from '@/shared/Logo';

/** Marca chica flotante (el título completo es el h1 sr-only) con el selector de tema. */
export default function BrandPill() {
  return (
    <div className="flex h-10 shrink-0 items-center gap-2.5 rounded-md border border-line bg-surface/90 pr-1.5 pl-1.5 shadow-overlay backdrop-blur-md backdrop-saturate-150">
      <Logo size={26} className="shrink-0 rounded-[3px]" />
      <span aria-hidden="true" className="font-display text-[0.9375rem] leading-none font-extrabold tracking-[-0.01em] text-fg font-stretch-semi-expanded">
        Circular <span className="text-selection">NEA</span>
      </span>
      <span aria-hidden="true" className="ml-0.5 h-5 w-px bg-line" />
      <ThemeToggle />
    </div>
  );
}
