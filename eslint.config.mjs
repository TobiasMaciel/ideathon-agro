import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

/** Fronteras entre capas (docs/plan-v6-arquitectura.md, sección 4). */
const forbid = (patterns) => ({ rules: { "no-restricted-imports": ["error", { patterns }] } });

/** La web solo usa core/{domain,contracts}: nunca el catálogo curado, los puertos ni la base. */
const WEB_BASE = [{ group: ["@mapa/db", "@mapa/db/*", "@mapa/core/data", "@mapa/core/ports"], message: "la web solo usa domain y contracts" }];

export default defineConfig([
  globalIgnores([
    "**/node_modules/**",
    "**/dist/**",
    "**/.wrangler/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    ".claude/**",
    ".agents/**",
    ".gemini/**",
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  { rules: { "no-irregular-whitespace": ["error", { skipStrings: true, skipTemplates: true, skipRegExps: true }] } },
  {
    files: ["packages/**/*.ts", "apps/api/**/*.ts", "scripts/**/*", "**/*.mjs", "e2e/**/*.ts", "**/*.config.ts"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
  },
  // --- Capas de back (core + api) ---
  {
    // Los tests del dominio usan el catálogo curado como fixture (escenarios reales del guion).
    files: ["packages/core/src/domain/**"],
    ignores: ["**/*.test.ts"],
    ...forbid([
      {
        group: ["**/ports", "**/ports/**", "**/contracts", "**/contracts/**", "**/data", "**/data/**", "@mapa/*", "hono*", "drizzle-orm*", "react*"],
        message: "domain es puro",
      },
    ]),
  },
  {
    files: ["packages/core/src/{ports,contracts,data}/**"],
    ...forbid([{ group: ["**/data", "**/data/**", "**/contracts", "**/contracts/**", "@mapa/*"], message: "solo depende de domain" }]),
  },
  // En flat config, la última regla que matchea gana: primero la general de api, después las de cada capa.
  {
    // composition.ts es el único lugar que conoce @mapa/db (los tests de integración también lo usan).
    files: ["apps/api/src/**"],
    ignores: ["apps/api/src/composition.ts", "apps/api/src/**/*.test.ts"],
    ...forbid([{ group: ["@mapa/db", "@mapa/db/*"], message: "solo composition.ts importa @mapa/db" }]),
  },
  {
    files: ["apps/api/src/application/**"],
    ignores: ["**/*.test.ts"],
    ...forbid([
      {
        group: ["hono", "hono/*", "@mapa/db", "@mapa/db/*", "@mapa/core/data", "**/adapters/**", "**/http/**", "**/composition"],
        message: "casos de uso: solo core/{domain,ports,contracts}",
      },
    ]),
  },
  {
    files: ["apps/api/src/http/**"],
    ignores: ["**/*.test.ts"],
    ...forbid([
      { group: ["@mapa/db", "@mapa/db/*", "**/adapters/**", "**/composition"], message: "las rutas no conocen adaptadores; usar deps" },
    ]),
  },
  // --- fin capas de back ---
  // --- Capas de la web (app → features → api / shared) ---
  // Un archivo que cae en dos bloques toma solo el último no-restricted-imports: shared y features repiten la base.
  {
    // Los tests usan el catálogo curado (@mapa/core/data) como fixture.
    files: ["apps/web/src/**/*.{ts,tsx}"],
    ignores: ["apps/web/src/**/*.test.ts"],
    ...forbid(WEB_BASE),
  },
  {
    files: ["apps/web/src/shared/**/*.{ts,tsx}"],
    ignores: ["apps/web/src/**/*.test.ts"],
    ...forbid([...WEB_BASE, { group: ["@/features", "@/features/**", "@/app", "@/app/**"], message: "shared no depende de features ni de app" }]),
  },
  {
    files: ["apps/web/src/features/**/*.{ts,tsx}"],
    ignores: ["apps/web/src/**/*.test.ts"],
    ...forbid([
      ...WEB_BASE,
      { group: ["@/features/*/*"], message: "importar otra feature solo por su index.ts" },
      { group: ["@/app", "@/app/**"], message: "las features no dependen de app" },
    ]),
  },
  {
    files: ["apps/web/src/**/*.{ts,tsx}"],
    ignores: ["apps/web/src/api/**"],
    rules: { "no-restricted-globals": ["error", { name: "fetch", message: "usar src/api (único lugar que hace fetch)" }] },
  },
  {
    files: ["apps/web/src/**/*.tsx"],
    ignores: ["apps/web/src/components/ui/**"],
    rules: { "max-lines": ["warn", 300] },
  },
  // --- fin capas de la web ---
]);
