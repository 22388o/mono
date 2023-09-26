/**
 * @file Behavioral specification for the Ethereum blockain
 */

const Ethereum = require('../../../lib/blockchains/ethereum')
const { expect } = require('chai')
const Web3 = require('web3')

describe('Blockchains - Ethereum', () => {
  describe('instantiation', () => {
    it('must correctly instantiate', () => {
      const props = {}
      let blockchain = null

      expect(() => { blockchain = new Ethereum(props) }).to.not.throw()
      expect(blockchain).to.be.an.instanceof(Ethereum)
      expect(blockchain.id).to.be.a('string').that.equals('geth')
      expect(blockchain.name).to.be.a('string').that.equals('ethereum')
      // TODO: more validation here of all appropriate fields
    })
  })

  describe('operation', () => {
    let blockchain = null

    before(function () {
      blockchain = new Ethereum()
    })

    after(function () {
      blockchain = null
    })

    it('must connect to the geth daemon', function () {
      throw Error('not implemented')
    })

    // TODO: more tests here to test contract calls and events

    it('must disconnect from the geth daemon', function () {
      throw Error('not implemented')
    })
  })

  describe('error-handling', () => {
    // TODO: more tests here to test error-handling
  })
})
