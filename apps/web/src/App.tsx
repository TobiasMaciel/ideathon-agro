import { Suspense, lazy, useEffect } from 'react';
import { useRoute } from '@/shared/route';
import AppShell from './app/AppShell';
import ErrorBoundary from './app/ErrorBoundary';
import { TITLE } from './app/layout';

// La portada se carga solo si se visita: el mapa (la demo) abre sin esperarla.
const Landing = lazy(() => import('@/features/landing'));

export default function App() {
  const route = useRoute();
  useEffect(() => {
    if (route === 'mapa') document.title = TITLE;
  }, [route]);

  return (
    <ErrorBoundary>
      <main className="flex flex-1 flex-col">
        {route === 'inicio' ? (
          <Suspense fallback={null}>
            <Landing />
          </Suspense>
        ) : (
          <AppShell />
        )}
      </main>
    </ErrorBoundary>
  );
}
