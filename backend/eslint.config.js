const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules/**'] },
  {
    files: ['src/**/*.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off', // the server and scheduler log to stdout by design
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',
    },
  },
  {
    // Vitest runs with `globals: true`, so describe/it/expect are ambient here.
    files: ['tests/**/*.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
    },
  },
];
