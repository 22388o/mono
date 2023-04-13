/**
 * @file Specification for the PaymentChannel smart contract
 */

const { expect } = require('chai')
const { createHash, randomBytes } = require('crypto')
const lib = require('../lib/lib')

describe('PaymentChannel', function () {
  let Contract = null
  let contract = null

  beforeEach(async function () {
    const { web3, contracts } = this
    const object = contracts['PaymentChannel.sol']['PaymentChannel']
    Contract = await lib.deploy(object, web3)
    contract = Contract.methods
  })

  describe('.method()', function () {
    it('must have some tests here')
  })
})
