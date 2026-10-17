import { useEffect, useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { useCatalog } from '@/features/catalog';
import { formatNumber } from '@/shared/format';
import { HREF, INTRO_SEEN_KEY } from '@/shared/route';
import { writeString } from '@/shared/storage';
import LandingHeader, { Brand, type SectionLink } from './LandingHeader';
import LiveExample from './LiveExample';
import { catalogFigures, pickExamples } from './examples';
import { CountUp, Reveal } from './motion';
import { scrollToSection } from './scroll';

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

const SECTIONS: SectionLink[] = [
  { id: 'ejemplo', label: 'Ejemplo en vivo' },
  { id: 'como-funciona', label: 'Cómo funciona' },
  { id: 'para-quien', label: 'Para quién' },
];

/** Entrada escalonada del hero (tw-animate-css); con movimiento reducido no corre. */
const enter = (ms: number) => ({ className: 'animate-in fade-in-0 slide-in-from-bottom-3 fill-mode-both duration-700', style: { animationDelay: `${ms}ms` } });

/** Portada: qué es, un ejemplo calculado en vivo con el catálogo real, cómo funciona y la puerta al mapa. */
export default function Landing() {
  const { state } = useCatalog();
  const catalog = state.status === 'ready' ? state.catalog : null;
  const examples = useMemo(() => (catalog ? pickExamples(catalog, FIRST) : []), [catalog]);
  const figures = useMemo(() => (catalog ? catalogFigures(catalog) : null), [catalog]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.title = 'Sobra — Lo que sobra, al mercado';
    writeString(INTRO_SEEN_KEY, '1');
  }, []);

  return (
    <div className="min-h-dvh bg-canvas text-fg">
      <LandingHeader links={SECTIONS} />

      <main>
        {/* Portada */}
        <section id="ejemplo" className="relative isolate overflow-hidden">
          <div aria-hidden="true" className="grid-paper absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]" />
          <div
            aria-hidden="true"
            className="animate-drift absolute -top-40 right-[-10%] -z-10 size-[38rem] rounded-full bg-selection-solid/15 blur-3xl"
          />
          <div aria-hidden="true" className="animate-drift-slow absolute top-[45%] -left-40 -z-10 size-[26rem] rounded-full bg-selection-solid/8 blur-3xl" />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-28 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:pt-36 lg:pb-24">
            <div className="grid gap-6">
              <p {...enter(0)}>
                <span className="kicker">Cascarilla de arroz · Biomasa forestal · NEA</span>
              </p>
              <h1 style={enter(90).style} className={`${enter(90).className} font-display text-[clamp(2.5rem,5.6vw,4.4rem)] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance`}>
                Lo que sobra en tu planta,{' '}
                <em className="mark-sweep px-[0.12em] not-italic [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
                  ¿cierra después del camión?
                </em>
              </h1>
              <p style={enter(220).style} className={`${enter(220).className} max-w-[56ch] text-[1.0625rem] leading-relaxed text-pretty text-fg-muted`}>
                Sobra cruza los residuos de aserraderos y molinos arroceros con las industrias que necesitan calor, y calcula si la venta deja
                margen una vez pagado el flete. Con números que tienen fuente.
              </p>
              <div style={enter(320).style} className={`${enter(320).className} flex flex-wrap gap-3`}>
                <a href={HREF.mapa} className={`${BTN} bg-selection-solid text-on-accent shadow-overlay hover:brightness-110`}>
                  Abrir el mapa
                  <ArrowRight size={18} aria-hidden="true" />
                </a>
                <button type="button" onClick={() => scrollToSection('como-funciona')} className={`${BTN} border border-line-strong/60 bg-surface text-fg hover:border-selection`}>
                  Cómo funciona
                </button>
              </div>
            </div>
            <div style={enter(420).style} className={`${enter(420).className} lg:pl-4`}>
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
              { dt: 'Plantas', value: figures?.plants, sub: 'aserraderos y molinos' },
              { dt: 'Toneladas por mes', value: figures?.tonsPerMonth, sub: 'de residuo disponible' },
              { dt: 'Compradores', value: figures?.buyers, sub: 'industrias que usan calor' },
              { dt: 'Plantas con negocio', value: figures?.plantsThatClose, of: figures?.plants, sub: 'en su mejor forma de venta', ok: true },
            ].map((f, n) => (
              <Reveal key={f.dt} delay={n * 80} className="grid content-start gap-1 rounded-md border border-line bg-surface px-5 py-5 transition-colors hover:border-line-strong/60">
                <dt className="eyebrow">{f.dt}</dt>
                <dd className={`m-0 font-display text-[1.75rem] leading-tight font-bold tracking-[-0.03em] tabular-nums font-stretch-semi-expanded sm:text-[2.25rem] ${f.ok ? 'text-ok' : ''}`}>
                  {f.value === undefined ? '…' : (
                    <>
                      <CountUp value={f.value} format={formatNumber} />
                      {f.of !== undefined && ` de ${formatNumber(f.of)}`}
                    </>
                  )}
                </dd>
                <p className="text-caption text-fg-muted">{f.sub}</p>
              </Reveal>
            ))}
          </dl>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-20 pb-8 sm:px-6">
          <Reveal className="mb-8 grid max-w-2xl gap-3">
            <p className="kicker">Cómo funciona</p>
            <h2 className="font-display text-[clamp(1.75rem,3vw,2.4rem)] leading-tight font-bold tracking-[-0.025em] text-balance">
              El problema no es qué hacer con el residuo. Es saber si el negocio cierra.
            </h2>
          </Reveal>
          <ol className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, n) => (
              <Reveal as="li" key={s.tag} delay={n * 110} className="group/step relative grid content-start gap-2 border-t-2 border-line pt-4">
                <span aria-hidden="true" className="absolute -top-0.5 left-0 h-0.5 w-0 bg-selection transition-[width] duration-500 ease-out group-hover/step:w-full" />
                <span className="font-mono text-caption tracking-[0.08em] text-selection uppercase">
                  {String(n + 1).padStart(2, '0')} · {s.tag}
                </span>
                <h3 className="font-display text-heading font-semibold">{s.title}</h3>
                <p className="text-body text-pretty text-fg-muted">{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* Dos puertas */}
        <section id="para-quien" aria-label="Para quién es" className="mx-auto grid max-w-6xl scroll-mt-24 gap-4 px-4 py-14 sm:px-6 md:grid-cols-2">
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
          ].map((d, n) => (
            <Reveal key={d.kicker} delay={n * 120} className="grid">
            <a
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
            </Reveal>
          ))}
        </section>

        {/* Llamado final */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <Reveal className="relative isolate flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-lg bg-selection-solid px-7 py-9 text-on-accent sm:px-10">
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
          </Reveal>
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
