import * as allure from 'allure-js-commons'
import cartPage from '../pages/CartPage'
import checkoutPage, { Guest } from '../pages/CheckoutPage'
import confirmOrderPage from '../pages/ConfirmOrderPage'
import orderSuccessPage from '../pages/OrderSuccessPage'

describe('Checkout', () => {
  let guest: Guest
  let iphone: { id: number; name: string }

  beforeEach(() => {
    cy.fixture('ui/guest').then((data) => {
      guest = { ...data, email: `guest_${Date.now()}@example.com` }
    })
    cy.fixture('ui/products').then((data) => {
      iphone = data.iphone
    })
  })

  it('TC-CHECKOUT-01: sends you back to the cart when the cart is empty', () => {
    checkoutPage.open()

    cartPage.verifyEmpty()
  })

  it('TC-CHECKOUT-02: places an order as a guest', () => {
    allure.severity('critical')
    cartPage.addProduct(iphone.id)
    checkoutPage.open()

    checkoutPage.chooseGuestCheckout()
    checkoutPage.fillGuestDetails(guest)
    checkoutPage.agreeToTerms()
    checkoutPage.continue()

    confirmOrderPage.verifyProduct(iphone.name)
    confirmOrderPage.confirmOrder()

    orderSuccessPage.verifyOrderPlaced()
  })

  it('TC-CHECKOUT-03: shows errors when the guest details are empty', () => {
    cartPage.addProduct(iphone.id)
    checkoutPage.open()

    checkoutPage.chooseGuestCheckout()
    checkoutPage.fillAddress(guest)
    checkoutPage.agreeToTerms()
    checkoutPage.continue()

    checkoutPage.verifyRequiredFieldErrors()
    checkoutPage.verifyStillOnCheckout()
  })

  it('TC-CHECKOUT-04: shows a warning when Terms & Conditions are not accepted', () => {
    cartPage.addProduct(iphone.id)
    checkoutPage.open()

    checkoutPage.chooseGuestCheckout()
    checkoutPage.fillGuestDetails(guest)
    checkoutPage.continue()

    checkoutPage.verifyTermsWarning()
    checkoutPage.verifyStillOnCheckout()
  })
})
