import { defineConfig } from "vitest/config";

export default defineConfig({
  // db.test.ts arranca PGlite (Postgres en WASM), que tarda en frío.
  test: { environment: "node", include: ["src/**/*.test.ts"], testTimeout: 30_000, hookTimeout: 60_000 },
});
