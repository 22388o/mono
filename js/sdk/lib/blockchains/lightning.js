/**
 * @file Interface to the Lightning network
 */

const { BaseClass, Invoice } = require('@portaldefi/core')
const ln = require('lightning')

/**
 * Holds private fields for instances of the class
 * @type {WeakMap}
 */
const INSTANCES = new WeakMap()

/**
 * Interface to the Lightning network
 * @type {Lightning}
 */
module.exports = class Lightning extends BaseClass {
  constructor (sdk, props) {
    super({ id: 'lightning' })

    INSTANCES.set(this, {
      socket: props.socket,
      cert: props.cert,
      admin: props.admin,
      invoice: props.invoice
    })

    Object.freeze(this)
  }

  /**
   * Returns the JSON representation of the swap
   * @returns {Object}
   */
  toJSON () {
    const { socket, cert, admin, invoice } = INSTANCES.get(this)
    return Object.assign(super.toJSON(), {
      socket,
      cert: `${cert.substr(0, 6)}***...***`,
      admin: `${admin.substr(0, 6)}***...***`,
      invoice: `${invoice.substr(0, 6)}***...***`
    })
  }

  /**
   * Initializes the network connections
   * @returns {Promise<Lightning>}
   */
  connect () {
    return Promise.resolve(this)
  }

  /**
   * Creates a HODL Invoice
   * @param {Object} args Arguments for the operation
   * @returns {Promise<String>} The BOLT-11 Payment Request
   */
  async createInvoice (args) {
    try {
      const { id, secretHash, asset, quantity } = args
      const { socket, cert, invoice: macaroon } = INSTANCES.get(this)
      const grpc = ln.authenticatedLndGrpc({ socket, cert, macaroon })
      const lnArgs = Object.assign(grpc, { id: secretHash, tokens: quantity })

      const invoice = await ln.createHodlInvoice(lnArgs)
      this.info('createInvoice', invoice, this)

      return invoice.request
    } catch (err) {
      this.error('createInvoice', args, this, err)
      throw err
    }
  }

  /**
   * Gracefully disconnects from the network
   * @returns {Promise<Lightning>}
   */
  disconnect () {
    return Promise.resolve(this)
  }
}
