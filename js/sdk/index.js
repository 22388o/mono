/**
 * @file The Portal SDK
 */

const Sdk = require('./lib')
const { IndexedDB } = require('./lib/store/browser');

/**
 * Export the class
 * @type {SDK}
 */
class SDK {
  constructor (props) {
    //super()

    /**
     * Client credentials for the blockchains
     * @type {Object}
     * @todo Refactor these out of the client altogether!
     */
    this.credentials = props.credentials

    /**
     * The Portal SDK instance
     * @type {Sdk}
     */
    this.sdk = new Sdk(props);
  }

  get id () {
    return this.sdk.network.id
  }

  get isConnected () {
    return this.sdk.network.isConnected
  }

  /**
   * Returns the JSON representation of the instance
   * @returns {Object}
   */
  toJSON () {
    const { network, store, blockchains, orderbooks, swaps } = this
    return { network, store, blockchains, orderbooks, swaps }
  }

  /**
   * Directly forwards to websocket on method in Network class
   * @param {string} eventName Event Name
   * @param {function} handler  handler function
   */
  on (eventName, handler) {
    this.sdk.network.on(eventName, handler);
  }

  /**
   * Directly forwards to websocket off method in Network class
   * @param {string} eventName Event Name
   * @param {function} handler  handler function
   */
  off (eventName, handler) {
    this.sdk.network.off(eventName, handler);
  }

  /**
   * Directly forwards to websocket removeAllListeners method in Network class
   */
  removeAllListeners () {
    this.sdk.network.removeAllListeners();
  }

  /**
   * Starts the Portal SDK.
   * @returns {Sdk}
   */
  start () {
    return this.sdk.start()
  }

  /**
   * Gracefully terminates the network connection.
   * @returns {Sdk}
   */
  stop () {
    return this.sdk.stop()
  }

  /**
   * Adds a limit order to the orderbook
   * @param {Object} order The limit order to add the orderbook
   */
  submitLimitOrder (order) {
    return this.sdk.network.request({
      method: 'PUT',
      path: '/api/v1/orderbook/limit'
    }, {
      side: order.side,
      hash: order.hash,
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

  /**
   * Create the required state for an atomic swap
   * @param {Swap|Object} swap The swap to open
   * @param {Object} opts Options for the operation
   * @returns {Swap}
   */
  swapOpen (swap, opts) {
    return this.sdk.network.request({
      method: 'PUT',
      path: '/api/v1/swap'
    }, { swap, opts })
  }

  /**
   * Completes the atomic swap
   * @param {Swap|Object} swap The swap to commit
   * @param {Object} opts Options for the operation
   * @returns {Promise<Void>}
   */
  swapCommit (swap, opts) {
    return this.sdk.network.request({
      method: 'POST',
      path: '/api/v1/swap'
    }, { swap, opts })
  }

  /**
   * Abort the atomic swap optimistically and returns funds to owners
   * @param {Swap|Object} swap The swap to abort
   * @param {Object} opts Options for the operation
   * @returns {Promise<Void>}
   */
  swapAbort (swap, opts) {
    return this.sdk.network.request({
      method: 'DELETE',
      path: '/api/v1/swap'
    }, { swap, opts })
  }

  request (...args) {
    return this.sdk.network.request(...args)
  }

  send (...args) {
    return this.sdk.network.send(...args)
  }
}
module.exports = {
  SDK, IndexedDB
}