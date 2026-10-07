describe('login page', ()=>{
  it.only('login page', ()=>{
    cy.visit('/index.php?route=account/login')
    cy.get('input[name="email"]').type(Cypress.env('USER_EMAIL'))
    cy.get('input[name="password"]').type(Cypress.env('USER_PASSWORD'))
    cy.get('[value="Login"]').click()

    cy.location('search').should('eq', '?route=account/account')
    cy.contains('h2', 'My Account').should('be.visible')
  })
})