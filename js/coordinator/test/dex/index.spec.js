/**
 * @file Behavioral specification for the DEX
 */

const { Order } = require('@portaldefi/core')
const { expect } = require('chai')
const Dex = require('../../lib/dex')

describe('Dex', function () {
  /**
   * Tests instantiation behavior
   */
  describe('Instantiation', function () {
    it('must correctly instantiate with specified dex', function () {
      let dex = null

      expect(() => { dex = new Dex() }).to.not.throw()
      expect(dex).to.be.an.instanceof(Dex)
      /* eslint-disable-next-line no-unused-expressions */
      expect(dex).to.be.sealed
    })
  })

  /**
   * Regular operational behavior testing
   */
  describe('Operation', function () {
    const BASE_ORDER = {
      uid: 'uid',
      type: 'limit',
      baseAsset: 'BTC',
      baseNetwork: 'lightning',
      quoteAsset: 'ETH',
      quoteNetwork: 'ethereum'
    }

    let dex, order

    /**
     * Create a fresh dex instance at the start of the suite
     * @returns {Void}
     */
    before(function () { dex = new Dex() })

    /**
     * Destroy the dex instance at the end of the suite
     * @returns {Void}
     */
    after(function () { dex = null })

    /**
     * Tests the addition a new order to the appropriate orderbook
     *
     * Saves the created order in the closure to make available for the rest of
     * the test suite.
     *
     * @returns {Void}
     */
    it('must add a new order to the appropriate orderbook', function () {
      return dex
        .add(Object.assign({}, BASE_ORDER, {
          side: 'bid',
          hash: 'hash',
          baseQuantity: 1,
          quoteQuantity: 1000
        }))
        .then(o => {
          expect(o).to.be.an.instanceof(Order)
          order = o
        })
    })

    /**
     * Tests cancellation of an existing order from the appropriate orderbook
     * @returns {Void}
     */
    it('must cancel an order from the appropriate orderbook', function () {
      return dex
        .cancel({
          id: order.id,
          baseAsset: order.baseAsset,
          quoteAsset: order.quoteAsset
        })
        .then(o => {
          expect(o).to.deep.equal(order)
          order = null
        })
    })
  })
})
