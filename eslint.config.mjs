import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const style = stylistic.configs.customize({
  braceStyle: '1tbs',
  indent: 2,
  quotes: 'single',
  semi: true,
});

const styleRules = {
  ...style.rules,
  curly: ['error', 'all'],
  '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: false }],
};

export default defineConfig([
  globalIgnores([
    '**/dist/**',
    '**/node_modules/**',
    '**/coverage/**',
    '**/build/**',
    '**/test-results/**',
    '**/playwright-report/**',
    // Generated OpenAPI declarations retain the generator's formatting; tsc checks their use.
    'apps/web/src/api/generated/openapi.ts',
  ]),
  {
    files: ['apps/api/**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    plugins: {
      '@stylistic': stylistic,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: styleRules,
  },
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      '@stylistic': stylistic,
    },
    languageOptions: {
      globals: globals.browser,
    },
    rules: styleRules,
  },
  {
    files: ['apps/web/test/helpers/*.mjs', 'scripts/testing/*.mjs'],
    extends: [js.configs.recommended],
    plugins: { '@stylistic': stylistic },
    languageOptions: { globals: globals.node },
    rules: styleRules,
  },
]);
