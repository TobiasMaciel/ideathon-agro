import AppShell from './app/AppShell';
import ErrorBoundary from './app/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <main className="flex flex-1 flex-col">
        <AppShell />
      </main>
    </ErrorBoundary>
  );
}
