class CartPage {
  emptyCartMessage = 'Your shopping cart is empty!'
  modifiedMessage = 'Success: You have modified your shopping cart!'

  get content() {
    return cy.get('#content')
  }

  get productRows() {
    return cy.get('#checkout-cart form tbody tr')
  }

  get successAlert() {
    return cy.get('#checkout-cart .alert-success')
  }

  get checkoutButton() {
    return cy.contains('#checkout-cart .buttons a', 'Checkout')
  }

  get summaryAmounts() {
    return cy.get('#checkout-cart .col-md-4 table td strong')
  }

  get subTotalAmount() {
    return cy.contains('#checkout-cart td', /^Sub-Total:$/).next()
  }

  get totalAmount() {
    return cy.contains('#checkout-cart td', /^Total:$/).next()
  }

  productRow(name: string) {
    return cy.contains('#checkout-cart form tbody tr', name)
  }

  quantityInput(name: string) {
    return this.productRow(name).find('input[name^="quantity"]')
  }

  open() {
    cy.visit('/index.php?route=checkout/cart')
    cy.contains('#checkout-cart h1', 'Shopping Cart').should('be.visible')
  }

  addProduct(productId: number) {
    cy.request({
      method: 'POST',
      url: '/index.php?route=checkout/cart/add',
      form: true,
      body: { product_id: productId, quantity: 1 },
    })
  }

  updateQuantity(name: string, quantity: number) {
    this.quantityInput(name).clear().type(String(quantity))
    this.productRow(name).find('button[type="submit"]').click()
  }

  removeProduct(name: string) {
    this.productRow(name).find('button.btn-danger').click()
  }

  proceedToCheckout() {
    this.checkoutButton.click()
  }

  parsePrice(text: string): number {
    return Number(text.replace(/[^0-9.]/g, ''))
  }

  verifyEmpty() {
    cy.location('search').should('eq', '?route=checkout/cart')
    this.content.should('contain.text', this.emptyCartMessage)
  }

  verifyModifiedMessage() {
    this.successAlert.should('be.visible').and('contain.text', this.modifiedMessage)
  }

  verifyProductQuantity(name: string, quantity: number) {
    this.quantityInput(name).should('have.value', String(quantity))
  }

  verifyRowTotal(name: string, quantity: number) {
    this.productRow(name)
      .find('td.text-right')
      .should(($cells) => {
        const unitPrice = this.parsePrice($cells.eq(0).text())
        const rowTotal = this.parsePrice($cells.eq(1).text())
        expect(rowTotal).to.be.closeTo(unitPrice * quantity, 0.001)
      })
  }

  verifyProductNotListed(name: string) {
    this.content.should('not.contain.text', name)
  }

  verifyProductCount(count: number) {
    this.productRows.should('have.length', count)
  }

  verifyTotalEqualsSumOfRows() {
    this.productRows.then(($rows) => {
      const sum = [...$rows].reduce(
        (total, row) => total + this.parsePrice(Cypress.$(row).find('td.text-right').last().text()),
        0,
      )
      this.totalAmount.should(($total) => {
        expect(this.parsePrice($total.text())).to.be.closeTo(sum, 0.001)
      })
    })
  }

  verifyTotalsAddUp() {
    this.summaryAmounts.should(($amounts) => {
      const values = [...$amounts].map((amount) => this.parsePrice(amount.textContent ?? ''))
      const total = values.pop() ?? 0
      const sum = values.reduce((acc, value) => acc + value, 0)
      expect(total).to.be.closeTo(sum, 0.001)
    })
    this.subTotalAmount.should('be.visible')
  }
}

export default new CartPage()
