/**
 * @file An interface to all swaps
 */

const { BaseClass, Swap } = require('@portaldefi/core')
const { log } = require('util')

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
      const { secretHolder } = swap
      const { id, asset, blockchain: blockchainName, quantity } = secretHolder
      const blockchain = this.sdk.blockchains[blockchainName.split('.')[0]]

      // NOTE: MUTATION!
      secretHolder.invoice = await blockchain.createInvoice(secretHolder)

      // IIFE implementing infinite retries until success
      // TODO: fix this to be more reasonable through state persistance
      const notifyCounterParty = async args => {
        try {
          this.info('swap.notifyCounterParty', args, swap)
          await this.sdk.network.request(args, { swap })
        } catch (err) {
          this.error('swap.notifyCounterParty', err, args, swap)
          setTimeout(notifyCounterParty, 1000, args) // FIXME: Hardcoded value
        }
      }

      notifyCounterParty({ method: 'PUT', path: '/api/v1/swap' })
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
      const { secretSeeker } = swap
      const { id, asset, blockchain: blockchainName, quantity } = secretSeeker
      const blockchain = this.sdk.blockchains[blockchainName.split('.')[0]]

      // NOTE: MUTATION!
      secretSeeker.invoice = await blockchain.createInvoice(secretSeeker)

      // IIFE implementing infinite retries until success
      // TODO: fix this to be more reasonable through state persistance
      const notifyCounterParty = async args => {
        try {
          this.info('swap.notifyCounterParty', args, swap)
          await this.sdk.network.request(args, { swap })
        } catch (err) {
          this.error('swap.notifyCounterParty', err, args, swap)
          setTimeout(notifyCounterParty, 1000, args) // FIXME: Hardcoded value
        }
      }

      notifyCounterParty({ method: 'PUT', path: '/api/v1/swap' })
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
  async _onOpened(swap) {
    try {
      // Secret seeker goes next
      if (swap.secretSeeker.id !== this.sdk.id) return

      // handle the payment of the invoice sent previously
      const { secretHolder } = swap
      const { id, asset, blockchain: blockchainName, quantity } = secretHolder
      const blockchain = this.sdk.blockchains[blockchainName.split('.')[0]]

      blockchain
        .once('invoice.paid', async (invoice, party, blockchain) => {
          console.log(blockchainName, 'invoice.paid here')

          try {
            // when the seeker's invoice is paid, settle the holder's invoice
            const { secretSeeker } = swap
            const { blockchain: blockchainName } = secretSeeker
            const blockchain = this.sdk.blockchains[blockchainName.split('.')[0]]

            await blockchain
              .once('invoice.settled', (invoice, party, blockchain) => {
                console.log('invoice.settled here', invoice, party, blockchain)
              })
              .payInvoice(secretSeeker)
            console.log(blockchainName, 'invoice.paid here')
          } catch (err) {
            this.error('swap.error', err, swap)
            this.emit('error', err, swap)
          }
        })

      // IIFE implementing infinite retries until success
      // TODO: fix this to be more reasonable through state persistance
      const notifyCounterParty = async args => {
        try {
          this.info('swap.notifyCounterParty', args, swap)
          await this.sdk.network.request(args, { swap })
        } catch (err) {
          this.error('swap.notifyCounterParty', err, args, swap)
          setTimeout(notifyCounterParty, 1000, args) // FIXME: Hardcoded value
        }
      }

      notifyCounterParty({ method: 'POST', path: '/api/v1/swap' })
    } catch (err) {
      this.error('swap.error', err, swap)
      this.emit('error', err, swap)
    }
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
      console.log('lightning payment made')
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
