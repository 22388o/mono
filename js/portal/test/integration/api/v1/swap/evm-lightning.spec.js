/**
 * @file Behavioral specification for an EVM-to-EVM atomic swap
 */

const { expect } = require('chai')
const { createHash, randomBytes } = require('crypto')

/**
 * This is a simple test case wherein,
 */
describe.only('Swaps - EVM/Lightning', function () {
  const SECRET = randomBytes(32)
  const SECRET_HASH = createHash('sha256').update(SECRET).digest('hex')
  const ORDER_PROPS = {
    baseAsset: 'BTC',
    baseNetwork: 'lightning',
    baseQuantity: 0.00001,
    quoteAsset: 'ETH',
    quoteNetwork: 'goerli',
    quoteQuantity: 1
  }
  let aliceSwapCreated, aliceSwapOpened, aliceSwapClosed
  let bobSwapCreated, bobSwapOpened, bobSwapClosed

  /**
   * Sets up listeners for incoming messages from the server
   *
   * Over the course of this test, the server will send updates to the clients
   * at certain points, such as when the orders are matched and a swap is
   * created.
   *
   * We record these events for both Alice and Bob and use them later.
   */
  before('Watch for updates for the server', function () {
    const { alice, bob } = this.test.ctx

    alice
      .once('swap.created', swap => { aliceSwapCreated = swap })
      .once('swap.opened', swap => { aliceSwapOpened = swap })
      .once('swap.closed', swap => { aliceSwapClosed = swap })

    bob
      .once('swap.created', swap => { bobSwapCreated = swap })
      .once('swap.opened', swap => { bobSwapOpened = swap })
      .once('swap.closed', swap => { bobSwapClosed = swap })
  })

  /**
   * Alice places an order using the secret hash. The test waits for the order
   * to be opened on the orderbook.
   */
  it('must allow alice to place an order', function (done) {
    this.test.ctx.alice
      .once('order.opened', order => done())
      .submitLimitOrder(Object.assign({}, ORDER_PROPS, {
        hash: SECRET_HASH,
        side: 'ask'
      }))
      .catch(done)
  })

  /**
   * Bob places the counter-order that would match with Alice's order, and waits
   * for the order to be opened on the orderbook.
   */
  it('must allow bob to place an order', function (done) {
    this.test.ctx.bob
      .once('order.opened', order => done())
      .submitLimitOrder(Object.assign({}, ORDER_PROPS, {
        hash: 'ignored',
        side: 'bid'
      }))
      .catch(done)
  })

  /**
   * Bob's order being opened on the orderbook triggers the creation of a swap
   * based on the two orders to be matched. The swap is sent down the open
   * updates channel for the two parties. This test verifies that the swap is
   * received by both alice and bob, and that the fields are as expected, esp.
   * the secret hash.
   */
  it('must broadcast the created swap to alice and bob', function () {
    const { alice, bob } = this.test.ctx

    expect(aliceSwapCreated).to.be.an('object')
    expect(bobSwapCreated).to.be.an('object')
    expect(aliceSwapCreated).to.deep.equal(bobSwapCreated)

    const swap = aliceSwapCreated
    expect(swap.id).to.be.a('string').with.lengthOf(64)
    expect(swap.secretHash).to.be.a('string').that.equals(SECRET_HASH)
    expect(swap.status).to.be.a('string').that.equals('created')

    expect(swap.secretHolder).to.be.an('object')
    expect(swap.secretHolder.id).to.be.a('string').that.equals(alice.id)

    expect(swap.secretSeeker).to.be.an('object')
    expect(swap.secretSeeker.id).to.be.a('string').that.equals(bob.id)
  })

  /**
   * Once the swap is created, Bob (the secret seeker) opens the swap.
   */
  it('must allow bob to open the swap', function () {
    const { bob } = this.test.ctx
    const { lightning } = bob.state // TODO: unfortunate name here! Fix this
    return bob.swapOpen(bobSwapCreated, { lightning })
  })

  /**
   * Once Bob has opened the swap, Alice (the secret-holder) proceeds to open
   * the swap.
   */
  it('must allow alice to open the swap', function () {
    return this.test.ctx.alice.swapOpen(aliceSwapCreated)
  })

  it('must broadcast the opened swap to alice and bob', function () {
    const { alice, bob } = this.test.ctx

    expect(aliceSwapOpened).to.be.an('object')
    expect(bobSwapOpened).to.be.an('object')
    expect(aliceSwapOpened).to.deep.equal(bobSwapOpened)

    const swap = aliceSwapOpened
    expect(swap.id).to.be.a('string').that.equals(aliceSwapCreated.id)
    expect(swap.secretHash).to.be.a('string').that.equals(SECRET_HASH)
    expect(swap.status).to.be.a('string').that.equals('opened')

    expect(swap.secretHolder).to.be.an('object')
    expect(swap.secretHolder.id).to.be.a('string').that.equals(alice.id)
    expect(swap.secretHolder.state).to.be.an('object')
    expect(swap.secretHolder.state.lightning).to.be.an('object')
    expect(swap.secretHolder.state.lightning.invoice).to.be.an('object')

    expect(swap.secretSeeker).to.be.an('object')
    expect(swap.secretSeeker.id).to.be.a('string').that.equals(bob.id)
    expect(swap.secretSeeker.state).to.be.an('object')
    expect(swap.secretSeeker.state.goerli).to.be.an('object')
    expect(swap.secretSeeker.state.goerli.invoice).to.be.an('object')
  })

  /**
   * Once the swap is opened, Bob commits to the swap.
   */
  it('must allow bob to commit the swap', function () {
    const { bob } = this.test.ctx
    const { lightning } = bob.state // TODO: unfortunate name here! Fix this
    return bob.swapCommit(bobSwapOpened, { lightning })
  })

  /**
   * Lastly, Alice commits to the swap, and this should trigger the exchange of
   * assets on both chains.
   */
  it('must allow alice to commit the swap', function () {
    const { alice } = this.test.ctx
    const { lightning } = alice.state // TODO: unfortunate name here! Fix this
    return alice.swapCommit(aliceSwapOpened, { lightning })
  })

  it.skip('must broadcast the closed swap to alice and bob', function () {
    const { alice, bob } = this.test.ctx

    expect(aliceSwapClosed).to.be.an('object')
    expect(bobSwapClosed).to.be.an('object')
    expect(aliceSwapClosed).to.deep.equal(bobSwapClosed)

    const swap = aliceSwapClosed
    expect(swap.id).to.be.a('string').that.equals(aliceSwapCreated.id)
    expect(swap.secretHash).to.be.a('string').that.equals(SECRET_HASH)
    expect(swap.status).to.be.a('string').that.equals('closed')

    expect(swap.secretHolder).to.be.an('object')
    expect(swap.secretHolder.id).to.be.a('string').that.equals(alice.id)
    expect(swap.secretHolder.state).to.be.an('object')
    expect(swap.secretHolder.state.lightning).to.be.an('object')
    expect(swap.secretHolder.state.lightning.invoice).to.be.an('object')

    expect(swap.secretSeeker).to.be.an('object')
    expect(swap.secretSeeker.id).to.be.a('string').that.equals(bob.id)
    expect(swap.secretSeeker.state).to.be.an('object')
    expect(swap.secretSeeker.state.goerli).to.be.an('object')
    expect(swap.secretSeeker.state.goerli.invoice).to.be.an('object')
  })

  it.skip('must validate account balances for alice and bob', function () {

  })
})
