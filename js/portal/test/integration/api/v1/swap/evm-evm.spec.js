/**
 * @file Behavioral specification for an EVM-to-EVM atomic swap
 */

const { expect } = require('chai')
const { createHash, randomBytes } = require('crypto')
const Party = require('../../../../../lib/core/party')
const Swap = require('../../../../../lib/core/swap')

function createMessageHandler (client, done) {
  return function onMessage (order) {
    expect(order).to.be.an('object')
    expect(order.id).to.be.a('string').with.lengthOf(32)
    // expect the timestamp to be within 100ms; hopefully this is sufficient for
    // all test runs, including the slowest CI system
    expect(order.ts).to.be.a('number').closeTo(Date.now(), 100)
    expect(order.type).to.be.a('string').that.equals('limit')
    expect(order.uid).to.be.a('string').that.equals(client.id)

    if (order.status === 'opened') {
      client.off('message', onMessage)
      done()
    }
  }
}

describe.only('Swaps - EVM/EVM', function () {
  const SECRET = randomBytes(32)
  const SECRET_HASH = createHash('sha256').update(SECRET).digest('hex')
  const ORDER_PROPS = {
    baseAsset: 'ETH',
    baseNetwork: 'sepolia',
    baseQuantity: 1,
    quoteAsset: 'USDC',
    quoteNetwork: 'goerli',
    quoteQuantity: 1000
  }
  let swapAlice = null
  let swapBob = null

  before(function () {
    const { alice, bob } = this.test.ctx

    alice
      .on('swap.created', swap => { swapAlice = swap })

    bob
      .on('swap.created', swap => { swapBob = swap })
  })

  it('must allow alice to place an order', function (done) {
    const order = Object.assign({}, ORDER_PROPS, {
      hash: SECRET_HASH,
      side: 'ask'
    })
    const alice = this.test.ctx.alice

    alice
      .once('order.opened', order => done())
      .once('message', msg => done(Error(`unexpected message "${msg}"`)))
      .once('error', done)
      .submitLimitOrder(order)
  })

  it('must allow bob to place an order', function (done) {
    const order = Object.assign({}, ORDER_PROPS, {
      hash: 'ignored',
      side: 'bid'
    })
    const bob = this.test.ctx.bob

    bob
      .once('order.opened', order => done())
      .once('message', msg => done(Error(`unexpected message "${msg}"`)))
      .once('error', done)
      .submitLimitOrder(order)
  })

  it('must match orders from alice and bob', function () {
    const { alice, bob } = this.test.ctx

    expect(swapAlice).to.be.an('object')
    expect(swapBob).to.be.an('object')
    expect(swapAlice).to.deep.equal(swapBob)
  })

  it('must allow alice to open the swap', function () {
    return this.test.ctx.alice.swapOpen(swapAlice)
  })

  it('must allow bob to open the swap', function () {
    return this.test.ctx.bob.swapOpen(swapAlice)
  })

  it('must allow alice to commit the swap', function () {
    return this.test.ctx.alice.swapCommit(swapAlice)
  })

  it('must allow bob to commit the swap', function () {
    return this.test.ctx.bob.swapCommit(swapAlice)
  })
})
