class AccountPage {
  get logoutLink() {
    return cy.get('#column-right').contains('a', 'Logout')
  }

  verifyLoaded() {
    cy.location('search').should('eq', '?route=account/account')
    cy.contains('h2', 'My Account').should('be.visible')
  }

  logout() {
    this.logoutLink.click()
  }
}

export default new AccountPage()
