import { Hono } from 'hono';
import { getHealth } from '../../application/get-health';
import { json } from '../respond';
import type { AppEnv } from '../types';

/** GET /api/health — estado y origen de datos (único endpoint que informa el origen). */
export const healthRoutes = new Hono<AppEnv>().get('/health', async (c) => json(await getHealth(c.var.deps)));
