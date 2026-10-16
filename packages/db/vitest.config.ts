import { defineConfig } from "vitest/config";

export default defineConfig({
  // PGlite (Postgres en WASM) tarda un poco en arrancar.
  test: { environment: "node", include: ["src/**/*.test.ts"], testTimeout: 30_000, hookTimeout: 60_000 },
});
