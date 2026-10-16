import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { alternatives, assumptions, buyers, generators, materials, sources } from '../src/data/index';
import { renderSeed } from '../src/lib/db/rows';

const out = fileURLToPath(new URL('../supabase/seed.sql', import.meta.url));
const sql = renderSeed({ sources, materials, alternatives, assumptions, generators, buyers });
writeFileSync(out, sql, 'utf8');
console.log(`seed escrito en ${out} (${sql.length} bytes)`);
