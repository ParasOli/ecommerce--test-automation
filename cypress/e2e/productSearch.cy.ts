import * as allure from 'allure-js-commons'
import homePage from '../pages/HomePage'
import searchPage from '../pages/SearchPage'

describe('Product Search', () => {
  it('TC-SEARCH-01: finds products by keyword from the header search bar', () => {
    allure.severity('critical')
    const term = 'iphone'
    homePage.open()

    homePage.searchFromHeader(term)

    searchPage.verifyLoaded(term)
    searchPage.verifyResultsMatch(term)
  })

  it('TC-SEARCH-02: finds products by keyword', () => {
    const term = 'ipod'
    searchPage.open()

    searchPage.search(term)

    searchPage.verifyLoaded(term)
    searchPage.verifyResultsMatch(term)
  })

  it('TC-SEARCH-03: finds products by keyword within a category', () => {
    const term = 'ipod'
    searchPage.open()

    searchPage.selectCategory('MP3 Players')
    searchPage.search(term)

    searchPage.verifyLoaded(term)
    searchPage.verifyCategorySelected('MP3 Players')
    searchPage.verifyResultsMatch(term)
  })

  it('TC-SEARCH-04: finds products by a word that only appears in the description', () => {
    const term = 'revolutionary'
    searchPage.open()

    searchPage.searchInDescriptions()
    searchPage.search(term)

    searchPage.verifyLoaded(term)
    searchPage.verifyProductShown('iPhone')
  })

  it('TC-SEARCH-05: shows a message when nothing matches', () => {
    const term = `noproduct${Date.now()}`
    searchPage.open()

    searchPage.search(term)

    searchPage.verifyLoaded(term)
    searchPage.verifyNoResults()
  })
})
