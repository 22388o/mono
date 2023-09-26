/**
 * @file Interface to the lnd network
 */

const { BaseClass, Invoice } = require('@portaldefi/core')
const ln = require('lightning')

module.exports = class Lnd extends BaseClass {
  constructor (blockchains, props) {
    super()

    this.blockchains = blockchains
    this.props = props

    Object.seal(this)
  }

  /**
   * Initializes the bitcoind network connections
   * @returns {Promise<Bitcoind>}
   */
  connect () {
    return Promise.resolve(this)
  }

  /**
   * Creates a HODL Invoice
   * @param {Swap} swap The swap for which the invoice is being created
   * @returns {Promise} [description]
   */
  async createInvoice (swap) {
    const grpc = ln.authenticatedLndGrpc({
      cert: this.opts.lightning.cert,
      macaroon: this.opts.lightning.invoice,
      socket: this.opts.lightning.socket
    })
    const lnArgs = Object.assign(grpc, {
      id: swap.secretHash,
      tokens: swap['lightning'].quantity
    })
    const hodlInvoice = await ln.createHodlInvoice(lnArgs)
    return Invoice.fromHodlInvoice(hodlInvoice)
  }

  /**
   * Gracefully disconnects from the bitcoind network
   * @returns {Promise<Bitcoind>}
   */
  disconnect () {
    return Promise.resolve(this)
  }
}
