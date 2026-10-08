class HomePage {
  get headerSearchInput() {
    return cy.get('header #search:visible input[name="search"]')
  }

  get headerSearchButton() {
    return cy.get('header #search:visible button[type="submit"]')
  }

  open() {
    cy.visit('/')
  }

  searchFromHeader(term: string) {
    this.headerSearchInput.clear().type(term)
    this.headerSearchButton.click()
  }
}

export default new HomePage()
