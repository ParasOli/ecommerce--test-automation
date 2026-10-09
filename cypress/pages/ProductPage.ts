class ProductPage {
  addedToCartMessage = 'Success: You have added {name} to your shopping cart!'

  get title() {
    return cy.get('#product-product h1')
  }

  get addToCartButton() {
    return cy.get('#product-product button.button-cart:visible')
  }

  get successToast() {
    return cy.get('#notification-box-top .toast-body')
  }

  open(productId: number) {
    cy.visit(`/index.php?route=product/product&product_id=${productId}`)
    this.addToCartButton.should('be.visible')
  }

  addToCart() {
    this.addToCartButton.click()
  }

  verifyAddedToCart(name: string) {
    this.successToast.should('be.visible').and('contain.text', this.addedToCartMessage.replace('{name}', name))
  }
}

export default new ProductPage()
