/**
 * @file An interface to all orderbooks
 */

const { BaseClass, Util: { uuid } } = require('@portaldefi/core')

/**
 * Expose the interface to all orderbooks
 * @type {Orderbooks}
 */
module.exports = class Orderbooks extends BaseClass {
  constructor (sdk) {
    super()

    this.sdk = sdk
    // .on('order.created', (...args) => this.onOrderCreated(...args))
    // .on('order.opened', (...args) => this.onOrderOpened(...args))
    // .on('order.closed', (...args) => this.onOrderClosed(...args))
    // .on('order.match', (...args) => this.onOrderMatch(...args))
    // .on('order.error', (...args) => this.onOrderError(...args))

    Object.seal(this)
  }

  /**
   * Opens the orderbooks
   * @returns {Promise<Orderbooks>}
   */
  open () {
    return Promise.resolve(this)
  }

  /**
   * Closes the orderbooks
   * @returns {Promise<Orderbooks>}
   */
  close () {
    return Promise.resolve(this)
  }

  /**
   * Adds a limit order to the orderbook
   * @param {Object} order The limit order to add the orderbook
   * @returns {Promise<Object>}
   */
  submitLimitOrder (order) {
    return this.sdk.network.request({
      method: 'PUT',
      path: '/api/v1/orderbook/limit'
    }, {
      id: uuid(),
      uid: this.sdk.id,
      side: order.side,
      baseAsset: order.baseAsset,
      baseNetwork: order.baseNetwork,
      baseQuantity: order.baseQuantity,
      quoteAsset: order.quoteAsset,
      quoteNetwork: order.quoteNetwork,
      quoteQuantity: order.quoteQuantity
    })
  }

  /**
   * Adds a limit order to the orderbook
   * @param {Object} order The limit order to delete the orderbook
   * @returns {Promise<Object>}
   */
  cancelLimitOrder (order) {
    return this.sdk.network.request({
      method: 'DELETE',
      path: '/api/v1/orderbook/limit'
    }, {
      id: order.id,
      baseAsset: order.baseAsset,
      quoteAsset: order.quoteAsset
    })
  }
}
