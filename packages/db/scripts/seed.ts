import { alternatives, assumptions, buyers, curatedContacts, generators, materials, sources } from '@mapa/core/data';
import { createDb } from '../src/client';
import { seedDatabase } from '../src/seed';

// Carga @mapa/core/data en la base de DATABASE_URL (borra y reinserta, en una transacción).
// Usar un usuario con permisos de escritura, no mapa_readonly.
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Falta DATABASE_URL (ver .env.example).');
  process.exit(1);
}

const { db, close } = createDb(url);
try {
  await seedDatabase(db, { sources, materials, alternatives, assumptions, generators, buyers, contacts: curatedContacts });
  console.log(
    `Seed cargado: ${sources.length} fuentes, ${materials.length} materiales, ${alternatives.length} alternativas, ` +
      `${assumptions.length} supuestos, ${generators.length} generadores, ${buyers.length} compradores, ${curatedContacts.length} contactos.`,
  );
} finally {
  await close();
}
