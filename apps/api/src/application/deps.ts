import type { PlatformContact } from '@mapa/core/contact';
import type { DataOrigin } from '@mapa/core/contracts';
import type { CatalogRepository, ContactDirectory, ListingRepository, RateLimiter } from '@mapa/core/ports';

/** Todo lo que necesitan los casos de uso. Lo arma composition.ts por request; en tests, test/fakes.ts. */
export interface Deps {
  /** Origen configurado: 'database' si hay DATABASE_URL, si no 'local'. */
  origin: DataOrigin;
  catalog: CatalogRepository;
  listings: ListingRepository;
  contacts: ContactDirectory;
  rateLimiter: RateLimiter;
  /** Hash salado de la IP (la IP en claro nunca se guarda). */
  hashIp(ip: string): Promise<string>;
  /** Contacto de la plataforma para curados sin contacto propio. */
  platformContact: PlatformContact;
}
