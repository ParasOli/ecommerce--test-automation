import 'allure-cypress'
import * as allure from 'allure-js-commons'
import './commands'

const TEST_CASES_SHEET =
  'https://docs.google.com/spreadsheets/d/1H_uBYgXPTL0s3cx396A-W7VRnHUprfkR2sP5Vly19nw/edit?pli=1&gid=1588861163#gid=1588861163'

beforeEach(() => {
  const [feature, title] = Cypress.currentTest.titlePath
  const testId = title.split(':')[0]

  allure.epic('E-commerce UI')
  allure.feature(feature)
  allure.label('testId', testId)
  allure.tms(TEST_CASES_SHEET, testId)
  allure.parameter('browser', Cypress.browser.name)
  allure.parameter('viewport', `${Cypress.config('viewportWidth')}x${Cypress.config('viewportHeight')}`)
})
