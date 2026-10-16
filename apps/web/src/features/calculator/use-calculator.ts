import { useCallback, useMemo, useReducer } from 'react';
import type { CatalogResponse, Generator, Material } from '@mapa/core/contracts';
import { availableStates, type RankedBuyer } from '@mapa/core/match';
import { defaultGeneratorId, derive, type Derived } from './derive';
import { initialState, reducer } from './state';

export type CalculatorView =
  | { kind: 'empty' }
  | { kind: 'error' }
  | { kind: 'ready'; generator: Generator; material: Material; d: Derived; selected: RankedBuyer | undefined };

/** Estado de la calculadora (planta, estado, supuestos, filtros) y lo que se deriva para mostrar. */
export function useCalculator(catalog: CatalogResponse) {
  const [app, dispatch] = useReducer(reducer, catalog, (c) => initialState(defaultGeneratorId(c)));

  const view = useMemo((): CalculatorView => {
    const generator = catalog.generators.find((g) => g.id === app.selectedGeneratorId);
    const material = catalog.materials.find((m) => m.id === generator?.materialId);
    if (!generator || !material) return { kind: 'empty' };
    try {
      const d = derive(catalog, generator, material, app);
      const selected = d.ranking.find((r) => r.buyer.id === app.selectedBuyerId) ?? d.ranking[0];
      return { kind: 'ready', generator, material, d, selected };
    } catch (e) {
      console.error(e);
      return { kind: 'error' };
    }
  }, [catalog, app]);

  /** Elige la planta; `from` permite usar un catálogo más nuevo que el del render (recién publicada). */
  const selectGenerator = useCallback(
    (id: string, from: CatalogResponse = catalog) => {
      const g = from.generators.find((x) => x.id === id);
      const m = from.materials.find((x) => x.id === g?.materialId);
      dispatch({ type: 'selectGenerator', id, availableStates: m ? availableStates(m) : ['suelto'] });
    },
    [catalog],
  );

  return { app, dispatch, view, selectGenerator };
}

export type Calculator = ReturnType<typeof useCalculator>;
