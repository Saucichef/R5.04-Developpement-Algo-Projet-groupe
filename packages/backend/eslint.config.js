const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const perfectionist = require('eslint-plugin-perfectionist');
const n = require('eslint-plugin-n');
const unicorn = require('eslint-plugin-unicorn');
const eslintConfigPrettier = require('eslint-config-prettier');
const globals = require('globals');

module.exports = [
  {
    ignores: ['node_modules/**', 'coverage/**', 'dist/**']
  },

  js.configs.recommended,

  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...require('globals').node,
        ...require('globals').jest
      }
    }
  },

  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    },
    plugins: {
      n,
      perfectionist,
      unicorn
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-console': 'off',
      'n/no-process-exit': 'off',
      'n/no-unpublished-require': 'off',
      'n/no-missing-require': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/prefer-node-protocol': 'off',
      'unicorn/consistent-destructuring': 'off',
      'perfectionist/sort-imports': 'warn',
      'perfectionist/sort-objects': 'warn'
    }
  },

  {
    files: ['**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      }
    }
  },

  eslintConfigPrettier
];
