class productSearch{
    get navSearchBarInput(){
        return cy.get('#main-header #search input[name="search"]')
    }
    get navSearchSubmitButton(){
        return cy.get('#main-header #search button[type="submit"]')
    }
    get searchCriteriaInput(){
        return cy.get('#input-search')
    }
    get categoryDropdown(){
        return cy.get('#product-search select[name="category_id"]')
    }
    get searchInDescriptionCheckbox(){
        return cy.get('#description')
    }
    get searchCriteriaButton(){
        return cy.get('#button-search')
    }
    get productComponent(){
        return cy.get('#product-search .product-thumb')
    }

    get productTitle(){
        return cy.get('#product-search .product-thumb h4.title a')
    }
    open(){
        cy.visit('/index.php?route=product/search')
    }
    navSearch(term:string){
        this.navSearchBarInput.type(term)
        this.navSearchSubmitButton.click()
    }
    searchByCriteria(term:string){
        this.searchCriteriaInput.clear().type(term)
        this.searchCriteriaButton.click()
    }
    selectCategory(category:string){
        this.categoryDropdown.select(category)
    }
    checkSearchInDescription(){
        this.searchInDescriptionCheckbox.check({ force: true })
    }
    shouldBeOnResultsPage(term:string){
        cy.url().should((url)=>{
            expect(decodeURIComponent(url)).to.include('route=product/search').and.include(`search=${term}`)
        })
        cy.contains('h1', `Search - ${term}`).should('be.visible')
    }
    shouldShowResultsMatching(term:string){
        this.productComponent.should('have.length.greaterThan', 0)
        this.productTitle.each(($title)=>{
            expect($title.text().toLocaleLowerCase()).to.contain(term.toLowerCase())
        })
    }
    shouldShowProduct(name:string){
        this.productTitle.contains(name).should('be.visible')
    }
    shouldShowNoResults(){
        this.productComponent.should('not.exist')
        cy.contains('#product-search p', 'There is no product that matches the search criteria.').should('be.visible')
    }
}

export default new productSearch()
