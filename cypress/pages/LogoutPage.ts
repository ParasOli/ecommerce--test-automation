class LogoutPage {
  verifyLoggedOut() {
    cy.location('search').should('eq', '?route=account/logout')
    cy.contains('h1', 'Account Logout').should('be.visible')
    cy.contains('You have been logged off your account.').should('be.visible')
  }
}

export default new LogoutPage()
