import 'allure-cypress'
import * as allure from 'allure-js-commons'

beforeEach(() => {
  const [feature, title] = Cypress.currentTest.titlePath

  allure.epic('Restful Booker API')
  allure.feature(feature)
  allure.label('testId', title.split(':')[0])
})
