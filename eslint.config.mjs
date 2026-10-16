import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

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
  {
    // Helpers exportados junto al componente (sin cambiar la estructura de los módulos en esta migración).
    files: ["apps/web/src/components/panel/{BuyerRanking,Filters,Light}.tsx"],
    rules: { "react-refresh/only-export-components": "off" },
  },
]);
