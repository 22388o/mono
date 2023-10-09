/**
 * @file Exposes all in-progress atomic swaps
 */

const { BaseClass, Swap } = require('@portaldefi/core')

/**
 * Forwards events to the specified EventEmitter instance
 * @param {EventEmitter} self The EventEmitter instance that will fire the event
 * @param {String} event The event being fired/handled
 * @returns {[Void}
 */
function forwardEvent (self, event) {
  return function (...args) {
    self.emit('log', 'info', `swap.${event}`, ...args)
    self.emit(event, ...args)
  }
}

/**
 * Exposes all in-progress atomic swaps
 * @type {Swaps}
 */
module.exports = class Swaps extends BaseClass {
  constructor (props, ctx) {
    super()

    this.ctx = ctx
    this.swaps = new Map()

    Object.seal(this)
  }

  /**
   * Creates a new swap for a given maker/taker/client combination
   * @param {Order|Object} maker The maker side of the order
   * @param {Order|Object} taker The taker side of the order
   * @returns {Promise<Swap>}
   */
  fromOrders (maker, taker) {
    return new Promise((resolve, reject) => {
      let swap

      try {
        swap = Swap.fromOrders(maker, taker, this.ctx)
          .once('created', forwardEvent(this, 'created'))
          .once('opening', forwardEvent(this, 'opening'))
          .once('opened', forwardEvent(this, 'opened'))
          .once('committing', forwardEvent(this, 'committing'))
          .once('committed', forwardEvent(this, 'committed'))

        if (this.swaps.has(swap.id)) {
          throw Error(`swap "${swap.id}" already exists!`)
        } else {
          this.swaps.set(swap.id, swap)
          resolve(swap)
        }
      } catch (err) {
        return reject(err)
      }
    })
  }

  /**
   * Handles the opening of a swap by a user that is a party to the swap
   * @param {Object} swapObj The swap to open
   * @param {String} swapObj.id The unique identifier of the swap to be opened
   * @param {String} swapObj.secretHolder.invoice The invoice to be paid by the secret holder
   * @param {String} swapObj.secretSeeker.invoice The invoice to be paid by the secret seeker
   * @param {Object} partyObj The party that is opening the swap
   * @param {String} party.id The unique identifier of the party
   * @param {Object} opts Configuration options for the operation
   * @returns {Promise<Swap>}
   */
  open (swapObj, partyObj, opts) {
    if (swapObj == null || swapObj.id == null) {
      return Promise.reject(Error('unknown swap!'))
    } else if (!this.swaps.has(swapObj.id)) {
      return Promise.reject(Error(`unknown swap "${swapObj.id}"!`))
    }

    const swap = this.swaps.get(swapObj.id)
    const { secretHolder, secretSeeker, status } = swap
    const isHolder = partyObj.id === secretHolder.id
    const isSeeker = partyObj.id === secretSeeker.id
    const isBoth = isHolder && isSeeker
    const isNeither = !isHolder && !isSeeker

    if (isBoth || isNeither) {
      const err = isBoth
        ? Error('self-swapping is not allowed!')
        : Error(`"${partyObj.id}" not a party to swap "${swap.id}"!`)
      return Promise.reject(err)
    }

    if (swap.isCreated) {
      if (isSeeker) {
        swap.secretHolder.invoice = swapObj.secretHolder.invoice
      } else {
        const err = Error('waiting for counterparty to open!')
        return Promise.reject(err)
      }
    } else if (swap.isOpening) {
      if (isHolder) {
        swap.secretSeeker.invoice = swapObj.secretSeeker.invoice
      } else {
        const err = Error('waiting for counterparty to open!')
        return Promise.reject(err)
      }
    } else {
      const err = Error(`cannot open swap "${swap.id}" when ${status}!`)
      return Promise.reject(err)
    }

    return Promise.resolve(swap)
  }

  // /**
  //  * Handles the opening of a swap by a user that is a party to the swap
  //  * @param {Swap} swap The swap to open
  //  * @param {String} swap.id The unique identifier of the swap to be opened
  //  * @param {Party|Object} party The party that is opening the swap
  //  * @param {String} party.id The unique identifier of the party
  //  * @param {Object} opts Configuration options for the operation
  //  * @returns {Promise<Swap>}
  //  */
  // open (swap, party, opts) {
  //   if (swap == null || swap.id == null) {
  //     return Promise.reject(Error('unknown swap!'))
  //   } else if (!this.swaps.has(swap.id)) {
  //     return Promise.reject(Error(`unknown swap "${swap.id}"!`))
  //   } else {
  //     return this.swaps.get(swap.id).open(party, opts)
  //   }
  // }

  /**
 * Handles commiting to a swap by a user that is a party to id
 * @param {Object} swapObj The swap being committed
 * @param {String} swapObj.id The unique identifier of the swap
 * @param {Object} partyObj The party that is committing the swap
 * @param {String} party.id The unique identifier of the party
 * @param {Object} opts Configuration options for the operation
 * @returns {Promise<Swap>}
 */
  commit(swapObj, partyObj, opts) {
    try {
      if (swapObj == null || swapObj.id == null) {
        return Promise.reject(Error('unknown swap!'))
      } else if (!this.swaps.has(swapObj.id)) {
        return Promise.reject(Error(`unknown swap "${swapObj.id}"!`))
      }

      const swap = this.swaps.get(swapObj.id)
      const { secretHolder, secretSeeker, status } = swap
      const isHolder = partyObj.id === secretHolder.id
      const isSeeker = partyObj.id === secretSeeker.id
      const isBoth = isHolder && isSeeker
      const isNeither = !isHolder && !isSeeker

      if (isBoth || isNeither) {
        const err = isBoth
          ? Error('self-swapping is not allowed!')
          : Error(`"${partyObj.id}" not a party to swap "${swap.id}"!`)
        return Promise.reject(err)
      }

      if (swap.isOpened) {
        if (isSeeker) {
          swap._status = 'committing'
        } else {
          const err = Error('waiting for counterparty to commit!')
          return Promise.reject(err)
        }
      } else if (swap.isCommitting) {
        if (isHolder) {
          swap._status = 'committed'
        } else {
          const err = Error('waiting for counterparty to commit!')
          return Promise.reject(err)
        }
      } else {
        const err = Error(`cannot commit swap "${swap.id}" when ${status}!`)
        return Promise.reject(err)
      }

      this.emit(swap.status, swap)
      return Promise.resolve(swap)
    } catch (err) {
      console.log('caught error', err)
      return Promise.reject(err)
    }
  }

  // /**
  //  * Handles commiting to a swap by a user that is a party to id
  //  * @param {Swap} swap The swap being committed
  //  * @param {String} swap.id The unique identifier of the swap to be committed
  //  * @param {Party} party The party that is committing the swap
  //  * @param {String} party.id The unique identifier of the party
  //  * @param {Object} opts Configuration options for the operation
  //  * @returns {Promise<Swap>}
  //  */
  // commit (swap, party, opts) {
  //   if (swap == null || swap.id == null) {
  //     throw new Error('unknown swap!')
  //   } else if (!this.swaps.has(swap.id)) {
  //     throw new Error(`unknown swap "${swap.id}"!`)
  //   } else {
  //     return this.swaps.get(swap.id).commit(party, opts)
  //   }
  // }

  // /**
  //  * Aborts a swap gracefully
  //  * @param {Swap} swap The swap to be aborted
  //  * @param {String} swap.id The unique identifier of the swap to be aborted
  //  * @param {Party} party The party that is aborting the swap
  //  * @param {String} party.id The unique identifier of the party
  //  * @param {Object} opts Configuration options for the operation
  //  * @returns {Promise<Void>}
  //  */
  // abort (swap, party, opts) {
  //   return new Promise((resolve, reject) => {
  //     reject(Error('not implemented yet!'))
  //   })
  // }
}
