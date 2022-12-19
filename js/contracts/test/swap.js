/**
 * @file Specification for the Swap smart contract
 */

const { expect } = require('chai')
const { createHash, randomBytes } = require('crypto')
const Swap = artifacts.require('Swap')

contract('Swap', function (accounts) {
  const SECRET = randomBytes(32)
  const SECRET_HASH = createHash('sha256').update(SECRET).digest('hex')

  it('must have deployed the contract', async function () {
    const swap = await Swap.deployed()
    expect(swap).to.not.equal(null)
  })

  it('must correctly generate a SHA-256 hash', async function () {
    const swap = await Swap.deployed()
    const hash = await swap.toHash.call(SECRET)
    expect(hash).to.equal(`0x${SECRET_HASH}`)
  })
})
