const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const globals = require('globals');

module.exports = [
  {
    ignores: ['node_modules/**', '**/build/**', '**/coverage/**', '**/dist/**']
  },

  js.configs.recommended,

  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        console: 'readonly'
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'error',
      eqeqeq: 'error',
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^React$'
        }
      ]
    }
  },

  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off'
    }
  },

  {
    files: ['**/*.test.js', '**/*.test.jsx', '**/*.test.ts', '**/*.test.tsx'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.browser,
        ...globals.node
      }
    }
  },

  {
    files: ['eslint.config.js', 'jest.config.js'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
];
