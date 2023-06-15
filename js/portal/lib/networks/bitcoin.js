/**
 * @file The Bitcoin network
 */

const Network = require('../core/network')

/**
 * Exports an interface to the Bitcoin blockchain network
 * @type {Bitcoin}
 */
module.exports = class Bitcoin extends Network {
  constructor (props) {
    super({ name: props.name, assets: props.assets })
  }

  /**
   * Opens the swap on behalf of one of the parties
   *
   * This method creates a HodlInvoice for the calling party, and saves it into
   * counterparty's state-bag.
   *
   * For a SecretHolder, it sets up additional event-triggered machinery to pay
   * the SecretSeeker's invoice
   *
   * @param {Party} party The party that is opening the swap
   * @param {Object} opts Options for the operation
   * @param {Object} opts.lightning Arguments used to connect to LND
   * @param {String} opts.lightning.cert TLS certificate used to connect to LND
   * @param {String} opts.lightning.invoice The invoice macaroon used with LND
   * @param {String} opts.lightning.socket The URL to the LND daemon
   * @param {String} [opts.secret] The secret used by the SecretHolder
   * @returns {Promise<Party>}
   */
  async open (party, opts) {
    console.log('\nbtc.open', this, party, opts)
    return party
  }

  /**
   * Commits a swap on behalf of one of the parties
   *
   * The SecretSeeker listens for a payment from the SecretHolder against their
   * previously created invoice (in the .open() above), that moves the invoice
   * into the "held" state. This triggers payment of the SecretHolder's invoice
   * created by the SecretHolder (in their .open() call) on the network where
   * the SecretSeeker holds their funds.
   *
   * @param {Party} party The party that is committing the swap
   * @param {Object} opts Options for the operation
   * @param {Object} opts.lightning Arguments used to connect to LND
   * @param {String} opts.lightning.cert TLS certificate used to connect to LND
   * @param {String} opts.lightning.invoice The invoice macaroon used with LND
   * @param {String} opts.lightning.socket The URL to the LND daemon
   * @returns {Promise<Party>}
   */
  async commit (party, opts) {
    console.log('\nbtc.commit', this, party, opts)
    return party
  }
}
