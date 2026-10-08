import loginPage from '../pages/LoginPage'

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>
    }
  }
}

Cypress.Commands.add('login', (email?: string, password?: string) => {
  cy.env(['USER_EMAIL', 'USER_PASSWORD']).then((env) => {
    const userEmail = email ?? env.USER_EMAIL
    const userPassword = password ?? env.USER_PASSWORD

    cy.session(
      userEmail,
      () => {
        loginPage.open()
        loginPage.login(userEmail, userPassword)
        cy.location('search').should('eq', '?route=account/account')
      },
      {
        validate() {
          cy.request({ url: '/index.php?route=account/account', followRedirect: false }).its('status').should('eq', 200)
        },
        cacheAcrossSpecs: true,
      },
    )
  })
})
