/**
 * @file The Lightning network
 */

const Network = require('../core/network')
const ln = require('lightning')

/**
 * Exports an interface to the Lightning blockchain network
 * @type {Lightning}
 */
module.exports = class Lightning extends Network {
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
    console.log('\nlightning.open', this, party, opts)

    // Requests are made using the Invoice macaroon for both parties
    const grpc = ln.authenticatedLndGrpc({
      cert: opts.lightning.cert,
      macaroon: opts.lightning.invoice,
      socket: opts.lightning.socket
    })

    // Invoices are for the quantity of tokens specified by the counterparty
    const args = Object.assign(grpc, {
      id: party.swap.secretHash,
      tokens: party.counterparty.quantity
    })

    // Newly created invoices are saved into the Counterparty's state-bag
    try {
      const invoice = await ln.createHodlInvoice(args)
      party.counterparty.state[this.name] = { invoice }
    } catch (err) {
      // ln errors are arrays with 3 elements
      // 0: Numeric error code (HTTP status code)
      // 1: String error code
      // 2: JSON object with an `err` property
      throw Error(err[2].err.details)
    }

    if (party.isSecretSeeker) {
      // no-op
    } else if (party.isSecretHolder) {
      // For the SecretHolder, setup subscription(s) to auto-settle the invoice
      try {
        const subscription = await ln.subscribeToInvoice(args)
        subscription
          .on('invoice_updated', invoice => {
            if (invoice.is_held) {
              invoice.secret = opts.secret
              ln.settleHodlInvoice(opts)
            }
          })
      } catch (err) {
        // ln errors are arrays with 3 elements
        // 0: Numeric error code (HTTP status code)
        // 1: String error code
        // 2: JSON object with an `err` property
        throw Error(err[2].err.details)
      }
    } else {
      throw Error('multi-party swaps are not supported!')
    }

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
    console.log('\nlightning.commit', this, party, opts)

    if (party.isSecretSeeker) {
      // This request is made through the SecretSeeker's LND node
      const grpc = ln.authenticatedLndGrpc({
        cert: opts.lightning.cert,
        macaroon: opts.lightning.invoice,
        socket: opts.lightning.socket
      })
      const args = Object.assign(grpc, {
        id: party.counterparty.state[this.name].invoice.id
      })

      const subscription = await ln.subscribeToInvoice(args)
      subscription
        .on('invoice_updated', async invoice => {
          if (invoice.is_held) {
            const secretString = await party.network.commit(party, opts)
              .catch(err => console.log(`\n\n\n${this.name}.commit`, party, err))
            const secret = secretString.toString(16)
            console.log(`\n${this.name}.onInvoiceHeld`, party, secretString, secret)

            try {
              await ln.settleHodlInvoice(Object.assign({ secret: secret }, grpc))
            } catch (err) {
              console.log(`\n${this.name}.settleHodlInvoice`, party, err)
              // ln errors are arrays with 3 elements
              // 0: Numeric error code (HTTP status code)
              // 1: String error code
              // 2: JSON object with an `err` property
              throw Error(err[2].err.details)
            }
          }
        })
    } else if (party.isSecretHolder) {
      const grpc = ln.authenticatedLndGrpc({
        cert: opts.lightning.cert,
        macaroon: opts.lightning.admin,
        socket: opts.lightning.socket
      })
      const args = Object.assign(grpc, {
        request: party.state[party.network.name].invoice.request
      })

      // Validate the SecretSeeker's invoice
      let holderPaymentRequest

      try {
        holderPaymentRequest = await ln.decodePaymentRequest(args)
      } catch (err) {
        // ln errors are arrays with 3 elements
        // 0: Numeric error code (HTTP status code)
        // 1: String error code
        // 2: JSON object with an `err` property
        throw Error(err[2].err.details)
      }

      if (holderPaymentRequest.id !== party.swap.secretHash) {
        throw Error('unexpected swap hash!')
      }

      // Pay the SecretSeeker's invoice
      try {
        const holderPaymentConfirmation = await ln.payViaPaymentRequest(args)
        console.log('payment confirmation by', party.id, holderPaymentConfirmation)
      } catch (err) {
        // ln errors are arrays with 3 elements
        // 0: Numeric error code (HTTP status code)
        // 1: String error code
        // 2: JSON object with an `err` property
        throw Error(err[2].err.details)
      }
    } else {
      throw Error('multi-party swaps are not supported!')
    }

    return party
  }
}
