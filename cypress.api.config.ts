import { defineConfig } from 'cypress'
import { allureCypress } from 'allure-cypress/reporter'

export default defineConfig({
  retries: {
    runMode: 1,
    openMode: 0,
  },
  responseTimeout: 60000,
  e2e: {
    baseUrl: 'https://restful-booker.herokuapp.com',
    specPattern: 'cypress/api/**/*.cy.ts',
    supportFile: false,
    setupNodeEvents(on, config) {
      allureCypress(on, config, {
        resultsDir: 'allure-results-api',
        environmentInfo: {
          api: 'https://restful-booker.herokuapp.com',
          node: process.version,
        },
      })
      return config
    },
  },
})
