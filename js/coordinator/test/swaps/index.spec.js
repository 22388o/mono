/**
 * @file Behavioral specification for the Swaps module
 */

const Dex = require('../../lib/dex')
const Swaps = require('../../lib/swaps')
const Swap = require('../../lib/swaps/swap')

describe('Swaps', function () {
  const PROPS = { dex: new Dex({}), store: {} }
  
  describe('instantiation', function () {
    it('must instantiate correctly with required arguments', function () {
      let swaps = null
      expect(() => { swaps = new Swaps(PROPS) }).to.not.throw()
      expect(swaps).to.be.an.instanceof(Swaps)
      expect(swaps).to.respondTo('fromOrders')
      expect(swaps).to.respondTo('onSwap')
    })
  })

  describe('operation', function () {
    let swaps = null

    const maker = {
      id: '7e14bdebd4d046258b4d88cc36acf856',
      baseAsset: 'BTC',
      baseNetwork: 'lightning',
      baseQuantity: 10000,
      quoteAsset: 'ETH',
      quoteNetwork: 'ethereum',
      quoteQuantity: 100000,
      side: 'ask',
      uid: 'alice'
    }
    const taker = {
      id: 'c742cf81b79f463b8595449510fbfe1d',
      baseAsset: 'BTC',
      baseNetwork: 'lightning',
      baseQuantity: 10000,
      quoteAsset: 'ETH',
      quoteNetwork: 'ethereum',
      quoteQuantity: 100000,
      side: 'bid',
      uid: 'bob'
    }

    before(function () {
      swaps = new Swaps(PROPS)
    })

    after(function () {
      swaps = null
    })

    it('must generate a swap from a pair of orders', async function () {
      const swap = await swaps.fromOrders(maker, taker)

      expect(swap).to.be.an.instanceof(Swap)
      expect(swap.id).to.be.a('string').with.lengthOf(64)
      expect(swap.status).to.be.a('string').that.equals('received')
      /* eslint-disable-next-line no-unused-expressions */
      expect(swap.secretHash).to.be.undefined
      expect(swap.secretHolder).to.be.an('object')
      expect(swap.secretHolder.id).to.be.a('string').that.equals(maker.uid)
      expect(swap.secretHolder.oid).to.be.a('string').that.equals(maker.id)
      expect(swap.secretHolder.asset).to.be.a('string').that.equals(maker.quoteAsset)
      expect(swap.secretHolder.quantity).to.be.a('number').that.equals(maker.quoteQuantity)
      expect(swap.secretHolder.blockchain).to.be.a('string').that.equals(maker.quoteNetwork)
      expect(swap.secretSeeker).to.be.an('object')
      expect(swap.secretSeeker.id).to.be.a('string').that.equals(taker.uid)
      expect(swap.secretSeeker.oid).to.be.a('string').that.equals(taker.id)
      expect(swap.secretSeeker.asset).to.be.a('string').that.equals(taker.quoteAsset)
      expect(swap.secretSeeker.quantity).to.be.a('number').that.equals(taker.quoteQuantity)
      expect(swap.secretSeeker.blockchain).to.be.a('string').that.equals(taker.quoteNetwork)
    })
  })
})
