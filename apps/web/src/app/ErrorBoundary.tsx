import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  failed: boolean;
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error de render:', error, info.componentStack);
  }

  reset = () => this.setState({ failed: false });

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-canvas p-8 text-center">
        <p role="alert" className="text-heading text-fg">
          No se pudo mostrar la página
        </p>
        <p className="max-w-sm text-small text-fg-muted">Reintentá. Si sigue pasando, recargá la página.</p>
        <button
          type="button"
          onClick={this.reset}
          className="h-9 rounded-sm bg-fg px-4 text-body font-medium text-white transition-[scale,background-color] duration-150 ease-out hover:bg-fg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-selection motion-safe:active:scale-[0.96]"
        >
          Reintentar
        </button>
      </div>
    );
  }
}
