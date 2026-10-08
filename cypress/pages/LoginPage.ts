class LoginPage {
  get emailInput() {
    return cy.get('#input-email')
  }

  get passwordInput() {
    return cy.get('#input-password')
  }

  get loginButton() {
    return cy.get('input[type="submit"][value="Login"]')
  }

  get errorAlert() {
    return cy.get('#account-login .alert-danger')
  }

  open() {
    cy.visit('/index.php?route=account/login')
    cy.contains('h2', 'Returning Customer').should('be.visible')
  }

  typeEmail(email: string) {
    if (email) this.emailInput.clear().type(email)
  }

  typePassword(password: string) {
    if (password) this.passwordInput.clear().type(password, { log: false })
  }

  submit() {
    this.loginButton.click()
  }

  login(email: string, password: string) {
    this.typeEmail(email)
    this.typePassword(password)
    this.submit()
  }

  verifyErrorMessage(message: string | RegExp) {
    this.errorAlert.should('be.visible')
    if (typeof message === 'string') {
      this.errorAlert.should('contain.text', message)
    } else {
      this.errorAlert.invoke('text').should('match', message)
    }
  }
}

export default new LoginPage()
