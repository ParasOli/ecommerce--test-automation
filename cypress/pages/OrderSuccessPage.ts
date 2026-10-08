class OrderSuccessPage {
  orderPlacedMessage = 'Your order has been placed!'

  verifyOrderPlaced() {
    cy.location('search').should('include', 'checkout/success')
    cy.contains('h1', this.orderPlacedMessage).should('be.visible')
  }
}

export default new OrderSuccessPage()
