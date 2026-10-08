class CartPage {
  emptyCartMessage = 'Your shopping cart is empty!'

  get content() {
    return cy.get('#content')
  }

  open() {
    cy.visit('/index.php?route=checkout/cart')
  }

  addProduct(productId: number) {
    cy.request({
      method: 'POST',
      url: '/index.php?route=checkout/cart/add',
      form: true,
      body: { product_id: productId, quantity: 1 },
    })
  }

  verifyEmpty() {
    cy.location('search').should('eq', '?route=checkout/cart')
    this.content.should('contain.text', this.emptyCartMessage)
  }
}

export default new CartPage()
