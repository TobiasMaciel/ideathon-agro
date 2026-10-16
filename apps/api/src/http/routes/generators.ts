import { Hono } from 'hono';
import { listGenerators } from '../../application/get-catalog';
import { json } from '../respond';
import type { AppEnv } from '../types';

/** GET /api/generators?material=<MaterialId> */
export const generatorsRoutes = new Hono<AppEnv>().get('/generators', async (c) =>
  json(await listGenerators(c.var.deps, c.req.query('material') ?? null)),
);
