import { RIGHT_OF_PANEL } from './layout';

/** Aviso breve y discreto sobre el mapa (live region siempre montada para que el lector lo anuncie). */
export default function Notice({ text }: { text: string | null }) {
  return (
    <div className="pointer-events-none absolute left-0 z-[1050] flex justify-center px-3" style={{ right: RIGHT_OF_PANEL, bottom: 24 }}>
      <p
        role="status"
        data-testid="notice"
        className={text ? 'rounded-lg border border-selection bg-surface px-3.5 py-2 text-small font-medium text-fg shadow-overlay' : 'sr-only'}
      >
        {text}
      </p>
    </div>
  );
}
