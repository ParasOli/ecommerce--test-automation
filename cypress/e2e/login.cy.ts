import * as allure from 'allure-js-commons'
import loginPage from '../pages/LoginPage'
import accountPage from '../pages/AccountPage'
import logoutPage from '../pages/LogoutPage'

describe('Login', () => {
  let email: string
  let password: string

  beforeEach(() => {
    cy.env(['USER_EMAIL', 'USER_PASSWORD']).then((env) => {
      email = env.USER_EMAIL
      password = env.USER_PASSWORD
    })
    loginPage.open()
  })

  it('TC-LOGIN-01: logs in with a valid email and password', () => {
    allure.severity('critical')
    loginPage.login(email, password)

    accountPage.verifyLoaded()
  })

  it('TC-LOGIN-02: shows an error for a wrong password', () => {
    loginPage.login(email, 'WrongPassword!123')

    loginPage.verifyNoMatchError()
  })

  it('TC-LOGIN-03: shows an error for an email that is not registered', () => {
    loginPage.login(`not.registered.${Date.now()}@example.com`, password)

    loginPage.verifyNoMatchError()
  })

  it('TC-LOGIN-04: shows an error when both fields are empty', () => {
    loginPage.login('', '')

    loginPage.verifyNoMatchOrLockedError()
  })

  it('TC-LOGIN-05: shows an error for an email in an invalid format', () => {
    loginPage.login(`invalid-email-format-${Date.now()}`, password)

    loginPage.verifyNoMatchError()
  })

  it('TC-LOGIN-06: hides the password while typing', () => {
    loginPage.typePassword(password)

    loginPage.passwordInput.should('have.attr', 'type', 'password').and('have.value', password)
  })

  it('TC-LOGIN-07: logs out and shows the logout confirmation', () => {
    cy.login()
    accountPage.open()
    accountPage.verifyLoaded()

    accountPage.logout()

    logoutPage.verifyLoggedOut()
  })
})
