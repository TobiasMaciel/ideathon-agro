import { Hono } from 'hono';
import { createListing } from '../../application/create-listing';
import { readJsonBody } from '../body';
import { clientIp } from '../client-ip';
import { json } from '../respond';
import type { AppEnv } from '../types';

/** POST /api/listings — publicación abierta ("sin verificar"), con tope de body y límite por IP. */
export const listingsRoutes = new Hono<AppEnv>().post('/listings', async (c) => {
  const raw = await readJsonBody(c.req.raw);
  return json(await createListing(c.var.deps, raw, clientIp(c.req.raw)), 201);
});
