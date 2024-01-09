/**
 * @file An interface to all swaps
 */

const { BaseClass } = require('@portaldefi/core')
const Swap = require('../../coordinator/lib/swaps/swap')

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
    }

    super({ id: 'swaps' })

    this.network = props.network
    this.store = props.store

    // Read swap events from the network
    const forward = event => [event, obj => {
      try {
        // Convert the JSON representation of the swap into a Swap instance.
        const swap = Swap.fromJSON(obj)
        this.emit(`swap.${swap.status}`, swap)
      } catch (err) {
        this.error('swap.error', err, obj)
        this.emit('error', err, obj)
      }
    }]
    this.network
      .on(...forward('swap.received'))
      .on(...forward('swap.created'))
      .on(...forward('swap.holder.invoice.created'))
      .on(...forward('swap.holder.invoice.sent'))
      .on(...forward('swap.seeker.invoice.created'))
      .on(...forward('swap.seeker.invoice.sent'))
      .on(...forward('swap.holder.invoice.paid'))
      .on(...forward('swap.seeker.invoice.paid'))
      .on(...forward('swap.holder.invoice.settled'))
      .on(...forward('swap.seeker.invoice.settled'))

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
}
