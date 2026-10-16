import { Hono } from 'hono';
import { revealContact } from '../../application/reveal-contact';
import { clientIp } from '../client-ip';
import { json } from '../respond';
import type { AppEnv } from '../types';

/** GET /api/listings/:id/contact — contacto bajo demanda (no viaja en el catálogo), con límite por IP. */
export const contactRoutes = new Hono<AppEnv>().get('/listings/:id/contact', async (c) =>
  json(await revealContact(c.var.deps, c.req.param('id'), clientIp(c.req.raw))),
);
