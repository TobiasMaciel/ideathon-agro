'use client';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-stone-50 p-8 text-center text-stone-800">
      <p role="alert" className="text-lg font-semibold">
        Algo salió mal al mostrar la página.
      </p>
      <p className="text-sm">Podés volver a intentarlo; si sigue pasando, recargá la página.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-green-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800"
      >
        Reintentar
      </button>
    </div>
  );
}
