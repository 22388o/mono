/**
 * @file Behavioral specification for an EVM/Lightning atomic swap
 */

const { createHash, randomBytes } = require('crypto')

/**
 * This is a simple test case wherein
 */
describe('Swaps - Lightning/Ethereum', function () {
  const SECRET = randomBytes(32)
  const SECRET_HASH = createHash('sha256').update(SECRET).digest('hex')
  const ORDER_PROPS = {
    baseAsset: 'BTC',
    baseNetwork: 'lightning.btc',
    baseQuantity: 10000,
    quoteAsset: 'ETH',
    quoteNetwork: 'ethereum',
    quoteQuantity: 100000
  }

  before('test setup', function () {
    const onSwap = (user, event) => [event, swap => console.log(`${user}.${event}`, swap.status)]
    this.test.ctx.alice
      .on(...onSwap('alice', 'swap.received'))
      .on(...onSwap('alice', 'swap.created'))
      .on(...onSwap('alice', 'swap.holder.invoice.created'))
      .on(...onSwap('alice', 'swap.holder.invoice.sent'))
      .on(...onSwap('alice', 'swap.seeker.invoice.created'))
      .on(...onSwap('alice', 'swap.seeker.invoice.sent'))
      .on(...onSwap('alice', 'swap.holder.invoice.paid'))
      .on(...onSwap('alice', 'swap.seeker.invoice.paid'))
      .on(...onSwap('alice', 'swap.holder.invoice.settled'))
      .on(...onSwap('alice', 'swap.seeker.invoice.settled'))
      .on(...onSwap('alice', 'swap.completed'))

    this.test.ctx.bob
      .on(...onSwap('bob', 'swap.received'))
      .on(...onSwap('bob', 'swap.created'))
      .on(...onSwap('bob', 'swap.holder.invoice.created'))
      .on(...onSwap('bob', 'swap.holder.invoice.sent'))
      .on(...onSwap('bob', 'swap.seeker.invoice.created'))
      .on(...onSwap('bob', 'swap.seeker.invoice.sent'))
      .on(...onSwap('bob', 'swap.holder.invoice.paid'))
      .on(...onSwap('bob', 'swap.seeker.invoice.paid'))
      .on(...onSwap('bob', 'swap.holder.invoice.settled'))
      .on(...onSwap('bob', 'swap.seeker.invoice.settled'))
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

  /**
   * Bob's order being opened on the orderbook triggers the creation of a swap
   * based on the two orders to be matched. The swap is sent down the open
   * updates channel for the two parties. This test verifies that the swap is
   * received by both alice and bob, and that the fields are as expected, esp.
   * the secret hash.
   */
  it('must handle the swap between to Alice and Bob', function (done) {
    const { alice, bob } = this.test.ctx
    const swaps = {
      alice: {
        created: null,
        opening: null,
        opened: null,
        committing: null,
        committed: null
      },
      bob: {
        created: null,
        opening: null,
        opened: null,
        committing: null,
        committed: null
      }
    }

    /* eslint-disable-next-line no-unused-vars */
    function validate (swap, user, status) {
      console.log('validating', status, 'swap for', user, swap)

      expect(swap.id).to.be.a('string').with.lengthOf(64)
      expect(swap.secretHash).to.be.a('string').that.equals(SECRET_HASH)
      expect(swap.secretHolder).to.be.an('object')
      expect(swap.secretHolder.id).to.be.a('string').that.equals(alice.id)
      expect(swap.secretSeeker).to.be.an('object')
      expect(swap.secretSeeker.id).to.be.a('string').that.equals(bob.id)
      expect(swap.status).to.be.a('string').that.equals(status)

      swaps[user][status] = swap

      if (swaps.alice[status] == null || swaps.bob[status] == null) return

      expect(swaps.alice[status]).to.deep.equal(swaps.bob[status])

      switch (status) {
        case 'created': {
          const aliceHolderInvoice = swaps.alice[status].secretHolder.invoice
          const bobHolderInvoice = swaps.bob[status].secretHolder.invoice
          expect(aliceHolderInvoice).to.be.a('string')
          expect(bobHolderInvoice).to.be.a('string')
          expect(aliceHolderInvoice).to.equal(bobHolderInvoice)

          const aliceSeekerInvoice = swaps.alice[status].secretSeeker.invoice
          const bobSeekerInvoice = swaps.bob[status].secretSeeker.invoice
          expect(aliceSeekerInvoice).to.be.equal(null)
          expect(bobSeekerInvoice).to.be.equal(null)
          break
        }

        case 'opening': {
          const aliceHolderInvoice = swaps.alice[status].secretHolder.invoice
          const bobHolderInvoice = swaps.bob[status].secretHolder.invoice
          expect(aliceHolderInvoice).to.be.a('string')
          expect(bobHolderInvoice).to.be.a('string')
          expect(aliceHolderInvoice).to.equal(bobHolderInvoice)

          const aliceSeekerInvoice = swaps.alice[status].secretSeeker.invoice
          const bobSeekerInvoice = swaps.bob[status].secretSeeker.invoice
          expect(aliceSeekerInvoice).to.equal(null)
          expect(bobSeekerInvoice).to.equal(null)
          expect(aliceSeekerInvoice).to.equal(bobSeekerInvoice)
          break
        }

        case 'opened': break
        case 'committing': break
        case 'committed': break
        default: break
      }
    }
  })
})
