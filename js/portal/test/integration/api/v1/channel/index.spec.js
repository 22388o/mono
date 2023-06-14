const {expect} = require("chai");
describe.only('Channel - balance', function () {
    it('must return the balances from the lightning channel', function () {
        const { alice } = this.test.ctx

        return alice.getBalance(alice.credentials)
            .then(json => {
                console.log(`channel/getBalance response for alice: ${JSON.stringify(json)}`)
                expect(json).to.be.an('object')

                expect(json).to.have.property('balances')
                expect(json.balances).to.be.an('array')

                expect(json.balances[0]).to.be.an('object')
                expect(json.balances[0]).to.have.property('lightning')
                expect(json.balances[0].lightning).to.be.an('object')

                expect(json.balances[0].lightning).to.have.property('balance')
                expect(json.balances[0].lightning.balance).to.be.a('number')

                expect(json.balances[0].lightning).to.have.property('pendingBalance')
                expect(json.balances[0].lightning.pendingBalance).to.be.a('number')

                expect(json.balances[0].lightning).to.have.property('unsettledBalance')
                expect(json.balances[0].lightning.unsettledBalance).to.be.a('number')

                expect(json.balances[0].lightning).to.have.property('inbound')
                expect(json.balances[0].lightning.inbound).to.be.a('number')

                expect(json.balances[0].lightning).to.have.property('pendingInbound')
                expect(json.balances[0].lightning.pendingInbound).to.be.a('number')
        })
    })
})