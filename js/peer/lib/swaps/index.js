/**
 * @file An interface to all swaps
 */

const { BaseClass, Util } = require('@portaldefi/core')
const Swap = require('../../../coordinator/lib/swaps/swap')

/**
 * Expose the interface to all swaps
 * @type {Swaps}
 */
module.exports = class Swaps extends BaseClass {
  constructor (props) {
    if (props.network == null) {
      throw Error('expected props.network to be a valid network client!')
    } else if (props.store == null) {
      throw Error('expected props.store to be a valid store!')
    } else if (props.blockchains == null) {
      throw Error('expected props.blockchains to be an interface to blockchains!')
    }

    super({ id: 'swaps' })

    const partyObj = { id: props.uid }
    const handle = event => [event, obj => {
      const swap = this.fromJSON(obj, partyObj)
    }]
    this.network = props.network
      .on('swap.received', obj => this.onSwap(obj, partyObj))
      .on('swap.holder.invoice.sent', obj => this.onSwap(obj, partyObj))
      .on('swap.seeker.invoice.sent', obj => this.onSwap(obj, partyObj))
    this.store = props.store
    this.blockchains = props.blockchains

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
   * Creates a Swap instance from a JSON object
   * @param {Object} swapObj The JSON representation of the swap
   * @param {Object} partyObj The JSON representation of the peer party
   * @returns {Swap}
   */
  fromJSON (swapObj, partyObj) {
    return new Promise((resolve, reject) => {
      try {

      } catch (err) {

      }
    })
  }

   /**
    * Handles the swap as it transitions through its states
    * @param {Object} swapObj The JSON representation of the swap
    * @param {Object} partyObj The JSON representation of the peer party
    */
  async onSwap (swapObj, partyObj) {
    const { store } = this
    let swap = null

    try {
      // Convert the JSON representation of the swap into a Swap instance.
      swap = Swap.fromJSON(obj, partyObj)

      // If this is a new swap, save it to the store. If not, then retrieve the
      // existing swap from the store and update it with the incoming swap.
      if (swap.isReceived) {
        await store.put('swaps', swap.id, swap.toJSON())
      } else {
        const swapObj = await store.get('swaps', swap.id)
        swap = Swap.fromJSON(swapObj)
        swap.update(Swap.fromJSON(obj))
        this.emit(`swap.${swap.status}`, swap)
      }

      swap
        // The 'received' state is handled below in the switch case
        // .on('received', swap => this.emit(`swap.${swap.status}`, swap))
        .on('created', swap => this.emit(`swap.${swap.status}`, swap))
        .on('holder.invoice.created', swap => this.emit(`swap.${swap.status}`, swap))
        .on('holder.invoice.sent', swap => this.emit(`swap.${swap.status}`, swap))
        .on('seeker.invoice.created', swap => this.emit(`swap.${swap.status}`, swap))
        .on('seeker.invoice.sent', swap => this.emit(`swap.${swap.status}`, swap))
        .on('holder.invoice.paid', swap => this.emit(`swap.${swap.status}`, swap))
        .on('seeker.invoice.paid', swap => this.emit(`swap.${swap.status}`, swap))
        .on('holder.invoice.settled', swap => this.emit(`swap.${swap.status}`, swap))
        .on('seeker.invoice.settled', swap => this.emit(`swap.${swap.status}`, swap))
        .on('completed', swap => this.emit(`swap.${swap.status}`, swap))

      // Now check the status of the swap and take action accordingly
      switch (swap.status) {
        case 'received': {
          // This event is expected to occur on both sides of the swap. So this
          // is handled here in the switch case. Otherwise, there is no other
          // means to fire it reliably on both sides of the SDK.
          this.info(`swap.${swap.status}`, swap)
          this.emit(`swap.${swap.status}`, swap)
          if (swap.party.isSeeker) return

          const secret = Util.random()
          const secretHash = await Util.hash(secret)
          await store.put('secrets', secretHash, {
            secret: secret.toString('hex'),
            swap: swap.id
          })

          // NOTE: Swap mutation causes status to transition to 'created'
          swap.secretHash = secretHash
        }

        // NOTE: fallthru to the next state
        /* eslint-disable-next-line no-fallthrough */
        case 'created': {
          if (swap.party.isSeeker) return

          this.info(`swap.${swap.status}`, swap)
          // NOTE: Swap mutation causes status to transition to 'holder.invoicing'
          await swap.createInvoice()
          await store.put('swaps', swap.id, swap.toJSON())
        }

        // NOTE: fallthru to the next state
        /* eslint-disable-next-line no-fallthrough */
        case 'holder.invoice.created': {
          if (swap.party.isSeeker) return

          this.info(`swap.${swap.status}`, swap)
          // NOTE: Swap mutation causes status to transition to 'holder.invoiced'
          await swap.sendInvoice()
          await store.put('swaps', swap.id, swap.toJSON())
          break
        }

        case 'holder.invoice.sent':
          if (swap.party.isHolder) return

          this.info(`swap.${swap.status}`, swap)
          // NOTE: Swap mutation causes status to transition to 'seeker.invoice.created'
          await swap.createInvoice()
          await store.put('swaps', swap.id, swap.toJSON())

        // NOTE: fallthru to the next state
        /* eslint-disable-next-line no-fallthrough */
        case 'seeker.invoice.created':
          if (swap.party.isHolder) return

          this.info(`swap.${swap.status}`, swap)
          // NOTE: Swap mutation causes status to transition to 'seeker.invoice.sent'
          await swap.sendInvoice()
          await store.put('swaps', swap.id, swap.toJSON())
          break

        case 'seeker.invoice.sent':
          if (swap.party.isSeeker) return

          this.info(`swap.${swap.status}`, swap)
          // NOTE: Swap mutation causes status to transition to 'holder.paid'
          await swap.payInvoice()
          await store.put('swaps', swap.id, swap.toJSON())
          break

        case 'holder.invoice.paid':
          if (swap.party.isHolder) return

          this.info(`swap.${swap.status}`, swap)
          // NOTE: Swap mutation causes status to transition to 'seeker.paid'
          await swap.payInvoice()
          await store.put('swaps', swap.id, swap.toJSON())
          break

        case 'seeker.invoice.paid':
          if (swap.party.isSeeker) return

          this.info(`swap.${swap.status}`, swap)
          // NOTE: Swap mutation causes status to transition to 'holder.  ed'
          await swap.settleInvoice()
          await store.put('swaps', swap.id, swap.toJSON())
          break

        case 'holder.invoice.settled':
          if (swap.party.isHolder) return

          this.info(`swap.${swap.status}`, swap)
          // NOTE: Swap mutation causes status to transition to 'seeker.settled'
          await swap.settleInvoice()
          await store.put('swaps', swap.id, swap.toJSON())
          break

        case 'seeker.invoice.settled':
        case 'completed':
          this.info(`swap.${swap.status}`, swap)
          break

        default: {
          const err = Error(`unknown status "${swap.status}"!`)
          this.error('swap.error', err, swap)
        }
      }
    } catch (err) {
      this.error('swap.error', err, swap)
      this.emit('error', err, swap)
    }
  }

  /**
   * Handles invoice events coming from the blockchains
   * @param {Invoice} invoice The invoice being handled
   * @param {Blockchain} blockchain The blockchain that emitted the invoice event
   * @returns {Void}
   */
  _onInvoice (invoice, blockchain) {

  }
}
