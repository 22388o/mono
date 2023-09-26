/**
 * @file Interface to the ethereum network
 */

const { BaseClass } = require('@portaldefi/core')
const Web3 = require('web3')

/**
 * Export the Ethereum class
 * @type {Ethereum}
 */
module.exports = class Ethereum extends BaseClass {
  constructor (props) {
    super()

    this.id = 'geth'
    this.name = 'ethereum'

    Object.seal(this)
  }

  /**
   * Initializes the connection to the geth daemon
   * @returns {Promise<Ethereum>}
   */
  connect () {
    return Promise.resolve(this)
  }

  /**
   * Creates an invoice
   * @param {[type]} swap  [description]
   * @returns {[type]} [description]
   */
  createInvoice (swap) {
    throw Error('not implemented')
  }

  /**
   * Gracefully disconnects from the geth daemon
   * @returns {Promise<Ethereum>}
   */
  disconnect () {
    return Promise.resolve(this)
  }
}
