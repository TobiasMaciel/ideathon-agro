import { sources } from './sources';

export * from './types';
export { sources } from './sources';
export { materials, alternatives } from './materials';
export { assumptions } from './assumptions';
export type { Assumption, AssumptionKey } from './assumptions';
export { generators } from './generators';
export { buyers } from './buyers';
export { curatedContacts } from './contacts';

/** Busca una fuente por id; undefined si no existe. */
export function getSource(id: string) {
  return sources.find((s) => s.id === id);
}
