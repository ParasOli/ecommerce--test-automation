class LoginPage{
get emailInput(){
    return  cy.get('input[name="email"]')
    }
    open() {
        this.emailInput.type('paras')
    cy.contains("h2", "Returning Customer").should("be.visible");
  }
}
export default new LoginPage()
