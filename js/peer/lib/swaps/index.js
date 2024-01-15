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

    const partyObj = Object.freeze({ id: props.uid })
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
   * Handles the swap as it transitions through its states
   * @param {Object} swapObj The JSON representation of the swap
   * @param {Object} partyObj The JSON representation of the peer party
   */
  async onSwap (swapObj, partyObj) {
    const { store } = this
    let swap = null

    try {
      // Convert the JSON representation of the swap into a Swap instance.
      swap = Swap.fromJSON(swapObj, partyObj)

      // If this is a new swap, save it to the store. If not, then retrieve the
      // existing swap from the store and update it with the incoming swap.
      if (swap.isReceived) {
        await store.put('swaps', swap.id, swap.toJSON())
      } else {
        const obj = await store.get('swaps', swap.id)
        swap = Swap.fromJSON(obj, partyObj)
        swap.update(Swap.fromJSON(swapObj, partyObj))
      }

      // swap
      //   // The 'received' state is handled below in the switch case
      //   // .on('received', swap => this.emit(`swap.${swap.status}`, swap))
      //   .on('created', swap => this.emit(`swap.${swap.status}`, swap))
      //   .on('holder.invoice.created', swap => this.emit(`swap.${swap.status}`, swap))
      //   .on('holder.invoice.sent', swap => this.emit(`swap.${swap.status}`, swap))
      //   .on('seeker.invoice.created', swap => this.emit(`swap.${swap.status}`, swap))
      //   .on('seeker.invoice.sent', swap => this.emit(`swap.${swap.status}`, swap))
      //   .on('holder.invoice.paid', swap => this.emit(`swap.${swap.status}`, swap))
      //   .on('seeker.invoice.paid', swap => this.emit(`swap.${swap.status}`, swap))
      //   .on('holder.invoice.settled', swap => this.emit(`swap.${swap.status}`, swap))
      //   .on('seeker.invoice.settled', swap => this.emit(`swap.${swap.status}`, swap))
      //   .on('completed', swap => this.emit(`swap.${swap.status}`, swap))

      // Now check the status of the swap and take action accordingly
      switch (swap.status) {
        case 'received': {
          // This event is expected to occur on both sides of the swap. So this
          // is handled here in the switch case. Otherwise, there is no other
          // means to fire it reliably on both sides of the SDK.
          this.info(`swap.${swap.status}`, swap)
          this.emit(`swap.${swap.status}`, swap)

          if (swap.party.isSeeker) return

          // NOTE: Swap mutation causes status to transition to 'created'
          swap.secretHash = await this.createSecretHash(swap)
        }

        // NOTE: fallthru to the next state
        /* eslint-disable-next-line no-fallthrough */
        case 'created': {
          if (swap.party.isSeeker) return

          this.info(`swap.${swap.status}`, swap)
          this.emit(`swap.${swap.status}`, swap)

          // NOTE: Swap mutation causes status to transition to 'holder.invoice.created'
          await this.createInvoice(swap)
          await store.put('swaps', swap.id, swap.toJSON())
        }

        // NOTE: fallthru to the next state
        /* eslint-disable-next-line no-fallthrough */
        case 'holder.invoice.created': {
          if (swap.party.isSeeker) return

          this.info(`swap.${swap.status}`, swap)
          this.emit(`swap.${swap.status}`, swap)

          // NOTE: Swap mutation causes status to transition to 'holder.invoice.sent'
          await this.sendInvoice(swap)
          await store.put('swaps', swap.id, swap.toJSON())
          break
        }

        case 'holder.invoice.sent':
          // This event is fired by the network, and so must be fired for both parties
          this.info(`swap.${swap.status}`, swap)
          this.emit(`swap.${swap.status}`, swap)

          if (swap.party.isHolder) return

          // NOTE: Swap mutation causes status to transition to 'seeker.invoice.created'
          await this.createInvoice(swap)
          await store.put('swaps', swap.id, swap.toJSON())

        // NOTE: fallthru to the next state
        /* eslint-disable-next-line no-fallthrough */
        case 'seeker.invoice.created':
          if (swap.party.isHolder) return

          this.info(`swap.${swap.status}`, swap)
          this.emit(`swap.${swap.status}`, swap)

          // NOTE: Swap mutation causes status to transition to 'seeker.invoice.sent'
          await this.sendInvoice(swap)
          await store.put('swaps', swap.id, swap.toJSON())
          break

        case 'seeker.invoice.sent':
          // This event is fired by the network, and so must be fired for both parties
          this.info(`swap.${swap.status}`, swap)
          this.emit(`swap.${swap.status}`, swap)

          if (swap.party.isSeeker) return

          // NOTE: Swap mutation causes status to transition to 'holder.paid'
          await this.payInvoice(swap)
          await store.put('swaps', swap.id, swap.toJSON())
          break

        case 'holder.invoice.paid':
          if (swap.party.isHolder) return

          this.info(`swap.${swap.status}`, swap)
          this.emit(`swap.${swap.status}`, swap)

          // NOTE: Swap mutation causes status to transition to 'seeker.paid'
          await this.payInvoice(swap)
          await store.put('swaps', swap.id, swap.toJSON())
          break

        case 'seeker.invoice.paid':
          if (swap.party.isSeeker) return

          this.info(`swap.${swap.status}`, swap)
          this.emit(`swap.${swap.status}`, swap)

          // NOTE: Swap mutation causes status to transition to 'holder.  ed'
          await this.settleInvoice(swap)
          await store.put('swaps', swap.id, swap.toJSON())
          break

        case 'holder.invoice.settled':
          if (swap.party.isHolder) return

          this.info(`swap.${swap.status}`, swap)
          this.emit(`swap.${swap.status}`, swap)

          // NOTE: Swap mutation causes status to transition to 'seeker.settled'
          await this.settleInvoice(swap)
          await store.put('swaps', swap.id, swap.toJSON())
          break

        case 'seeker.invoice.settled':
          this.info(`swap.${swap.status}`, swap)
          this.emit(`swap.${swap.status}`, swap)
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

  async createSecretHash (swap) {
    const { store } = this
    const secret = Util.random()
    const secretHash = await Util.hash(secret)

    await store.put('secrets', secretHash, {
      secret: secret.toString('hex'),
      swap: swap.id
    })

    swap.status = 'created'

    return secretHash
  }

  /**
   * Creates an invoice to send to the counterparty
   * @param {Swap} swap The swap being processed
   * @returns {Promise<Void>}
   */
  async createInvoice (swap) {
    const { blockchains, store } = this
    const blockchain = blockchains[swap.counterparty.blockchain]

    blockchain.once('invoice.paid', invoice => {
      if (swap.party.isSeeker) {
        swap.status = 'holder.invoice.paid'
        this.emit(`swap.${swap.status}`, swap)
        this.payInvoice(swap)
      } else if (swap.party.isHolder) {
        swap.status = 'seeker.invoice.paid'
        this.emit(`swap.${swap.status}`, swap)
        this.settleInvoice(swap)
      } else {
        throw Error('unexpected code branch!')
      }
    })

    if (swap.party.isSeeker) {
      const blockchain = blockchains[swap.party.blockchain]
      blockchain.once('invoice.settled', async invoice => {
        await store.put('secrets', invoice.id.substr(2), {
          secret: invoice.swap.secret,
          swap: invoice.swap.id
        })
        this.settleInvoice(swap)
      })
    }

    swap.counterparty.invoice = await blockchain.createInvoice(swap.counterparty)
    swap.status = `${swap.partyType}.invoice.created`
    // this.emit(`swap.${swap.status}`, swap)
  }

  /**
   * Sends the invoice to the counterparty
   * @param {Swap} swap The swap being processed
   * @returns {Promise<Void>}
   */
  async sendInvoice (swap) {
    const { network } = this

    try {
      const args = { method: 'PATCH', path: '/api/v1/swap' }
      swap.status = `${swap.partyType}.invoice.sent`
      await network.request(args, { swap })
      // We do not emit this event here; instead we wait for the server
      // websocket message to trigger the event.
      // this.emit(`swap.${swap.status}`, swap)
    } catch (err) {
      swap.status = `${swap.partyType}.invoice.created`
      throw err
    }
  }

  /**
   * Causes the party to pay the invoice
   * @param {Swap} swap The swap being processed
   * @return {Promise<Void>}
   */
  async payInvoice (swap) {
    const { blockchains } = this
    const blockchain = blockchains[swap.party.blockchain]
    swap.party.payment = await blockchain.payInvoice(swap.party)
    swap.status = `${swap.partyType}.invoice.paid`
    this.emit(`swap.${swap.status}`, swap)
  }

  /**
   * Settles an invoice previously to send to the counterparty
   * @param {Swap} swap The swap being processed
   * @returns {Promise<Swap>}
   */
  async settleInvoice (swap) {
    const { blockchains, store } = this
    const blockchain = blockchains[swap.counterparty.blockchain]
    const { secret } = await store.get('secrets', swap.secretHash)

    const settle = async () => {
      swap.party.receipt = await blockchain.settleInvoice(swap.counterparty, secret)
      swap.status = `${swap.partyType}.invoice.settled`
      this.emit(`swap.${swap.status}`, swap)
    }

    // required to prevent a race condition when run in a tight loop.
    if (swap.party.isHolder || swap.isSeekerInvoicePaid) {
      settle()
    } else {
      this.once('seeker.invoice.paid', settle)
    }
  }
}
