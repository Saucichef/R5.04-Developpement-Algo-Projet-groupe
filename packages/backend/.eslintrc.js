module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  parserOptions: {
    ecmaVersion: 'latest'
  },
  extends: ['eslint:recommended', 'plugin:n/recommended', 'plugin:unicorn/recommended', 'prettier'],
  plugins: ['n', 'unicorn', 'perfectionist'],
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
    'perfectionist/sort-imports': ['warn', { type: 'natural' }],
    'perfectionist/sort-objects': ['warn', { type: 'natural' }]
  }
};
