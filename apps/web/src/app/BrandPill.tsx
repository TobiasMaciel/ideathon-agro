import { ThemeToggle } from '@/features/theme';

/** Marca (copia de public/logo-mark.svg): trazos en currentColor (texto primario); el punto, salvia del tema activo. */
function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" width={20} height={20} aria-hidden="true" className="shrink-0 text-fg">
      <path d="M9.07 12 A8 8 0 0 1 22.93 12" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
      <path d="M22.93 20 A8 8 0 0 1 9.07 20" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" opacity={0.5} />
      <rect x={5.6} y={13.6} width={4.8} height={4.8} transform="rotate(45 8 16)" fill="currentColor" />
      <circle cx={24} cy={16} r={2.7} fill="var(--brand-dot)" />
    </svg>
  );
}

/** Marca chica flotante (el título completo es el h1 sr-only) con el selector de tema. */
export default function BrandPill() {
  return (
    <div className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-line bg-surface/90 pr-1 pl-2.5 shadow-overlay backdrop-blur-md">
      <LogoMark />
      <span aria-hidden="true" className="text-small font-semibold tracking-tight text-fg">
        Circular NEA
      </span>
      <span aria-hidden="true" className="ml-0.5 h-4 w-px bg-line" />
      <ThemeToggle />
    </div>
  );
}
