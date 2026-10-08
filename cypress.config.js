require("dotenv").config();
const { defineConfig } = require("cypress");
const { allureCypress } = require("allure-cypress/reporter");

module.exports = defineConfig({
  env:{
    USER_EMAIL:process.env.USER_EMAIL,
     USER_PASSWORD: process.env.USER_PASSWORD,
  },
  e2e: {
    baseUrl:'https://ecommerce-playground.lambdatest.io',
    setupNodeEvents(on, config) {
      allureCypress(on, config, {
        resultsDir: "allure-results",
      });
      return config;
    },
  },
});
