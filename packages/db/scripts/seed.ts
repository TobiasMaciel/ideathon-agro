import { alternatives, assumptions, buyers, generators, materials, sources } from '@mapa/core/data';
import { createDb } from '../src/client';
import { seedDatabase } from '../src/seed';

// Carga @mapa/core/data en la base de DATABASE_URL (borra y reinserta, en una transacción).
// Usar un usuario con permisos de escritura, no mapa_readonly.
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Falta DATABASE_URL (ver .env.example).');
  process.exit(1);
}

const db = createDb(url);
try {
  await seedDatabase(db, { sources, materials, alternatives, assumptions, generators, buyers });
  console.log(
    `Seed cargado: ${sources.length} fuentes, ${materials.length} materiales, ${alternatives.length} alternativas, ` +
      `${assumptions.length} supuestos, ${generators.length} generadores, ${buyers.length} compradores.`,
  );
} finally {
  await db.$client.end();
}
