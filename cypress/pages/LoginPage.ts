class LoginPage {
  noMatchError = 'Warning: No match for E-Mail Address and/or Password.'
  lockedError = 'Warning: Your account has exceeded allowed number of login attempts.'

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

  verifyNoMatchError() {
    this.errorAlert.should('be.visible').and('contain.text', this.noMatchError)
  }

  verifyNoMatchOrLockedError() {
    this.errorAlert.should('be.visible').and(($alert) => {
      const text = $alert.text()
      expect(text.includes(this.noMatchError) || text.includes(this.lockedError), text).to.equal(true)
    })
  }
}

export default new LoginPage()
