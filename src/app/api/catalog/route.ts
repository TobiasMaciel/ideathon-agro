import type { CatalogResponse } from '@/lib/api/types';
import { json } from '@/server/http';
import { getDataSet } from '@/server/repository';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const { origin, data } = await getDataSet();
  const body: CatalogResponse = { origin, ...data };
  return json(body);
}
