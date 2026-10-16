import type { AssumptionKey, BuyerSector, MaterialId } from '@mapa/core/contracts';
import type { Overrides } from '@mapa/core/match';
import type { MaterialState } from '@mapa/core/viability';

export interface AppState {
  selectedGeneratorId: string;
  /** null = usar el mejor del ranking. */
  selectedBuyerId: string | null;
  state: MaterialState;
  overrides: Overrides;
  materials: MaterialId[];
  sectors: BuyerSector[];
}

export type Action =
  | { type: 'selectGenerator'; id: string; availableStates: MaterialState[] }
  | { type: 'selectBuyer'; id: string }
  | { type: 'setState'; state: MaterialState }
  | { type: 'setOverride'; key: AssumptionKey; value: number }
  | { type: 'resetOverrides' }
  | { type: 'toggleMaterial'; id: MaterialId }
  | { type: 'toggleSector'; id: BuyerSector }
  | { type: 'clearFilters' };

export function initialState(generatorId: string): AppState {
  return {
    selectedGeneratorId: generatorId,
    selectedBuyerId: null,
    state: 'suelto',
    overrides: {},
    materials: [],
    sectors: [],
  };
}

export function toggleInList<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case 'selectGenerator':
      return {
        ...s,
        selectedGeneratorId: a.id,
        selectedBuyerId: null,
        state: a.availableStates.includes(s.state) ? s.state : 'suelto',
      };
    case 'selectBuyer':
      return { ...s, selectedBuyerId: a.id };
    case 'setState':
      return { ...s, state: a.state };
    case 'setOverride':
      return { ...s, overrides: { ...s.overrides, [a.key]: a.value } };
    case 'resetOverrides':
      return { ...s, overrides: {} };
    case 'toggleMaterial':
      return { ...s, materials: toggleInList(s.materials, a.id) };
    case 'toggleSector':
      return { ...s, sectors: toggleInList(s.sectors, a.id) };
    case 'clearFilters':
      return { ...s, materials: [], sectors: [] };
  }
}

