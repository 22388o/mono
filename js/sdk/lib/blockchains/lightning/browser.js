/**
 * @file Interface to the Lightning network
 */

import { BaseClass } from '@portaldefi/core'
import LNC from '@lightninglabs/lnc-web';

/**
 * Holds private fields for instances of the class
 * @type {WeakMap}
 */
const INSTANCES = new WeakMap()

/**
 * Interface to the Lightning network
 * @type {Lightning}
 */
class Lightning extends BaseClass {
  constructor (sdk, props) {
    super({ id: 'lightning' })

    const pairingPhrase = props.phrase;
    const password = props.password;
    
    const lnc = new LNC({})
    lnc.credentials.pairingPhrase = pairingPhrase;

    const { lightning } = lnc.lnd;


    INSTANCES.set(this, Object.seal({
      pairingPhrase,
      password,
      lnc,
      lightning,


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
  async connect () {
    try {
      const state = INSTANCES.get(this)

      // TODO: set credentials
        // const { socket, cert, macaroons, grpcs } = state

      const { lnc, password } = state


      // TODO: Initialize connection
      //lnd.lightning.connectPeer({ addr: '03aa49c1e98ff4f216d886c09da9961c516aca22812c108af1b187896ded89807e@m3keajflswtfq3bw4kzvxtbru7r4z4cp5stlreppdllhp5a7vuvjzqyd.onion:9735' });
      await lnc.connect();
      lnc.credentials.password = password;

      // TODO: alternative to grpc?

      // TODO: get wallet information
        // const { getWalletInfo, getWalletStatus } = ln

      // TODO: get is active / is ready state
        // /* eslint-disable camelcase */
        // const { is_active, is_ready } = await getWalletStatus(grpcs.default)
        // if (!is_active || !is_ready) {
        //   return is_active
        //     ? Promise.reject(Error('wallet is not active!'))
        //     : Promise.reject(Error('wallet is not ready!'))
        // }
        // state.wallet = await getWalletInfo(grpcs.admin)
        // state.json.publicKey = state.wallet.public_key
        // /* eslint-enable camelcase */



      this.emit('connect', this)
      return this
    } catch (err) {
      /* eslint-disable-next-line no-ex-assign */
      err = err.length === 3
        ? Error(err[2].err.details)
        : Error(err[1])
      this.error('connect', err, this)
      throw err
    }
  }

  /**
   * Creates a HODL Invoice
   * @param {Party} party The party that will pay the invoice
   * @param {Number} party.quantity The number of tokens to be invoiced
   * @param {Swap} party.swap The parent swap of the party
   * @param {String} party.swap.secretHash The hash of the secret of the swap
   * @returns {Promise<String>} The BOLT-11 Payment Request
   */
  async createInvoice (party) {
    try {

      // TODO: set createHodl and subscribeTo invoice functions
        // const { createHodlInvoice, subscribeToInvoice } = ln

      // TODO set lnd from current lightning instance
        // const { lnd } = INSTANCES.get(this).grpcs.invoice


      // TODO: create a HODL invoice
        // const { swap, quantity: tokens } = party
        // const { id: description, secretHash: id } = swap
        // const invoice = await createHodlInvoice({ lnd, id, description, tokens })
        // this.info('createInvoice', invoice, this)

      const { lightning } = INSTANCES.get(this)
      const { swap, quantity: tokens } = party
      const { id: description, secretHash: id } = swap
      const { toHex } = web3.utils

      const invoice = await lightning.addInvoice({
        rPreImage: toHex(id),
        value: party.quantity,
        memo: description
      })
      this.info('createInvoice', invoice, this)

      // TODO subscribe to updates on the HODL invoice
        // const subscription = subscribeToInvoice({ lnd, id })
      const subscription = await lightning.subscribeInvoices({ addIndex: invoice.addIndex })

      // TODO onInvoiceUpdated function
        /*const onInvoiceUpdated = invoice => {
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
        subscription.on('invoice_updated', onInvoiceUpdated)*/

      // notify the creation of a new invoice
      this.emit('createInvoice', invoice)

      return { id, description, request: invoice.paymentRequest }
    } catch (err) {
      /* eslint-disable-next-line no-ex-assign */
      err = err.length === 3
        ? Error(err[2].err.details)
        : Error(err[1])
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
  async payInvoice (party) {
    try {
      // TODO: set decode & payVia paymentRequest functions
      // const { decodePaymentRequest, payViaPaymentRequest } = ln
      // const { lnd } = INSTANCES.get(this).grpcs.admin


      
      const { lightning } = INSTANCES.get(this)

      // decode the invoice
      const { invoice: { request } } = party
      // const paymentRequest = await decodePaymentRequest({ lnd, request })
      const paymentRequest = await lightning.decodePayReq(request)

      // validate the invoice
      // if (paymentRequest.id !== party.swap.secretHash) {
      //   const expected = party.swap.secretHash
      //   const actual = paymentRequest.id
      //   throw Error(`expected swap hash "${expected}"; got "${actual}"`)
      // } else if (paymentRequest.memo !== party.swap.id) {
      //   const expected = party.swap.id
      //   const actual = paymentRequest.memo
      //   throw Error(`expected swap identifier "${expected}"; got "${actual}"`)
      if (paymentRequest.numSatoshis !== party.quantity) {
        const expected = party.quantity
        const actual = paymentRequest.numSatoshis
        throw Error(`expected swap quantity "${expected}"; got "${actual}"`)
      }

      // pay the invoice
      // const receipt = await payViaPaymentRequest({ lnd, request })
      await lightning.sendPayment({ paymentHash: invoice.paymentHash }, (receipt) => {
        this.info('payInvoice', receipt, party, this)
      })
      // TODO: Ensure this appears in the logs

      // return the payment receipt
      /* eslint-disable camelcase */
      // const { id, expires_at, payment } = receipt
      // return { id, expires_at, payment }
      return { }
      /* eslint-enable camelcase */
    } catch (err) {
      /* eslint-disable-next-line no-ex-assign */
      err = err.length === 3
        ? Error(err[2].err.details)
        : Error(err[1])
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
  async settleInvoice (party, secret) {
    try {
      // TODO: set settleHodlInvoice function
        // const { settleHodlInvoice } = ln

      // TODO: set lnd 
        // const { lnd } = INSTANCES.get(this).grpcs.invoice

      // settle the invoice
      const receipt = await settleHodlInvoice({ lnd, secret })
      this.info('settleInvoice', receipt, party, this)
      return receipt
    } catch (err) {
      /* eslint-disable-next-line no-ex-assign */
      err = err.length === 3
        ? Error(err[2].err.details)
        : Error(err[1])
      this.error('settleInvoice', err, party, this)
      throw err
    }
  }

  /**
   * Gracefully disconnects from the network
   * @returns {Promise<Lightning>}
   */
  async disconnect () {
    try {
      const { lnc } = INSTANCES.get(this)
      lnc.disconnect()

      this.emit('disconnect', this)
      return this
    } catch (err) {
      /* eslint-disable-next-line no-ex-assign */
      err = err.length === 3
        ? Error(err[2].err.details)
        : Error(err[1])
      this.error('disconnect', err, this)
      throw err
    }
  }
}
export { Lightning };