/**
 * @file Specification for the Limit Orderbook
 */

describe('DEX - Limit orders', function () {
  describe('Add/delete limit order', function () {
    let order = null // tracks the order that is first added, and then deleted

    /**
     * Validate the order object
     * @param {Object} o The order object to be validated
     * @returns {Object} The validated order object
     */
    function validate (o) {
      expect(o).to.be.an('object')
      expect(o.id).to.be.a('string')
      expect(o.ts).to.be.a('number')
      expect(o.uid).to.be.a('string').that.equals('foo')
      expect(o.type).to.be.a('string').that.equals('limit')
      expect(o.side).to.be.a('string').that.equals('bid')
      expect(o.baseAsset).to.be.a('string').that.equals('BTC')
      expect(o.baseNetwork).to.be.a('string').that.equals('lightning')
      expect(o.baseQuantity).to.be.a('number').that.equals(1)
      expect(o.quoteAsset).to.be.a('string').that.equals('ETH')
      expect(o.quoteNetwork).to.be.a('string').that.equals('ethereum')
      expect(o.quoteQuantity).to.be.a('number').that.equals(10)
      return o
    }

    it('must add a new order to the orderbook', function () {
      const args = { method: 'PUT', path: '/api/v1/dex/limit' }
      const data = Object.freeze({
        side: 'bid',
        baseAsset: 'BTC',
        baseNetwork: 'lightning',
        baseQuantity: 1,
        quoteAsset: 'ETH',
        quoteNetwork: 'ethereum',
        quoteQuantity: 10
      })

      return this.test.ctx.request(args, data)
        .then(validate)
        .then(o => { order = o })
    })

    it('must remove an existing order from the orderbook', function () {
      const args = { method: 'DELETE', path: '/api/v1/dex/limit' }
      const data = {
        id: order.id,
        baseAsset: order.baseAsset,
        quoteAsset: order.quoteAsset
      }

      return this.test.ctx.request(args, data)
        .then(validate)
    })
  })
})
