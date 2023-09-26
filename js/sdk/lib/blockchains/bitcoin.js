/**
 * @file Interface to the bitcoind network
 */

const { BaseClass } = require('@portaldefi/core')

module.exports = class Bitcoind extends BaseClass {
  constructor (blockchains) {
    super()

    this.blockchains = blockchains

    Object.seal(this)
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
