/**
 * @file Interface to the Bitcoin network
 */

const { BaseClass } = require('@portaldefi/core')

module.exports = class Bitcoin extends BaseClass {
  constructor (blockchains) {
    super()

    this.blockchains = blockchains

    Object.seal(this)
  }

  /**
   * Returns the JSON representation of the swap
   * @returns {Object}
   */
  toJSON () {
    return Object.assign(super.toJSON(), { })
  }

  /**
   * Initializes the bitcoind network connections
   * @returns {Promise<Bitcoind>}
   */
  connect () {
    return Promise.resolve(this)
  }

  createInvoice (swap) {
    throw Error('not implemented')
  }

  /**
   * Gracefully disconnects from the bitcoind network
   * @returns {Promise<Bitcoind>}
   */
  disconnect () {
    return Promise.resolve(this)
  }
}
