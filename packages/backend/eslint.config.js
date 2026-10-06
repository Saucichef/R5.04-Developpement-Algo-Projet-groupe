const js = require('@eslint/js');
const perfectionist = require('eslint-plugin-perfectionist');
const n = require('eslint-plugin-n');
const unicorn = require('eslint-plugin-unicorn');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  {
    ignores: ['node_modules/**', 'coverage/**', 'dist/**']
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        console: 'readonly'
      }
    },
    plugins: {
      n,
      perfectionist,
      unicorn
    },
    rules: {
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
        afterAll: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        describe: 'readonly',
        expect: 'readonly',
        it: 'readonly',
        jest: 'readonly',
        test: 'readonly'
      }
    }
  },
  eslintConfigPrettier
];
