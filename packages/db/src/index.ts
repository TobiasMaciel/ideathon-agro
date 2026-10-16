import type { AnyDb } from './client';
import { createPgCatalogRepository } from './repositories/pg-catalog-repository';
import { createPgContactDirectory } from './repositories/pg-contact-directory';
import { createPgListingRepository } from './repositories/pg-listing-repository';

export { createDb, type AnyDb, type DbConnection } from './client';
export { seedDatabase, type SeedData } from './seed';
export * as schema from './schema';
export { createPgCatalogRepository, createPgContactDirectory, createPgListingRepository };

/** Los tres repositorios Postgres sobre una misma conexión (que abre y cierra quien llama). */
export function createPgRepositories(db: AnyDb) {
  return {
    catalog: createPgCatalogRepository(db),
    listings: createPgListingRepository(db),
    contacts: createPgContactDirectory(db),
  };
}
