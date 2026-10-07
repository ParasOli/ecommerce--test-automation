require("dotenv").config();
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  env:{
    USER_EMAIL:process.env.USER_EMAIL,
     USER_PASSWORD: process.env.USER_PASSWORD,
  },
  e2e: {
    baseUrl:'https://ecommerce-playground.lambdatest.io',
    setupNodeEvents(on, config) {
    },
  },
});
