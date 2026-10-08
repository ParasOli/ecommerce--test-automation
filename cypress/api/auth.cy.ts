import 'allure-cypress'

describe('Auth', () => {
  it('TC-AUTH-01: returns a token for valid credentials', () => {
    cy.request('POST', '/auth', { username: 'admin', password: 'password123' }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.token).to.be.a('string').and.have.length.greaterThan(0)
    })
  })

  it('TC-AUTH-02: rejects a wrong password', () => {
    cy.request('POST', '/auth', { username: 'admin', password: 'wrong-password' }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.deep.equal({ reason: 'Bad credentials' })
    })
  })
})
