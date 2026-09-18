import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // Each context file deliberately exports its provider component alongside
    // its `useX` consumer hook. Splitting them apart would only buy slightly
    // better hot-reload behaviour, so the rule is off for this directory.
    files: ['src/context/*.jsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
