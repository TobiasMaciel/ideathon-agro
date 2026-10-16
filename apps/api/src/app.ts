import { Hono } from 'hono';
import { defaultDeps } from './composition';
import { corsFromEnv } from './http/middlewares/cors';
import { provideDeps, type MakeDeps } from './http/middlewares/deps';
import { securityHeaders } from './http/middlewares/security-headers';
import { apiError, errorResponse } from './http/respond';
import { buyersRoutes } from './http/routes/buyers';
import { catalogRoutes } from './http/routes/catalog';
import { contactRoutes } from './http/routes/contact';
import { generatorsRoutes } from './http/routes/generators';
import { healthRoutes } from './http/routes/health';
import { listingsRoutes } from './http/routes/listings';
import { viabilityRoutes } from './http/routes/viability';
import type { AppEnv } from './http/types';

/** La API completa. `makeDeps` arma las dependencias de cada request (en tests, fakes). */
export function createApp(makeDeps: MakeDeps = defaultDeps) {
  const app = new Hono<AppEnv>();
  app.use('*', securityHeaders);
  app.use('/api/*', corsFromEnv);
  app.use('/api/*', provideDeps(makeDeps));

  for (const routes of [
    healthRoutes,
    catalogRoutes,
    generatorsRoutes,
    buyersRoutes,
    viabilityRoutes,
    listingsRoutes,
    contactRoutes,
  ]) {
    app.route('/api', routes);
  }

  app.notFound(() => apiError('Ruta no encontrada.', 404));
  app.onError((err) => errorResponse(err));
  return app;
}
