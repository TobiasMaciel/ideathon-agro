import { useEffect, useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { useCatalog } from '@/features/catalog';
import { ThemeToggle } from '@/features/theme';
import { formatNumber } from '@/shared/format';
import Logo from '@/shared/Logo';
import { HREF } from '@/shared/route';
import LiveExample from './LiveExample';
import { catalogFigures, pickExamples } from './examples';

/** Planta con la que abre el ejemplo en vivo (la misma de la demo del mapa). */
const FIRST = 'molinos-ala-mercedes';

const STEPS = [
  { tag: 'Tu planta', title: 'Elegí qué generás', text: 'Aserrín, chips, costaneros o cascarilla de arroz, con las toneladas que salen por mes.' },
  { tag: 'Cómo lo vendés', title: 'Suelto, compactado o pellet', text: 'Cada forma cambia la densidad, el precio y hasta dónde llega un camión sin perder plata.' },
  { tag: 'El flete', title: 'Se calcula el margen', text: 'Precio menos flete, comprador por comprador. El semáforo dice si cierra, si está justo o si no.' },
  { tag: 'Contacto', title: 'Hablá con quien compra', text: 'Ves la industria, cuánto ahorra frente a su combustible actual y cómo contactarla.' },
];

const BTN =
  'inline-flex h-11 items-center gap-2 rounded-md px-5 text-body font-bold transition-[transform,filter,background-color,border-color] duration-150 ease-out hover:-translate-y-px active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-selection';

function Brand({ size = 28 }: { size?: number }) {
  return (
    <a href={HREF.inicio} aria-label="Circular NEA, inicio" className="inline-flex items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-selection">
      <Logo size={size} className="shrink-0 rounded-[3px]" />
      <span className="font-display text-[1.125rem] leading-none font-extrabold tracking-[-0.01em] text-fg font-stretch-semi-expanded">
        Circular <span className="text-selection">NEA</span>
      </span>
    </a>
  );
}

/** Portada: qué es, un ejemplo calculado en vivo con el catálogo real, cómo funciona y la puerta al mapa. */
export default function Landing() {
  const { state } = useCatalog();
  const catalog = state.status === 'ready' ? state.catalog : null;
  const examples = useMemo(() => (catalog ? pickExamples(catalog, FIRST) : []), [catalog]);
  const figures = useMemo(() => (catalog ? catalogFigures(catalog) : null), [catalog]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.title = 'Circular NEA — Del residuo al mercado';
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });

  return (
    <div className="min-h-dvh bg-canvas text-fg">
      <header className="sticky top-0 z-50 border-b border-line/70 bg-canvas/80 backdrop-blur-md backdrop-saturate-150">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Brand />
          <nav aria-label="Secciones" className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => scrollTo('como-funciona')}
              className="hidden h-9 rounded-md px-3 text-small font-medium text-fg-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-selection sm:inline-flex sm:items-center"
            >
              Cómo funciona
            </button>
            <ThemeToggle />
            <a href={HREF.mapa} className={`${BTN} h-9 bg-selection-solid px-4 text-small text-on-accent hover:brightness-110`}>
              Abrir el mapa
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* Portada */}
        <section className="relative isolate overflow-hidden">
          <div aria-hidden="true" className="grid-paper absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]" />
          <div
            aria-hidden="true"
            className="absolute -top-40 right-[-10%] -z-10 size-[38rem] rounded-full bg-selection-solid/15 blur-3xl"
          />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:pt-20 lg:pb-24">
            <div className="grid gap-6">
              <p className="kicker">Cascarilla de arroz · Biomasa forestal · NEA</p>
              <h1 className="font-display text-[clamp(2.5rem,5.6vw,4.4rem)] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance">
                Lo que sobra en tu planta,{' '}
                <em className="bg-selection-solid px-[0.12em] text-on-accent not-italic [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
                  ¿cierra después del camión?
                </em>
              </h1>
              <p className="max-w-[56ch] text-[1.0625rem] leading-relaxed text-pretty text-fg-muted">
                Circular NEA cruza los residuos de aserraderos y molinos arroceros con las industrias que necesitan calor, y calcula si la venta deja
                margen una vez pagado el flete. Con números que tienen fuente.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href={HREF.mapa} className={`${BTN} bg-selection-solid text-on-accent shadow-overlay hover:brightness-110`}>
                  Abrir el mapa
                  <ArrowRight size={18} aria-hidden="true" />
                </a>
                <button type="button" onClick={() => scrollTo('como-funciona')} className={`${BTN} border border-line-strong/60 bg-surface text-fg hover:border-selection`}>
                  Cómo funciona
                </button>
              </div>
            </div>
            <div className="lg:pl-4">
              {examples.length > 0 ? (
                <LiveExample examples={examples} />
              ) : (
                <div className="grid h-[30rem] place-items-center rounded-lg border border-line bg-surface text-small text-fg-subtle shadow-overlay">
                  {state.status === 'error' ? 'No se pudo cargar el catálogo.' : 'Calculando con el catálogo…'}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Cifras */}
        <section aria-label="El catálogo en números" className="mx-auto max-w-6xl px-4 sm:px-6">
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { dt: 'Plantas', dd: figures ? formatNumber(figures.plants) : '…', sub: 'aserraderos y molinos' },
              { dt: 'Toneladas por mes', dd: figures ? formatNumber(figures.tonsPerMonth) : '…', sub: 'de residuo disponible' },
              { dt: 'Compradores', dd: figures ? formatNumber(figures.buyers) : '…', sub: 'industrias que usan calor' },
              { dt: 'Plantas con negocio', dd: figures ? `${figures.plantsThatClose} de ${figures.plants}` : '…', sub: 'en su mejor forma de venta', ok: true },
            ].map((f) => (
              <div key={f.dt} className="grid content-start gap-1 rounded-md border border-line bg-surface px-5 py-5">
                <dt className="eyebrow">{f.dt}</dt>
                <dd className={`m-0 font-display text-[1.75rem] leading-tight sm:text-[2.25rem] font-bold tracking-[-0.03em] tabular-nums font-stretch-semi-expanded ${f.ok ? 'text-ok' : ''}`}>
                  {f.dd}
                </dd>
                <p className="text-caption text-fg-muted">{f.sub}</p>
              </div>
            ))}
          </dl>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-20 pb-8 sm:px-6">
          <header className="mb-8 grid max-w-2xl gap-3">
            <p className="kicker">Cómo funciona</p>
            <h2 className="font-display text-[clamp(1.75rem,3vw,2.4rem)] leading-tight font-bold tracking-[-0.025em] text-balance">
              El problema no es qué hacer con el residuo. Es saber si el negocio cierra.
            </h2>
          </header>
          <ol className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, n) => (
              <li key={s.tag} className="grid content-start gap-2 border-t-2 border-line pt-4 transition-colors hover:border-selection">
                <span className="font-mono text-caption tracking-[0.08em] text-selection uppercase">
                  {String(n + 1).padStart(2, '0')} · {s.tag}
                </span>
                <h3 className="font-display text-heading font-semibold">{s.title}</h3>
                <p className="text-body text-pretty text-fg-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Dos puertas */}
        <section aria-label="Para quién es" className="mx-auto grid max-w-6xl gap-4 px-4 py-14 sm:px-6 md:grid-cols-2">
          {[
            {
              kicker: 'Tengo residuo',
              title: 'Aserraderos y molinos arroceros',
              text: 'Encontrá quién compra tu aserrín, chips o cascarilla, y si te conviene venderlo suelto o invertir en compactar o pelletizar.',
            },
            {
              kicker: 'Necesito calor',
              title: 'Frigoríficos, secaderos, yerbateras, citrícolas',
              text: 'Mirá qué biomasa tenés cerca y cuánto ahorrarías por mes frente al GLP o la leña que usás hoy.',
            },
          ].map((d) => (
            <a
              key={d.kicker}
              href={HREF.mapa}
              className="group grid content-start gap-3 rounded-lg border border-line bg-surface p-7 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-selection focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-selection"
            >
              <p className="kicker">{d.kicker}</p>
              <h3 className="font-display text-title font-semibold">{d.title}</h3>
              <p className="max-w-[48ch] text-body text-pretty text-fg-muted">{d.text}</p>
              <span className="mt-1 inline-flex items-center gap-1.5 text-small font-semibold text-selection">
                Abrir el mapa
                <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </a>
          ))}
        </section>

        {/* Honestidad del modelo */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="grid gap-6 border-t border-line pt-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-12">
            <div className="grid content-start gap-3">
              <p className="kicker">Sin humo</p>
              <h2 className="font-display text-[1.75rem] leading-tight font-bold tracking-[-0.02em] text-balance">Si no cierra, te lo decimos.</h2>
            </div>
            <div className="grid content-start gap-3 text-body text-pretty text-fg-muted">
              <p>
                El pellet le gana al GLP, no a la leña barata. Cuando al comprador le sale más caro que lo que usa hoy, la app lo marca aunque al vendedor le
                cierre.
              </p>
              <p>
                Cada valor dice si es <span className="font-mono text-caption text-fg uppercase">real</span> o{' '}
                <span className="font-mono text-caption text-fg uppercase">estimado</span> y llega a su fuente en un clic. Y si tenés mejores números, cambiás
                los supuestos y el resultado se recalcula al instante.
              </p>
            </div>
          </div>
        </section>

        {/* Llamado final */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="relative isolate flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-lg bg-selection-solid px-7 py-9 text-on-accent sm:px-10">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] [background-size:1.5rem_1.5rem] [mask-image:linear-gradient(to_left,#000,transparent_70%)]"
            />
            <div className="grid gap-2">
              <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight font-extrabold tracking-[-0.025em]">Probalo con tu planta.</h2>
              <p className="max-w-[52ch] text-body text-on-accent/85">Elegí una planta del mapa o publicá la tuya en un minuto. El contacto lo ve solo quien lo pide.</p>
            </div>
            <a href={HREF.mapa} className={`${BTN} bg-surface text-fg shadow-overlay hover:brightness-105`}>
              Abrir el mapa
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-4 py-8 sm:px-6">
          <div className="grid gap-2">
            <Brand size={24} />
            <p className="text-small text-fg-muted">Que un residuo deje de ser un costo y se vuelva un ingreso.</p>
          </div>
          <p className="font-mono text-caption text-fg-subtle uppercase">Ideathon NEA Tech 2026 · Desafío 03 · Del subproducto al mercado</p>
        </div>
      </footer>
    </div>
  );
}

function reducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}
