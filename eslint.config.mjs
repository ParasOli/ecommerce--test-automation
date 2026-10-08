import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginCypress from 'eslint-plugin-cypress'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default tseslint.config(
  {
    ignores: [
      'node_modules',
      'allure-results',
      'allure-report',
      'allure-results-api',
      'allure-report-api',
      'site',
      'cypress/screenshots',
      'cypress/videos',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  pluginCypress.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      'cypress/no-unnecessary-waiting': 'error',
      'cypress/no-force': 'off',
      '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
    },
  },
  prettier,
)
