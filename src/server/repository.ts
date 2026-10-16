import { alternatives, assumptions, buyers, generators, materials, sources } from '@/data';
import { getSupabase } from '@/lib/db/supabase';
import { fromRows, type DataSet, type DbRows } from '@/lib/db/rows';
import type { DataOrigin } from '@/lib/api/types';

/** Datos locales (src/data). */
function localDataSet(): DataSet {
  return { sources, materials, alternatives, assumptions, generators, buyers };
}

/**
 * Lee el catálogo de Supabase si hay credenciales; si no, o si falla, usa src/data.
 * El env se lee en cada llamada (no en import time).
 */
export async function getDataSet(): Promise<{ origin: DataOrigin; data: DataSet }> {
  const sb = getSupabase();
  if (!sb) return { origin: 'local', data: localDataSet() };

  try {
    const [src, mat, st, alt, asm, gen, buy] = await Promise.all([
      sb.from('sources').select('*').order('id'),
      sb.from('materials').select('*').order('id'),
      sb.from('material_states').select('*').order('material_id').order('state'),
      sb.from('alternatives').select('*').order('id'),
      sb.from('assumptions').select('*').order('key'),
      sb.from('generators').select('*').order('id'),
      sb.from('buyers').select('*').order('id'),
    ]);
    const failed = [src, mat, st, alt, asm, gen, buy].find((r) => r.error);
    if (failed?.error) throw new Error(failed.error.message);
    const rows = {
      sources: src.data,
      materials: mat.data,
      material_states: st.data,
      alternatives: alt.data,
      assumptions: asm.data,
      generators: gen.data,
      buyers: buy.data,
    } as unknown as DbRows;
    return { origin: 'supabase', data: fromRows(rows) };
  } catch (e) {
    console.error('Supabase no disponible, uso datos locales:', e instanceof Error ? e.message : String(e));
    return { origin: 'local', data: localDataSet() };
  }
}
