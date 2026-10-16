import { defineConfig } from 'drizzle-kit';

// `drizzle-kit generate` solo compara el esquema con migrations/ (no necesita conexión).
// `drizzle-kit studio` sí usa DATABASE_URL.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  out: './migrations',
  dbCredentials: { url: process.env.DATABASE_URL ?? 'postgres://mapa:mapa@localhost:5432/mapa' },
});
