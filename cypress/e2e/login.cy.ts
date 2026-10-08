import loginPage from '../pages/LoginPage'
import accountPage from '../pages/AccountPage'
import logoutPage from '../pages/LogoutPage'

const NO_MATCH_ERROR = 'Warning: No match for E-Mail Address and/or Password.'
const LOGIN_ERROR = /Warning: (No match for E-Mail Address and\/or Password|Your account has exceeded allowed number of login attempts)/

describe('Login', () => {
  const email: string = Cypress.env('USER_EMAIL')
  const password: string = Cypress.env('USER_PASSWORD')

  beforeEach(() => {
    loginPage.open()
  })

  it('TC-LOGIN-01: logs in with a valid email and password', () => {
    loginPage.login(email, password)

    accountPage.verifyLoaded()
  })

  it('TC-LOGIN-02: shows an error for a wrong password', () => {
    loginPage.login(email, 'WrongPassword!123')

    loginPage.verifyErrorMessage(NO_MATCH_ERROR)
  })

  it('TC-LOGIN-03: shows an error for an email that is not registered', () => {
    loginPage.login(`not.registered.${Date.now()}@example.com`, password)

    loginPage.verifyErrorMessage(NO_MATCH_ERROR)
  })

  it('TC-LOGIN-04: shows an error when both fields are empty', () => {
    loginPage.login('', '')

    loginPage.verifyErrorMessage(LOGIN_ERROR)
  })

  it('TC-LOGIN-05: shows an error for an email in an invalid format', () => {
    loginPage.login(`invalid-email-format-${Date.now()}`, password)

    loginPage.verifyErrorMessage(NO_MATCH_ERROR)
  })

  it('TC-LOGIN-06: hides the password while typing', () => {
    loginPage.typePassword(password)

    loginPage.passwordInput
      .should('have.attr', 'type', 'password')
      .and('have.value', password)
  })

  it('TC-LOGIN-07: logs out and shows the logout confirmation', () => {
    loginPage.login(email, password)
    accountPage.verifyLoaded()

    accountPage.logout()

    logoutPage.verifyLoggedOut()
  })
})
