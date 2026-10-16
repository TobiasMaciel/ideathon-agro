import { curatedContacts } from '@mapa/core/data';
import type { ContactDirectory } from '@mapa/core/ports';

/** Contactos corporativos curados de @mapa/core/data (sin base, o como respaldo si la base falla). */
export function createLocalContactDirectory() {
  return { get: async (entityId: string) => curatedContacts.find((c) => c.entityId === entityId) } satisfies ContactDirectory;
}
