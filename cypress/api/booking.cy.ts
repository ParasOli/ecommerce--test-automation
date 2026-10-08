import * as allure from 'allure-js-commons'

describe('Booking', () => {
  const booking = {
    firstname: 'Jim',
    lastname: `Brown${Date.now()}`,
    totalprice: 111,
    depositpaid: true,
    bookingdates: { checkin: '2026-01-01', checkout: '2026-01-05' },
    additionalneeds: 'Breakfast',
  }

  const updatedBooking = {
    firstname: 'James',
    lastname: 'Brown',
    totalprice: 222,
    depositpaid: false,
    bookingdates: { checkin: '2026-02-01', checkout: '2026-02-03' },
    additionalneeds: 'Lunch',
  }

  it('TC-BOOKING-01: health check responds', () => {
    cy.request('/ping').its('status').should('eq', 201)
  })

  it('TC-BOOKING-02: creates a booking', () => {
    allure.severity('critical')

    cy.request('POST', '/booking', booking).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.bookingid).to.be.a('number')
      expect(response.body.booking).to.deep.equal(booking)
    })
  })

  it('TC-BOOKING-03: gets a booking by id', () => {
    cy.request('POST', '/booking', booking).then((created) => {
      cy.request(`/booking/${created.body.bookingid}`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.deep.equal(booking)
      })
    })
  })

  it('TC-BOOKING-04: finds a booking by guest name', () => {
    cy.request('POST', '/booking', booking).then((created) => {
      cy.request(`/booking?firstname=${booking.firstname}&lastname=${booking.lastname}`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.deep.include({ bookingid: created.body.bookingid })
      })
    })
  })

  it('TC-BOOKING-05: updates a booking with a token', () => {
    allure.severity('critical')

    cy.request('POST', '/auth', { username: 'admin', password: 'password123' }).then((auth) => {
      cy.request('POST', '/booking', booking).then((created) => {
        cy.request({
          method: 'PUT',
          url: `/booking/${created.body.bookingid}`,
          headers: { Cookie: `token=${auth.body.token}` },
          body: updatedBooking,
        }).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.deep.equal(updatedBooking)
        })
      })
    })
  })

  it('TC-BOOKING-06: partially updates a booking', () => {
    cy.request('POST', '/auth', { username: 'admin', password: 'password123' }).then((auth) => {
      cy.request('POST', '/booking', booking).then((created) => {
        cy.request({
          method: 'PATCH',
          url: `/booking/${created.body.bookingid}`,
          headers: { Cookie: `token=${auth.body.token}` },
          body: { totalprice: 333 },
        }).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.deep.equal({ ...booking, totalprice: 333 })
        })
      })
    })
  })

  it('TC-BOOKING-07: rejects an update without a token', () => {
    cy.request('POST', '/booking', booking).then((created) => {
      cy.request({
        method: 'PUT',
        url: `/booking/${created.body.bookingid}`,
        body: updatedBooking,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(403)
        expect(response.body).to.eq('Forbidden')
      })
    })
  })

  it('TC-BOOKING-08: deletes a booking', () => {
    allure.severity('critical')

    cy.request('POST', '/auth', { username: 'admin', password: 'password123' }).then((auth) => {
      cy.request('POST', '/booking', booking).then((created) => {
        cy.request({
          method: 'DELETE',
          url: `/booking/${created.body.bookingid}`,
          headers: { Cookie: `token=${auth.body.token}` },
        }).then((response) => {
          expect(response.status).to.eq(201)
        })

        cy.request({ url: `/booking/${created.body.bookingid}`, failOnStatusCode: false }).then((response) => {
          expect(response.status).to.eq(404)
        })
      })
    })
  })

  it('TC-BOOKING-09: returns 404 for a booking that does not exist', () => {
    cy.request({ url: '/booking/999999999', failOnStatusCode: false }).then((response) => {
      expect(response.status).to.eq(404)
      expect(response.body).to.eq('Not Found')
    })
  })

  it('TC-BOOKING-10: rejects a booking with missing required fields', () => {
    cy.request({
      method: 'POST',
      url: '/booking',
      body: { firstname: 'OnlyFirstName' },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.at.least(400)
      expect(response.body).not.to.have.property('bookingid')
    })
  })
})
