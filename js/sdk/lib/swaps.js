/**
 * @file An interface to all swaps
 */

const { BaseClass, Swap, Util } = require('@portaldefi/core')

/**
 * Expose the interface to all swaps
 * @type {Swaps}
 */
module.exports = class Swaps extends BaseClass {
  constructor (sdk, props) {
    super()

    this.sdk = sdk

    // Wire up swap events
    this.sdk.network
      .on('swap.created', (...args) => this._onEvent('created', ...args))
      .on('swap.opening', (...args) => this._onEvent('opening', ...args))
      .on('swap.opened', (...args) => this._onEvent('opened', ...args))
      .on('swap.committing', (...args) => this._onEvent('committing', ...args))
      .on('swap.committed', (...args) => this._onEvent('committed', ...args))
      .on('swap.aborting', (...args) => this._onEvent('aborting', ...args))
      .on('swap.aborted', (...args) => this._onEvent('aborted', ...args))

    Object.seal(this)
  }

  /**
   * Synchronizes the swaps with the store
   * @returns {Promise<Swaps>}
   */
  sync () {
    // TODO: Fix this to load from the store on startup
    // TODO: Fix this to write to the store on shutdown
    return Promise.resolve(this)
  }

  /**
   * Handles incoming swap events
   * @param {String} event The name of the event
   * @param {Object} obj The JSON object representing the swap
   * @returns {Void}
   */
  _onEvent (event, obj) {
    let swap = null

    // Ensure the swap is valid and relevant to this peer
    try {
      swap = Swap.fromJSON(obj)
      if (!swap.isParty(this.sdk)) return
    } catch (err) {
      this.error('swap.error', err, obj)
      this.emit('error', err, obj)
      return
    }

    // Handle the swap event
    try {
      const handler = `_on${event[0].toUpperCase()}${event.slice(1)}`
      if (typeof this[handler] !== 'function') {
        throw Error(`unknown event "${event}"!`)
      }
      this[handler](swap)
    } catch (err) {
      this.error('swap.error', err, swap)
      this.emit('error', err, swap)
    }
  }

  /**
   * Handles the creation of a new swap
   * 
   * Upon creation, the exchange-designated secret-holder generates the secret
   * and its hash, creates an invoice for the counter-party, and sends the
   * details to the counterparty.
   * 
   * The exchange-designated secret-seeker, simply stores the swap in the store
   * and waits for the secret-holder to send the secret-hash and invoice.
   * 
   * @param {Swap} swap The newly created swap
   * @returns 
   */
  async _onCreated(swap) {
    const { blockchains, network } = this.sdk
    const { secretHolder, secretSeeker } = swap

    // The secret-seeker waits for the secret-holder to deliver an invoice
    if (secretSeeker.id === this.sdk.id) return

    // For the secret-holder, start by generating a secret for the swap
    const secret = Util.random()
    swap.secretHash = Util.hash(secret) // NOTE: SWAP STATE MUTATION!
    console.log('here we are', secret.toString('hex'), swap.secretHash)
    this.info('swap.created', swap)

    // generate an invoice to send to the secret-seeker, and watch for when the
    // secret-seeker pays the invoice, so it can be settled immediately.
    const ethereum = blockchains[secretSeeker.blockchain.split('.')[0]]
    const invoice = secretSeeker.invoice = await ethereum.createInvoice(secretSeeker)
    ethereum.once('invoice.paid', async (...args) => {
      console.log(this.sdk.id, '(holder) notified of', ethereum.id, 'invoice being paid.', ...args)
      // this.info('invoice.settling', invoice, swap, ethereum, this)
      console.log(this.sdk.id, '(holder) settling', ethereum.id, 'invoice using secret', secret, '...')
      await ethereum
        .once('invoice.settled', (...args) => {
          console.log(this.sdk.id, '(holder) settled', ethereum.id, 'invoice using secret', secret)
        })
        .settleInvoice(secretHolder, secret)
      // this.info('invoice.settled', invoice, swap, ethereum, this)
    })
    console.log(this.sdk.id, '(holder) created invoice on', ethereum.id, invoice)

    // Notify the secret-seeker
    const args = { method: 'PUT', path: '/api/v1/swap' }
    try {
      this.info('swap.notifyCounterParty', args, swap)
      await network.request(args, { swap })
    } catch (err) {
      this.error('swap.notifyCounterParty', err, args, swap)
      setTimeout(notifyCounterParty, 1000, args) // FIXME: Hardcoded value
    }
  }

  /**
   * Handles the opening of a swap
   * 
   * Once a secret-holder notifies the secret-seeker of the secret-hash, the
   * secret-seeker creates an invoice and sends it over to the secret holder.
   * 
   * @param {Swap} swap The swap that is opening
   * @returns {Void}
   */
  async _onOpening (swap) {
    const { blockchains, network } = this.sdk
    const { secretHolder, secretSeeker } = swap
    const lightning = blockchains[secretHolder.blockchain.split('.')[0]]
    const ethereum = blockchains[secretSeeker.blockchain.split('.')[0]]
    this.info('swap.opening', swap)

    // The secret-holder waits for the secret-seeker to deliver an invoice
    if (secretHolder.id === this.sdk.id) return

    // generate an invoice to send to the secret-holder, and watch for when the
    // secret-holder pays the invoice, so the secret-holder's invoice can be
    // paid. Finally, when the secret-holder settles the invoice, use the
    // secret to settle our own invoice.
    const seekerInvoice = secretHolder.invoice = await lightning.createInvoice(secretHolder)
    console.log(this.sdk.id, 'created invoice on', lightning.id, seekerInvoice)

    lightning.once('invoice.paid', async (...args) => {
      console.log(this.sdk.id, '(seeker) notified of', lightning.id, 'invoice being paid.', ...args)
      console.log(this.sdk.id, ' (seeker) paying', ethereum.id, 'invoice...')
      await ethereum.payInvoice(secretSeeker)
      console.log(this.sdk.id, '(seeker) paid', ethereum.id, 'invoice')
    })

    ethereum.once('invoice.settled', async args => {
      console.log(this.sdk.id, '(seeker) noticed settlement of', ethereum.id, 'invoice...', args)
      console.log(this.sdk.id, '(seeker) settling', lightning.id, 'invoice using secret "', args.swap.secret, '"...')
      await lightning.settleInvoice(secretHolder, args.swap.secret)
      console.log(this.sdk.id, '(seeker) settled', lightning.id, 'invoice')
    })

    // Notify the secret-holder
    const args = { method: 'PUT', path: '/api/v1/swap' }
      try {
        this.info('swap.notifyCounterParty', args, swap)
        await network.request(args, { swap })
      } catch (err) {
        this.error('swap.notifyCounterParty', err, args, swap)
        setTimeout(notifyCounterParty, 1000, args) // FIXME: Hardcoded value
      }
  }

  /**
   * Handles a swap once it is opened from both sides
   * 
   * At this step, the secret-holder must pay the secret-seeker's invoice and
   * lock funds in the network.
   * 
   * @param {Swap} swap 
   * @returns 
   */
  async _onOpened(swap) {
    const { blockchains } = this.sdk
    const { secretHolder, secretSeeker } = swap

    // The secret-seeker waits for the secret-holder to pay the invoice
    if (secretSeeker.id === this.sdk.id) return
    this.info('swap.opened', swap)

    // handle the payment of the invoice sent previously
    const lightning = blockchains[secretHolder.blockchain.split('.')[0]]
    console.log(this.sdk.id, 'paying', lightning.id, 'invoice...')
    await lightning.payInvoice(secretHolder)
    console.log(this.sdk.id, 'paid', lightning.id, 'invoice')
  }

  /**
   * Handles a swap that is committing
   * @param {Swap} swap The swap that is committing
   * @returns {Void}
   */
  async _onCommitting(swap) {
    try {
      // Secret holder goes next
      if (swap.secretHolder.id !== this.sdk.id) return

      // handle the payment of the invoice sent previously
      const { secretHolder } = swap
      const { blockchain: blockchainName } = secretHolder
      const blockchain = this.sdk.blockchains[blockchainName.split('.')[0]]

      await blockchain.payInvoice(secretHolder)
    } catch (err) {
      this.error('swap.error', err, swap)
      this.emit('error', err, swap)
    }
  }

  /**
   * Handles a swap that was committed
   * @param {Swap} swap The swap that was committed
   * @returns {Void}
   */
  _onCommitted (swap) {
    console.log('committed', swap)
  }

  /**
   * Handles a swap that is aborting
   * @param {Swap} swap The swap that is aborting
   * @returns {Void}
   */
  _onAborting (obj) {
    throw Error('not implemented')
  }

  /**
   * Handles a swap that was aborted
   * @param {Swap} swap The swap that was aborted
   * @returns {Void}
   */
  _onAborted (obj) {
    throw Error('not implemented')
  }
}
