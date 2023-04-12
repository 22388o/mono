/**
 * @file Sets up the Mocha testing environment for testing the smart contracts
 */

const fs = require('fs')
const Web3 = require('web3')
const { expect } = require('chai')

const abi = JSON.parse(fs.readFileSync('./build/MyContract.abi'))
const bytecode = fs.readFileSync('./build/MyContract.bin').toString()

describe('Smart-Contracts', function () {
  before('', function () {
    this.web3 = new Web3(process.env.PORTAL_ETHEREUM_URL)
  })

  after('', function () {

  })
})
