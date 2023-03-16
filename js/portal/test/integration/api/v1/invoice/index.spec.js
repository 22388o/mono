const {expect} = require("chai");
describe.only('Invoice - createInvoice', function () {
    it('must return the invoice hash from the lightning channel', function () {
        const { alice } = this.test.ctx

        return alice.createInvoice({lndCreds: alice.credentials, paymentAmount: 10000})
            .then(json => {
                console.log(`invoice/createInvoice response for alice: ${JSON.stringify(json)}`)
                expect(json).to.be.an('object')

                // expect(json).to.have.property('invoice')
                // expect(json.balances).to.be.an('array')

                // expect(json.balances[0]).to.be.an('object')
                // expect(json.balances[0]).to.have.property('lightning')
                // expect(json.balances[0].lightning).to.be.an('object')

                // expect(json.balances[0].lightning).to.have.property('balance')
                // expect(json.balances[0].lightning.balance).to.be.a('number')
        })
    })
})