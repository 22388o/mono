/**
 * @file An interface to all swaps
 */

const { BaseClass, Swap } = require('@portaldefi/core')

/**
 * Expose the interface to all swaps
 * @type {Swaps}
 */
module.exports = class Swaps extends BaseClass {
  constructor (sdk, props) {
    super()

    // Wire up swap events
    this.sdk = sdk
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
    try {
      const swap = Swap.fromJSON(obj)
      const handler = `_on${event[0].toUpperCase()}${event.slice(1)}`
      if (typeof this[handler] !== 'function') {
        throw Error(`unknown event "${event}"!`)
      }

      this.debug(`swap.${event}`, swap)
      this[handler](swap)
    } catch (err) {
      this.error('swap.error', err, swap)
      this.emit('error', err, swap)
    }
  }

  /**
   * Handles the creation of a swap
   * @param {Swap} swap The swap that was created
   * @returns {Void}
   */
  async _onCreated (swap) {
    try {
      // Secret seeker goes first
      if (swap.secretSeeker.id !== this.sdk.id) return

      // generate an invoice to send to the secret holder
      const { secretHash, secretHolder } = swap
      const { id, asset, blockchain: blockchainName, quantity } = secretHolder
      const blockchain = this.sdk.blockchains[blockchainName.split('.')[0]]
      const invoiceArgs = { id, secretHash, asset, quantity }

      // NOTE: MUTATION!
      secretHolder.invoice = await blockchain.createInvoice(invoiceArgs)

      // IIFE implementing infinite retries until success
      // TODO: fix this to be more reasonable through state persistance
      const sendInvoice = async args => {
        try {
          this.info('swap.sendInvoice', args, swap)
          await this.sdk.network.request(args, { swap })
        } catch (err) {
          this.error('swap.sendInvoice', err, args, swap)
          setTimeout(sendInvoice, 1000, args) // FIXME: Hardcoded value
        }
      }

      sendInvoice({ method: 'PUT', path: '/api/v1/swap' })
    } catch (err) {
      this.error('swap.error', err, swap)
      this.emit('error', err, swap)
    }
  }

  /**
   * Handles the opening of a swap
   * @param {Swap} swap The swap that is opening
   * @returns {Void}
   */
  async _onOpening (swap) {
    try {
      // Secret holder goes next
      if (swap.secretHolder.id !== this.sdk.id) return

      // generate an invoice to send to the secret holder
      const { secretHash, secretSeeker } = swap
      const { id, asset, blockchain: blockchainName, quantity } = secretSeeker
      const blockchain = this.sdk.blockchains[blockchainName.split('.')[0]]
      const invoiceArgs = { id, secretHash, asset, quantity }

      // NOTE: MUTATION!
      secretSeeker.invoice = await blockchain.createInvoice(invoiceArgs)

      // IIFE implementing infinite retries until success
      // TODO: fix this to be more reasonable through state persistance
      const sendInvoice = async args => {
        try {
          this.info('swap.sendInvoice', args, swap)
          await this.sdk.network.request(args, { swap })
        } catch (err) {
          this.error('swap.sendInvoice', err, args, swap)
          setTimeout(sendInvoice, 1000, args) // FIXME: Hardcoded value
        }
      }

      sendInvoice({ method: 'PUT', path: '/api/v1/swap' })
    } catch (err) {
      this.error('swap.error', err, swap)
      process.exit(1)
      this.emit('error', err)
    }
  }

  /**
   * Handles a swap that was opened
   * @param {Swap} swap The swap that was opened
   * @returns {Void}
   */
  _onOpened (swap) {
    if (swap.isSecretSeeker(this.sdk.id)) {

    }
  }

  /**
   * Handles a swap that is committing
   * @param {Swap} swap The swap that is committing
   * @returns {Void}
   */
  _onCommitting (swap) {
    if (swap.isSecretHolder(this.sdk.id)) {

    }
  }

  /**
   * Handles a swap that was committed
   * @param {Swap} swap The swap that was committed
   * @returns {Void}
   */
  _onCommitted (swap) {
    // TODO: clean up
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
