import ErrorBoundary from './ErrorBoundary';
import MapCircularApp from './components/app/MapCircularApp';

export default function App() {
  return (
    <ErrorBoundary>
      <main className="flex flex-1 flex-col">
        <MapCircularApp />
      </main>
    </ErrorBoundary>
  );
}
