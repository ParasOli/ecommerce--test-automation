import 'dotenv/config'
import { defineConfig } from 'cypress'
import { allureCypress } from 'allure-cypress/reporter'

export default defineConfig({
  env: {
    USER_EMAIL: process.env.USER_EMAIL,
    USER_PASSWORD: process.env.USER_PASSWORD,
  },
  retries: {
    runMode: 1,
    openMode: 0,
  },
  defaultCommandTimeout: 8000,
  pageLoadTimeout: 90000,
  e2e: {
    baseUrl: 'https://ecommerce-playground.lambdatest.io',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    scrollBehavior: 'center',
    setupNodeEvents(on, config) {
      allureCypress(on, config, {
        resultsDir: 'allure-results',
        environmentInfo: {
          site: 'https://ecommerce-playground.lambdatest.io',
          node: process.version,
        },
      })
      return config
    },
  },
})
