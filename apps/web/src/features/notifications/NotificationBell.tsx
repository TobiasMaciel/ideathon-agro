import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import Light from '@/shared/Light';
import type { Notification } from './inbox';

interface Props {
  notifications: Notification[];
  unread: number;
  /** Elegir una notificación: mostrar ese negocio en el mapa y el panel. */
  onSelect: (n: Notification) => void;
  onMarkAllRead: () => void;
}

const EMPTY = 'Publicá una oferta o demanda para recibir avisos de negocios compatibles.';

/** Campanita de la barra superior: matches de mis publicaciones, con las no leídas destacadas. */
export default function NotificationBell({ notifications, unread, onSelect, onMarkAllRead }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid="notifications-bell"
          aria-label={unread > 0 ? `Notificaciones: ${unread} sin leer` : 'Notificaciones'}
          className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-line bg-surface/90 text-fg-muted shadow-overlay backdrop-blur-md transition-colors duration-120 ease-out hover:bg-surface-subtle hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-selection data-[state=open]:text-fg"
        >
          <Bell size={16} aria-hidden="true" />
          {unread > 0 && (
            <span
              data-testid="notifications-count"
              aria-hidden="true"
              className="absolute -top-1.5 -right-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-selection-solid px-1 font-mono text-caption leading-none font-semibold text-on-accent tabular-nums ring-2 ring-canvas"
            >
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        data-testid="notifications-panel"
        className="w-96 gap-0 border border-line bg-surface p-0 text-fg shadow-overlay ring-0"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-3.5 py-2.5">
          <p className="text-small font-semibold text-fg">Notificaciones</p>
          {notifications.length > 0 && (
            <button
              type="button"
              data-testid="notifications-mark-all"
              onClick={onMarkAllRead}
              disabled={unread === 0}
              className="rounded-xs text-caption font-medium text-selection underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-selection disabled:text-fg-subtle disabled:no-underline"
            >
              Marcar todo como leído
            </button>
          )}
        </div>
        {notifications.length === 0 ? (
          <p className="px-3.5 py-4 text-small text-pretty text-fg-muted">{EMPTY}</p>
        ) : (
          <ul className="max-h-96 divide-y divide-divider overflow-y-auto overscroll-contain">
            {notifications.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  data-testid={`notification-${n.id}`}
                  data-new={n.isNew || undefined}
                  onClick={() => {
                    onSelect(n);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left transition-colors duration-120 ease-out hover:bg-surface-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-selection',
                    n.isNew && 'bg-selection-subtle shadow-[inset_2px_0_0_var(--color-selection)]',
                  )}
                >
                  <Light light={n.match.light} size="xs" className="mt-[3px]" />
                  <span className={cn('min-w-0 flex-1 text-small text-pretty', n.isNew ? 'font-medium text-fg' : 'text-fg-muted')}>
                    {n.text}
                    {n.isNew && <span className="sr-only"> (sin leer)</span>}
                  </span>
                  {n.isNew && <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-selection" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
