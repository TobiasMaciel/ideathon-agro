import { Hono } from 'hono';
import { getCatalog } from '../../application/get-catalog';
import { json } from '../respond';
import type { AppEnv } from '../types';

/** GET /api/catalog — catálogo curado + publicaciones abiertas, sin contacto. */
export const catalogRoutes = new Hono<AppEnv>().get('/catalog', async (c) => json(await getCatalog(c.var.deps)));
