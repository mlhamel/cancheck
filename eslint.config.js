import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/'],
  },
  {
    files: ['*.js', 'tests/**/*.mjs', 'eslint.config.js'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 2024,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['app.js', 'i18n.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  js.configs.recommended,
];
