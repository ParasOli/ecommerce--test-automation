export interface Guest {
  firstName: string
  lastName: string
  email: string
  telephone: string
  address: string
  city: string
  postcode: string
  country: string
  region: string
}

class CheckoutPage {
  termsWarning = 'Warning: You must agree to the Terms & Conditions!'

  requiredFieldErrors = {
    firstName: 'First Name must be between 1 and 32 characters!',
    lastName: 'Last Name must be between 1 and 32 characters!',
    email: 'E-Mail address does not appear to be valid!',
    telephone: 'Telephone must be between 3 and 32 characters!',
  }

  get guestCheckoutOption() {
    return cy.get('label[for="input-account-guest"]')
  }

  get firstNameInput() {
    return cy.get('#input-payment-firstname')
  }

  get lastNameInput() {
    return cy.get('#input-payment-lastname')
  }

  get emailInput() {
    return cy.get('#input-payment-email')
  }

  get telephoneInput() {
    return cy.get('#input-payment-telephone')
  }

  get addressInput() {
    return cy.get('#input-payment-address-1')
  }

  get cityInput() {
    return cy.get('#input-payment-city')
  }

  get postcodeInput() {
    return cy.get('#input-payment-postcode')
  }

  get countrySelect() {
    return cy.get('#input-payment-country')
  }

  get regionSelect() {
    return cy.get('#input-payment-zone')
  }

  get termsCheckbox() {
    return cy.get('label[for="input-agree"]')
  }

  get continueButton() {
    return cy.get('#button-save')
  }

  get warningAlert() {
    return cy.get('#content .alert-dismissible')
  }

  open() {
    cy.visit('/index.php?route=checkout/checkout')
  }

  chooseGuestCheckout() {
    this.guestCheckoutOption.click()
    this.firstNameInput.should('be.visible')
  }

  fillGuestDetails(guest: Guest) {
    this.fillPersonalDetails(guest)
    this.fillAddress(guest)
  }

  fillPersonalDetails(guest: Guest) {
    this.firstNameInput.clear().type(guest.firstName)
    this.lastNameInput.clear().type(guest.lastName)
    this.emailInput.clear().type(guest.email)
    this.telephoneInput.clear().type(guest.telephone)
  }

  fillAddress(guest: Guest) {
    this.addressInput.clear().type(guest.address)
    this.cityInput.clear().type(guest.city)
    this.postcodeInput.clear().type(guest.postcode)
    this.countrySelect.select(guest.country)
    this.regionSelect.should('contain', guest.region).select(guest.region)
  }

  agreeToTerms() {
    this.termsCheckbox.click()
  }

  continue() {
    this.continueButton.click()
  }

  verifyRequiredFieldErrors() {
    this.firstNameInput.parent().should('contain.text', this.requiredFieldErrors.firstName)
    this.lastNameInput.parent().should('contain.text', this.requiredFieldErrors.lastName)
    this.emailInput.parent().should('contain.text', this.requiredFieldErrors.email)
    this.telephoneInput.parent().should('contain.text', this.requiredFieldErrors.telephone)
  }

  verifyTermsWarning() {
    this.warningAlert.should('be.visible').and('contain.text', this.termsWarning)
  }

  verifyStillOnCheckout() {
    cy.location('search').should('eq', '?route=checkout/checkout')
  }
}

export default new CheckoutPage()
