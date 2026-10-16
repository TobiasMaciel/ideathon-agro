import { Hono } from 'hono';
import { evaluateMatch } from '../../application/evaluate-match';
import { readJsonBody } from '../body';
import { parseViabilityRequest } from '../parse-viability';
import { json } from '../respond';
import type { AppEnv } from '../types';

/** POST /api/viability — evaluación de un match con el mismo modelo que el front. */
export const viabilityRoutes = new Hono<AppEnv>().post('/viability', async (c) => {
  const request = parseViabilityRequest(await readJsonBody(c.req.raw));
  return json(await evaluateMatch(c.var.deps, request));
});
