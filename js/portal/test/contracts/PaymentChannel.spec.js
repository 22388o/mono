/**
 * @file Specification for the PaymentChannel smart contract
 */

const { expect } = require('chai')

describe('PaymentChannel', function () {
  let Contract = null
  let contract = null

  beforeEach(async function () {
    const { contracts } = this
    Contract = await contracts.PaymentChannel.deploy()
    contract = Contract.methods
<<<<<<< HEAD
=======

    expect(contract).to.be.an('object')
>>>>>>> master
  })

  describe('.method()', function () {
    it('must have some tests here')
  })
})
