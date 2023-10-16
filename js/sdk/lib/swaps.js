/**
 * @file An interface to all swaps
 */

const { BaseClass, Order, Util } = require('@portaldefi/core')
const Swap = require('./swap')

/**
 * Expose the interface to all swaps
 * @type {Swaps}
 */
module.exports = class Swaps extends BaseClass {
  constructor (sdk, props) {
    super()

    this.sdk = sdk

    // Read swap events from the network
    this.sdk.network
      .on('swap.received', obj => this._onSwap(obj))
      .on('swap.holder.invoice.sent', obj => this._onSwap(obj))
      .on('swap.seeker.invoice.sent', obj => this._onSwap(obj))

    Object.freeze(this)
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
   * Handles the swap as it transitions through its states
   * @param {Object} obj The JSON represetation of the swap that was received
   * @returns {Void}
   */
  async _onSwap (obj) {
    const { sdk } = this
    const { store } = sdk
    let swap = null

    try {
      // Convert the JSON representation of the swap into a Swap instance.
      swap = Swap.fromJSON(obj, sdk)

      // If this is a new swap, save it to the store. If not, then retrieve the
      // existing swap from the store and update it with the incoming swap.
      if (swap.status === 'received') {
        await store.put('swaps', swap.id, swap.toJSON())
      } else {
        const swapObj = await store.get('swaps', swap.id)
        const swapp = Swap.fromJSON(swapObj, sdk)
        swapp.update(swap)
        swap = swapp
      }

      // Now check the status of the swap and take action accordingly
      switch (swap.status) {
        case 'received': {
          this.info(`swap.received`, swap)
          if (swap.party.isSeeker) return

          const secret = Util.random()
          const secretHash = Util.hash(secret)
          await store.put('secrets', secretHash, {
            secret: `0x${secret.toString('hex')}`,
            swap: swap.id
          })

          // NOTE: Swap mutation causes status to transition to 'created'
          swap.secretHash = secretHash

          // NOTE: fallthru to the next state
        }

        case 'created': {
          if (swap.party.isSeeker) return
          this.info(`swap.${swap.status}`, swap)

          // NOTE: Swap mutation causes status to transition to 'holder.invoicing'
          await swap.createInvoice()
          await store.put('swaps', swap.id, swap.toJSON())
        }
        // NOTE: fallthru to the next state

        case 'holder.invoice.created': {
          if (swap.party.isSeeker) return
          this.info(`swap.${swap.status}`, swap)

          // NOTE: Swap mutation causes status to transition to 'holder.invoiced'
          await swap.sendInvoice()
          await store.put('swaps', swap.id, swap.toJSON())
          break
        }

        case 'holder.invoice.sent': {
          if (swap.party.isHolder) return
          this.info(`swap.${swap.status}`, swap)

          // NOTE: Swap mutation causes status to transition to 'seeker.invoicing'
          await swap.createInvoice()
          await store.put('swaps', swap.id, swap.toJSON())
        }
        // NOTE: fallthru to the next state

        case 'seeker.invoice.created': {
          if (swap.party.isHolder) return
          this.info(`swap.${swap.status}`, swap)

          // NOTE: Swap mutation causes status to transition to 'seeker.invoiced'
          await swap.sendInvoice()
          await store.put('swaps', swap.id, swap.toJSON())
          break
        }

        case 'seeker.invoice.sent': {
          if (swap.party.isSeeker) return
          this.info(`swap.${swap.status}`, swap)

          // NOTE: Swap mutation causes status to transition to 'holder.paid'
          await swap.payInvoice()
          await store.put('swaps', swap.id, swap.toJSON())
          break
        }

        case 'holder.invoice.paid': {
          if (swap.party.isHolder) return
          this.info(`swap.${swap.status}`, swap)

          // NOTE: Swap mutation causes status to transition to 'seeker.paid'
          await swap.payInvoice()
          await store.put('swaps', swap.id, swap.toJSON())
          break
        }

        case 'seeker.invoice.paid': {
          if (swap.party.isSeeker) return
          this.info(`swap.${swap.status}`, swap)

          // NOTE: Swap mutation causes status to transition to 'holder.  ed'
          await swap.settleInvoice()
          await store.put('swaps', swap.id, swap.toJSON())
          break
        }

        case 'holder.invoice.settled': {
          if (swap.party.isHolder) return
          this.info(`swap.${swap.status}`, swap)

          // NOTE: Swap mutation causes status to transition to 'seeker.settled'
          await swap.settleInvoice()
          await store.put('swaps', swap.id, swap.toJSON())
          break
        }

        case 'seeker.invoice.settled': {
          this.info(`swap.${swap.status}`, swap)
          break
        }

        default:
          const err = Error(`unknown status "${swap.status}"!`)
          this.error(`swap.error`, err, swap)
      }
    } catch (err) {
      this.error('swap.error', err, swap)
      this.emit('error', err, swap)
    }
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
   * @param {Swap} swap The newly created swap
   * @returns 
   */
  async _onCreated(swap) {
    const { blockchains, network } = this.sdk
    const { secretHolder, secretSeeker } = swap

    // the seeker waits for the holder to deliver the holder-invoice
    if (secretSeeker.id === this.sdk.id) return

    // the holder first generates a secret for the swap, and hashes it
    const secret = Util.random()
    swap.secretHash = Util.hash(secret) // NOTE: SWAP STATE MUTATION!
    this.sdk.emit('swap.created', swap)

    // the holder generates the holder-invoice on the seeker-chain
    const seekerChain = blockchains[secretSeeker.blockchain.split('.')[0]]
    await seekerChain.createInvoice(secretSeeker)

    // when the seeker pays the holder-invoice on the seeker-chain, the holder
    // uses the secret to immediately settle it on the seeker-chain, thereby
    // receiving the funds on the seeker-chain
    seekerChain.once('invoice.paid', () => {
      this.info('swap.seekerPaid', swap)
      this.sdk.emit('swap.seekerPaid', swap)

      seekerChain
        .once('invoice.settled', () => {
          this.info('swap.holderSettled', swap)
          this.sdk.emit('swap.holderSettled', swap)
        })
        .settleInvoice(secretHolder, secret)
    })

    // finally, the holder sends the holder-invoice to the seeker
    const args = { method: 'PUT', path: '/api/v1/swap' }
    try {
      this.info('swap.notifyCounterParty', args, swap)
      await network.request(args, { swap })

      this.info('swap.holderInvoiced', swap)
      this.sdk.emit('swap.holderInvoiced', swap)
    } catch (err) {
      this.error('swap.notifyCounterParty', err, args, swap)
      this.sdk.emit('swap.error', err, swap)
    }
  }

  /**
   * Handles the opening of a swap
   * @param {Swap} swap The swap that is opening
   * @returns {Void}
   */
  async _onOpening (swap) {
    const { blockchains, network } = this.sdk
    const { secretHolder, secretSeeker } = swap
    const seekerChain = blockchains[secretSeeker.blockchain.split('.')[0]]

    // the holder waits for the seeker to deliver the seeker-invoice
    if (secretHolder.id === this.sdk.id) return

    // the seeker generates the seeker-invoice on the holder-chain
    const holderChain = blockchains[secretHolder.blockchain.split('.')[0]]
    await holderChain.createInvoice(secretHolder)

    // when the holder pays the seeker's invoice on the holder-chain, the
    // seeker pays the holder's invoice on the seeker-chain
    holderChain.once('invoice.paid', () => {
      this.info('swap.holderPaid', swap)
      this.sdk.emit('swap.holderPaid', swap)

      seekerChain.payInvoice(secretSeeker)
    })

    // when the holder settles the holder-invoice on the seeker-chain, the
    // seeker uses the secret revealed during the settlement to settle the
    // seeker-invoice on the holder-chain
    seekerChain.once('invoice.settled', args => {
      holderChain
        .once('invoice.settled', () => {
          this.info('swap.seekerSettled', swap)
          this.sdk.emit('swap.seekerSettled', swap)
        })
        .settleInvoice(secretHolder, args.swap.secret)
    })

    // Notify the secret-holder
    const args = { method: 'PUT', path: '/api/v1/swap' }
    try {
      this.info('swap.notifyCounterParty', args, swap)
      await network.request(args, { swap })

      this.info('swap.seekerInvoiced', swap)
      this.sdk.emit('swap.seekerInvoiced', swap)
    } catch (err) {
      this.error('swap.notifyCounterParty', err, args, swap)
      this.sdk.emit('swap.error', err, swap)
    }
  }

  /**
   * Handles a swap once it is opened from both sides
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
    const holderChain = blockchains[secretHolder.blockchain.split('.')[0]]
    holderChain.payInvoice(secretHolder)
  }

  /**
   * Handles a swap that is committing
   * @param {Swap} swap The swap that is committing
   * @returns {Void}
   */
  async _onCommitting(swap) {
    throw Error('not implemented')
  }

  /**
   * Handles a swap that was committed
   * @param {Swap} swap The swap that was committed
   * @returns {Void}
   */
  _onCommitted (swap) {
    throw Error('not implemented')
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
