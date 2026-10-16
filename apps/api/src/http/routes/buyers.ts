import { Hono } from 'hono';
import { listBuyers } from '../../application/get-catalog';
import { json } from '../respond';
import type { AppEnv } from '../types';

/** GET /api/buyers?sector=<BuyerSector>&accepts=<MaterialId> */
export const buyersRoutes = new Hono<AppEnv>().get('/buyers', async (c) =>
  json(await listBuyers(c.var.deps, { sector: c.req.query('sector') ?? null, accepts: c.req.query('accepts') ?? null })),
);
