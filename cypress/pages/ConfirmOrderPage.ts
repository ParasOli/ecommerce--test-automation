class ConfirmOrderPage {
  get confirmButton() {
    return cy.get('#button-confirm')
  }

  verifyProduct(name: string) {
    cy.location('search').should('include', 'checkout/confirm')
    cy.get('#content').should('contain.text', name)
  }

  confirmOrder() {
    this.confirmButton.click()
  }
}

export default new ConfirmOrderPage()
