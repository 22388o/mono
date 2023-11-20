/**
 * @file Behavioral specification for an EVM/Lightning atomic swap
 */

/**
 * This is a simple test case wherein
 */
describe('Swaps - Lightning/Ethereum', function () {
  const ORDER_PROPS = {
    baseAsset: 'BTC',
    baseNetwork: 'lightning.btc',
    baseQuantity: 10000,
    quoteAsset: 'ETH',
    quoteNetwork: 'ethereum',
    quoteQuantity: 100000
  }

  let secretHash = null

  before('test setup', function () {
    const { alice, bob } = this.test.ctx
    const onSwap = (user, event) => [event, swap => console.log(`${user}.${event}`, swap.status)]

    function validate (user, swap) {
      expect(swap.id).to.be.a('string').with.lengthOf(64)
      expect(swap.secretHolder).to.be.an('object')
      expect(swap.secretHolder.id).to.be.a('string').that.equals(alice.id)
      expect(swap.secretSeeker).to.be.an('object')
      expect(swap.secretSeeker.id).to.be.a('string').that.equals(bob.id)
    }

    this.test.ctx.alice
      .on('swap.received', swap => {
        validate('alice', swap)
        expect(swap.secretHash).to.equal(undefined)
        expect(swap.status).to.be.a('string').that.equals('received')

        expect(swap.secretHolder.invoice).to.equal(null)
        expect(swap.secretSeeker.invoice).to.equal(null)
      })
      .on('swap.created', swap => {
        validate('alice', swap)
        expect(swap.secretHash).to.be.a('string').with.lengthOf(64)
        expect(swap.status).to.be.a('string').that.equals('created')

        expect(swap.secretHolder.invoice).to.equal(null)
        expect(swap.secretSeeker.invoice).to.equal(null)

        secretHash = swap.secretHash
      })
      .on('swap.holder.invoice.created', swap => {
        validate('alice', swap)
        expect(swap.secretHash).to.be.a('string').to.equal(secretHash)
        expect(swap.status).to.be.a('string').that.equals('holder.invoice.created')

        expect(swap.secretHolder.invoice).to.equal(null)
        expect(swap.secretSeeker.invoice).to.equal(null)
      })
      .on('swap.holder.invoice.sent', swap => {
        validate('alice', swap)
        expect(swap.secretHash).to.be.a('string').to.equal(secretHash)
        expect(swap.status).to.be.a('string').that.equals('holder.invoice.sent')
      })
      .on('swap.seeker.invoice.created', swap => {
        throw Error('alice should not create seeker invoice as the secret holder!')
      })
      .on('swap.seeker.invoice.sent', swap => {
        validate('alice', swap)
        expect(swap.secretHash).to.be.a('string').to.equal(secretHash)
        expect(swap.status).to.be.a('string').that.equals('seeker.invoice.sent')
      })
      .on(...onSwap('alice', 'swap.holder.invoice.paid'))
      .on(...onSwap('alice', 'swap.seeker.invoice.paid'))
      .on(...onSwap('alice', 'swap.holder.invoice.settled'))
      .on(...onSwap('alice', 'swap.seeker.invoice.settled'))
      .on(...onSwap('alice', 'swap.completed'))

    this.test.ctx.bob
      .on('swap.received', swap => {
        validate('bob', swap)
        expect(swap.secretHash).to.equal(undefined)
        expect(swap.status).to.be.a('string').that.equals('received')
      })
      .on('swap.created', swap => {
        throw Error('bob should not create the swap as the secret seeker!')
      })
      .on('swap.holder.invoice.created', swap => {
        throw Error('bob should not create holder invoice as the secret seeker!')
      })
      .on('swap.holder.invoice.sent', swap => {
        validate('bob', swap)
        expect(swap.secretHash).to.be.a('string').to.equal(secretHash)
        expect(swap.status).to.be.a('string').that.equals('holder.invoice.sent')
      })
      .on('swap.seeker.invoice.created', swap => {
        validate('bob', swap)
        expect(swap.secretHash).to.be.a('string').that.equals(secretHash)
        expect(swap.status).to.be.a('string').that.equals('seeker.invoice.created')
      })
      .on('swap.seeker.invoice.sent', swap => {
        validate('bob', swap)
        expect(swap.secretHash).to.be.a('string').that.equals(secretHash)
        expect(swap.status).to.be.a('string').that.equals('seeker.invoice.sent')
      })
      .on('swap.holder.invoice.paid', swap => {
        validate('bob', swap)
        expect(swap.secretHash).to.be.a('string').that.equals(secretHash)
        expect(swap.status).to.be.a('string').that.equals('seeker.invoice.created')
      })
      .on('swap.seeker.invoice.paid', swap => {
        validate('bob', swap)
        expect(swap.secretHash).to.be.a('string').that.equals(secretHash)
        expect(swap.status).to.be.a('string').that.equals('seeker.invoice.created')
      })
      .on('swap.holder.invoice.settled', swap => {
        validate('bob', swap)
        expect(swap.secretHash).to.be.a('string').that.equals(secretHash)
        expect(swap.status).to.be.a('string').that.equals('seeker.invoice.created')
      })
      .on('swap.seeker.invoice.settled', swap => {
        validate('bob', swap)
        expect(swap.secretHash).to.be.a('string').that.equals(secretHash)
        expect(swap.status).to.be.a('string').that.equals('seeker.invoice.created')
      })
      .on(...onSwap('bob', 'swap.completed'))
  })

  /**
   * Alice places an order using the secret hash. The test waits for the order
   * to be opened on the orderbook.
   */
  it('must allow Alice to place an order', function (done) {
    this.test.ctx.alice
      .once('order.created', order => {
        expect(order).to.be.an('object')
        expect(order.id).to.be.a('string')
        expect(order.ts).to.be.a('number')
        expect(order.uid).to.be.a('string').that.equals('alice')
        expect(order.type).to.be.a('string').that.equals('limit')
        expect(order.side).to.be.a('string').that.equals('ask')
        expect(order.baseAsset).to.be.a('string').that.equals('BTC')
        expect(order.baseQuantity).to.be.a('number').that.equals(10000)
        expect(order.baseNetwork).to.be.a('string').that.equals('lightning.btc')
        expect(order.quoteAsset).to.be.a('string').that.equals('ETH')
        expect(order.quoteQuantity).to.be.a('number').that.equals(100000)
        expect(order.quoteNetwork).to.be.a('string').that.equals('ethereum')
        expect(order.status).to.be.a('string').that.equals('created')
      })
      .once('order.opened', order => {
        expect(order).to.be.an('object')
        expect(order.id).to.be.a('string')
        expect(order.ts).to.be.a('number')
        expect(order.uid).to.be.a('string').that.equals('alice')
        expect(order.type).to.be.a('string').that.equals('limit')
        expect(order.side).to.be.a('string').that.equals('ask')
        expect(order.baseAsset).to.be.a('string').that.equals('BTC')
        expect(order.baseQuantity).to.be.a('number').that.equals(10000)
        expect(order.baseNetwork).to.be.a('string').that.equals('lightning.btc')
        expect(order.quoteAsset).to.be.a('string').that.equals('ETH')
        expect(order.quoteQuantity).to.be.a('number').that.equals(100000)
        expect(order.quoteNetwork).to.be.a('string').that.equals('ethereum')
        expect(order.status).to.be.a('string').that.equals('opened')

        done()
      })
      .once('order.closed', order => done(Error('order unexpected closed!')))
      .submitLimitOrder(Object.assign({}, ORDER_PROPS, { side: 'ask' }))
      .catch(done)
  })

  /**
   * Bob places the counter-order that would match with Alice's order, and waits
   * for the order to be opened on the orderbook.
   */
  it('must allow Bob to place an order', function (done) {
    this.test.ctx.bob
      .once('order.created', order => {
        expect(order).to.be.an('object')
        expect(order.id).to.be.a('string')
        expect(order.ts).to.be.a('number')
        expect(order.uid).to.be.a('string').that.equals('bob')
        expect(order.type).to.be.a('string').that.equals('limit')
        expect(order.side).to.be.a('string').that.equals('bid')
        expect(order.baseAsset).to.be.a('string').that.equals('BTC')
        expect(order.baseQuantity).to.be.a('number').that.equals(10000)
        expect(order.baseNetwork).to.be.a('string').that.equals('lightning.btc')
        expect(order.quoteAsset).to.be.a('string').that.equals('ETH')
        expect(order.quoteQuantity).to.be.a('number').that.equals(100000)
        expect(order.quoteNetwork).to.be.a('string').that.equals('ethereum')
        expect(order.status).to.be.a('string').that.equals('created')
      })
      .once('order.opened', order => {
        expect(order).to.be.an('object')
        expect(order.id).to.be.a('string')
        expect(order.ts).to.be.a('number')
        expect(order.uid).to.be.a('string').that.equals('bob')
        expect(order.type).to.be.a('string').that.equals('limit')
        expect(order.side).to.be.a('string').that.equals('bid')
        expect(order.baseAsset).to.be.a('string').that.equals('BTC')
        expect(order.baseQuantity).to.be.a('number').that.equals(10000)
        expect(order.baseNetwork).to.be.a('string').that.equals('lightning.btc')
        expect(order.quoteAsset).to.be.a('string').that.equals('ETH')
        expect(order.quoteQuantity).to.be.a('number').that.equals(100000)
        expect(order.quoteNetwork).to.be.a('string').that.equals('ethereum')
        expect(order.status).to.be.a('string').that.equals('opened')

        done()
      })
      .once('order.closed', order => done(Error('order unexpected closed!')))
      .submitLimitOrder(Object.assign({}, ORDER_PROPS, { side: 'bid' }))
      .catch(done)
  })

  it('must complete the atomic swap', function (done) {

  })
})
