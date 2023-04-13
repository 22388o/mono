/**
 * @file Sets up the Mocha testing environment for testing the smart contracts
 */

const { expect } = require('chai')
const fs = require('fs')
const Web3 = require('web3')
const lib = require('../lib/lib')

before('Initialize Web3 and compile the contracts', async function () {
  this.web3 = new Web3(process.env.PORTAL_ETHEREUM_URL)
  this.contracts = await lib.compile()
})

describe('Must have initialized the test environment', function () {
  it('must have a web3 instance', function () {
    const { web3 } = this.test.ctx
    expect(web3).to.be.an.instanceof(Web3)
  })

  it('must have compiled all contracts', function () {
    const { contracts, web3 } = this.test.ctx

    expect(contracts).to.be.an('object')
    expect(contracts).to.have.all.deep.keys(
      'ECDSA.sol',
      'IERC20.sol',
      'PaymentChannel.sol',
      'ReentrancyGuard.sol',
      'Swap.sol'
    )
  })
})
