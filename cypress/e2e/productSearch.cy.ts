import productSearch from "../pages/productSearch"

describe('Product Search', () => {

  it('TC-SEARCH-01: finds products by keyword from the header search bar', () => {
    const term = 'iphone'
    cy.visit('/')

    productSearch.navSearch(term)

    productSearch.shouldBeOnResultsPage(term)
    productSearch.shouldShowResultsMatching(term)
  })

  it('TC-SEARCH-02: finds products by keyword', () => {
    const term = 'ipod'
    productSearch.open()

    productSearch.searchByCriteria(term)

    productSearch.shouldBeOnResultsPage(term)
    productSearch.shouldShowResultsMatching(term)
  })

  it('TC-SEARCH-03: finds products by keyword within a category', () => {
    // Note: the demo site does not actually narrow results by category,
    // so this checks the category is applied, not that others are filtered out.
    const term = 'ipod'
    productSearch.open()

    productSearch.selectCategory('MP3 Players')
    productSearch.searchByCriteria(term)

    productSearch.shouldBeOnResultsPage(term)
    cy.url().should('include', 'category_id=34')
    productSearch.categoryDropdown.find('option:selected').should('have.text', 'MP3 Players')
    productSearch.shouldShowResultsMatching(term)
  })

  it('TC-SEARCH-04: finds products by a word that only appears in the description', () => {
    const term = 'revolutionary'
    productSearch.open()

    productSearch.checkSearchInDescription()
    productSearch.searchByCriteria(term)

    productSearch.shouldBeOnResultsPage(term)
    productSearch.shouldShowProduct('iPhone')
  })

  it('TC-SEARCH-05: shows a message when nothing matches', () => {
    const term = `noproduct${Date.now()}`
    productSearch.open()

    productSearch.searchByCriteria(term)

    productSearch.shouldBeOnResultsPage(term)
    productSearch.shouldShowNoResults()
  })
})
