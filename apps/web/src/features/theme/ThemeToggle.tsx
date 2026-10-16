import { Moon, Sun } from 'lucide-react';
import { setTheme, useTheme } from './theme';

/** Alterna modo claro / oscuro (se recuerda; sin elección, claro). */
export default function ThemeToggle() {
  const theme = useTheme();
  const light = theme === 'light';
  return (
    <button
      type="button"
      data-testid="theme-toggle"
      aria-label={light ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      aria-pressed={light}
      onClick={() => setTheme(light ? 'dark' : 'light')}
      className="inline-flex size-7 items-center justify-center rounded-md text-fg-muted transition-colors duration-120 ease-out hover:bg-surface-subtle hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-selection"
    >
      {light ? <Moon size={15} aria-hidden="true" /> : <Sun size={15} aria-hidden="true" />}
    </button>
  );
}
