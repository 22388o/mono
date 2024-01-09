/**
 * @file The interface to the decentralized exchange
 */

const { BaseClass, Util: { uuid } } = require('@portaldefi/core')

/**
 * The interface to the decentralized exchange
 * @type {Dex}
 */
module.exports = class Dex extends BaseClass {
  constructor (props) {
    if (props.network == null) {
      throw Error('expected props.network to be a valid network client!')
    } else if (props.store == null) {
      throw Error('expected props.store to be a valid store!')
    }

    super({ id: 'dex' })

    this.network = props.network
    this.store = props.store

    Object.freeze(this)
  }

  /**
   * Opens the orderbooks
   * @returns {Promise<Dex>}
   */
  open () {
    return Promise.resolve(this)
  }

  /**
   * Closes the orderbooks
   * @returns {Promise<Dex>}
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
    return this.network.request({
      method: 'PUT',
      path: '/api/v1/dex/limit'
    }, {
      id: uuid(),
      uid: this.network.uid,
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
    return this.network.request({
      method: 'DELETE',
      path: '/api/v1/dex/limit'
    }, {
      id: order.id,
      baseAsset: order.baseAsset,
      quoteAsset: order.quoteAsset
    })
  }
}
