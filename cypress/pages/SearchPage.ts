class SearchPage {
  noResultsMessage = 'There is no product that matches the search criteria.'

  get searchInput() {
    return cy.get('#input-search')
  }

  get categorySelect() {
    return cy.get('#product-search select[name="category_id"]')
  }

  get searchInDescriptionCheckbox() {
    return cy.get('#description')
  }

  get searchButton() {
    return cy.get('#button-search')
  }

  get productCards() {
    return cy.get('#product-search .product-thumb')
  }

  get productTitles() {
    return cy.get('#product-search .product-thumb h4.title a')
  }

  open() {
    cy.visit('/index.php?route=product/search')
  }

  search(term: string) {
    this.searchInput.clear().type(term)
    this.searchButton.click()
  }

  selectCategory(category: string) {
    this.categorySelect.select(category)
  }

  searchInDescriptions() {
    this.searchInDescriptionCheckbox.check({ force: true })
  }

  verifyLoaded(term: string) {
    cy.url().should((url) => {
      expect(decodeURIComponent(url)).to.include('route=product/search').and.include(`search=${term}`)
    })
    cy.contains('h1', `Search - ${term}`).should('be.visible')
  }

  verifyCategorySelected(category: string) {
    this.categorySelect.find('option:selected').should('have.text', category)
  }

  verifyResultsMatch(term: string) {
    this.productCards.should('have.length.greaterThan', 0)
    this.productTitles.each(($title) => {
      expect($title.text().toLowerCase()).to.contain(term.toLowerCase())
    })
  }

  verifyProductShown(name: string) {
    this.productTitles.contains(name).should('be.visible')
  }

  verifyNoResults() {
    this.productCards.should('not.exist')
    cy.contains('#product-search p', this.noResultsMessage).should('be.visible')
  }
}

export default new SearchPage()
