import type { BuyersResponse } from '@/lib/api/types';
import type { BuyerSector } from '@/data/types';
import { apiError, json } from '@/server/http';
import { getDataSet } from '@/server/repository';

export const dynamic = 'force-dynamic';

const SECTORS: BuyerSector[] = ['yerbatera', 'central_biomasa', 'citricola', 'secadero_granos', 'frigorifico'];

export async function GET(req: Request): Promise<Response> {
  const params = new URL(req.url).searchParams;
  const sector = params.get('sector');
  const accepts = params.get('accepts');
  if (sector !== null && !SECTORS.includes(sector as BuyerSector)) {
    return apiError(`Sector inválido: "${sector}"`, 400);
  }
  const { origin, data } = await getDataSet();
  if (accepts !== null && !data.materials.some((m) => m.id === accepts)) {
    return apiError(`Material inválido: "${accepts}"`, 400);
  }
  const buyers = data.buyers.filter(
    (b) => (sector === null || b.sector === sector) && (accepts === null || b.accepts.some((m) => m === accepts)),
  );
  const body: BuyersResponse = { origin, buyers };
  return json(body);
}
