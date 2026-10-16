import type { GeneratorsResponse } from '@/lib/api/types';
import { apiError, json } from '@/server/http';
import { getDataSet } from '@/server/repository';

export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<Response> {
  const material = new URL(req.url).searchParams.get('material');
  const { origin, data } = await getDataSet();
  if (material !== null && !data.materials.some((m) => m.id === material)) {
    return apiError(`Material inválido: "${material}"`, 400);
  }
  const body: GeneratorsResponse = {
    origin,
    generators: material === null ? data.generators : data.generators.filter((g) => g.materialId === material),
  };
  return json(body);
}
