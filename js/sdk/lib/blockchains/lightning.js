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

    INSTANCES.set(this, Object.seal({
      socket: props.socket,
      cert: props.cert,
      macaroons: {
        admin: props.admin,
        invoice: props.invoice
      },
      grpcs: {
        default: null,
        admin: null,
        invoice: null
      },
      wallet: null,
      json: {
        socket: props.socket,
        publicKey: null,
        cert: `${props.cert.substr(0, 6)}******`,
        admin: `${props.admin.substr(0, 6)}******`,
        invoice: `${props.invoice.substr(0, 6)}******`
      }
    }))

    Object.freeze(this)
  }

  /**
   * Returns the JSON representation of the swap
   * @returns {Object}
   */
  toJSON () {
    return Object.assign(super.toJSON(), INSTANCES.get(this).json)
  }

  /**
   * Initializes the network connections
   * @returns {Promise<Lightning>}
   */
  async connect() {
    try {
      const state = INSTANCES.get(this)
      const { socket, cert, macaroons, grpcs } = state

      // initialize the GRPC connections
      const { authenticatedLndGrpc, unauthenticatedLndGrpc } = ln
      grpcs.default = unauthenticatedLndGrpc({ socket, cert })
      for (const name in macaroons) {
        const macaroon = macaroons[name]
        grpcs[name] = authenticatedLndGrpc({ socket, cert, macaroon })
      }

      // get the wallet information
      const { getWalletInfo, getWalletStatus } = ln
      const { is_active, is_ready } = await getWalletStatus(grpcs.default)
      if (!is_active || !is_ready) {
        return is_active
          ? Promise.reject(Error('wallet is not active!'))
          : Promise.reject(Error('wallet is not ready!'))
      }
      state.wallet = await getWalletInfo(grpcs.admin)
      state.json.publicKey = state.wallet.public_key

      this.emit('connect', this)
      return this
    } catch (err) {
      err = Error(err[2].err.details)
      this.error('connect', err, this)
      throw err
    }
  }

  /**
   * Creates a HODL Invoice
   * @param {Party} party The party that is creating the invoice
   * @param {Number} party.quantity The number of tokens to be invoiced
   * @param {Swap} party.swap The parent swap of the party
   * @param {String} party.swap.secretHash The hash of the secret of the swap
   * @returns {Promise<String>} The BOLT-11 Payment Request
   */
  async createInvoice(party) {
    try {
      const { createHodlInvoice, subscribeToInvoice } = ln
      const { lnd } = INSTANCES.get(this).grpcs.invoice

      // create a HODL invoice
      const { swap, quantity: tokens } = party
      const { id: description, secretHash: id } = swap
      const invoice = await createHodlInvoice({ lnd, id, description, tokens })
      this.info('createInvoice', invoice, this)

      // subscribe to updates on the HODL invoice
      const subscription = subscribeToInvoice({ lnd, id })
      const onInvoiceUpdated = invoice => {
        if (invoice.is_held) {
          this.info('invoice.paid', invoice, party, this)
          this.emit('invoice.paid', invoice, party, this)
        } else if (invoice.is_confirmed) {
          subscription.off('invoice_updated', onInvoiceUpdated)
          this.info('invoice.settled', invoice, party, this)
          this.emit('invoice.settled', invoice, party, this)
        } else if (invoice.is_cancelled) {
          subscription.off('invoice_updated', onInvoiceUpdated)
          this.info('invoice.cancelled', invoice, party, this)
          this.emit('invoice.cancelled', invoice, party, this)
        }
      }
      subscription.on('invoice_updated', onInvoiceUpdated)

      // notify the creation of a new invoice
      this.emit('invoice.created', invoice)

      // return the BOLT-11 payment request string
      return invoice.request
    } catch (err) {
      err = Error(err[2].err.details)
      this.error('createInvoice', err, party, this)
      throw err
    }
  }

  /**
   * Pays a HODL Invoice
   * @param {Party} party The party that is paying the invoice
   * @param {Number} party.invoice The invoice to be paid
   * @returns {Promise<Void>}
   */
  async payInvoice(party) {
    try {
      const { decodePaymentRequest, payViaPaymentRequest } = ln
      const { lnd } = INSTANCES.get(this).grpcs.admin

      // decode the invoice
      const { invoice: request } = party
      const paymentRequest = await decodePaymentRequest({ lnd, request })

      // validate the invoice
      if (paymentRequest.id !== party.swap.secretHash) {
        const expected = party.swap.secretHash
        const actual = paymentRequest.id
        throw Error(`expected swap hash "${expected}"; got "${actual}"`)
      }

      // pay the invoice
      const payment = await payViaPaymentRequest({ lnd, request })
      return payment
    } catch (err) {
      err = Error(err[2].err.details)
      this.error('payInvoice', err, party, this)
      throw err
    }
  }

  /**
   * Settles the HODL invoice
   * @param {Party} party The party that is settling the invoice
   * @param {Number} party.invoice The invoice to be settled
   * @param {String} secret The secret to be revealed during settlement
   * @returns {Promise<Void>}
   */
  async settleInvoice(party, secret) {
    try {
      const { settleHodlInvoice } = ln
      const { lnd } = INSTANCES.get(this).grpcs.invoice

      // settle the invoice
      await settleHodlInvoice({ lnd, secret })
    } catch (err) {
      err = Error(err[2].err.details)
      this.error('settleInvoice', err, party, this)
      throw err
    }
  }

  /**
   * Gracefully disconnects from the network
   * @returns {Promise<Lightning>}
   */
  async disconnect() {
    try {
      this.emit('disconnect', this)
      return this
    } catch (err) {
      err = Error(err[2].err.details)
      this.error('disconnect', err, this)
      throw err
    }
  }
}
