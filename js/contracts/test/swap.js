/**
 * @file Specification for the Swap smart contract
 */

const { expect } = require('chai')
const { createHash, randomBytes } = require('crypto')
const Swap = artifacts.require('Swap')

contract('Swap', function (accounts) {
  describe('.toHash()', function () {
    it('must correctly generate a SHA-256 hash', async function () {
      const swap = await Swap.deployed()

      const secret = randomBytes(32)
      const secretHash = createHash('sha256').update(secret).digest('hex')
      const hash = await swap.toHash.call(secret)

      expect(hash).to.equal(`0x${secretHash}`)
    })
  })

  describe('Native ETH', async function () {
    describe('Happy-path', function () {
      it('must create an invoice')
      it('must pay an invoice')
      it('must settle an invoice')
    })

    describe('Error-handling', function () {
      it('needs more test cases')
    })

    describe('Pathological cases', function () {
      it('needs more test cases')
    })
  })

  describe('ERC-20 Tokens', function () {
    describe('Happy-path', function () {
      it('must create an invoice')
      it('must pay an invoice')
      it('must settle an invoice')
    })

    describe('Error-handling', function () {
      it('needs more test cases')
    })

    describe('Pathological cases', function () {
      it('needs more test cases')
    })
  })
})
