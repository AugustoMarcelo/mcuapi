const js = require('@eslint/js');
const globals = require('globals');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const importPlugin = require('eslint-plugin-import');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
  {
    ignores: [
      'node_modules',
      'dist',
      'mcuapi-mcp',
      'mcuapi-client',
      'coverage',
    ],
  },
  {
    files: ['src/**/*.ts', 'scripts/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
    },
    settings: {
      'import/resolver': { typescript: {} },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      ...importPlugin.flatConfigs.recommended.rules,
      ...importPlugin.flatConfigs.typescript.rules,

      // airbnb-base enabled this; nested ternaries are still hard to read here — keep it
      'no-nested-ternary': 'error',
      // airbnb-base enabled this; keep import grouping/order enforced
      'import/order': 'error',
      // preserved from the pre-upgrade config: `_`-prefixed unused args (e.g. Express
      // middleware signatures) are intentional, not dead code
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '_' },
      ],

      // preserved from the pre-upgrade config: dataset fields are intentionally
      // snake_case (mirrors the Marvel API shape), and services/repositories use
      // `this`-free and reassigned-param patterns throughout
      'class-methods-use-this': 'off',
      camelcase: 'off',
      'no-param-reassign': 'off',
      // core no-undef can't see ambient global types (e.g. `NodeJS.Timeout` from
      // @types/node) and flags them as undefined; the TS compiler already checks
      // this correctly, so typescript-eslint's own docs recommend turning it off
      'no-undef': 'off',

      // deliberately omitted, not just disabled: HATEOAS `_links` is the intended
      // API shape, so `no-underscore-dangle` is the wrong rule for this codebase
      // deliberately omitted: named exports are the house style
      // (StatsPresenter.ts, TimelinePresenter.ts), so `import/prefer-default-export`
      // would fight the codebase rather than help it
    },
  },
  {
    files: ['**/*.spec.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  {
    files: ['*.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      '@typescript-eslint/no-require-imports': 'error',
    },
  },
  prettierRecommended,
];
