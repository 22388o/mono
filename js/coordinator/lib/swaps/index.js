/**
 * @file Exposes all in-progress atomic swaps
 */

const { BaseClass } = require('@portaldefi/core')
const Swap = require('./swap')

/**
 * Exposes all in-progress atomic swaps
 * @type {Swaps}
 */
module.exports = class Swaps extends BaseClass {
  constructor (props) {
    if (props == null) {
      throw Error('no properties specified!')
    } else if (props.dex == null) {
      throw Error('expect props.dex to be a DEX instance!')
    } else if (props.store == null) {
      throw Error('expect props.store to be a Store instance!')
    }

    super()

    // Listen for matched orders from the dex to create swaps
    props.dex.on('match', (...args) => this.fromOrders(...args))

    this.store = props.store
    this.swaps = new Map()

    Object.freeze(this)
  }

  /**
   * Creates a new swap for a given maker/taker/client combination
   * @param {Order|Object} maker The maker side of the order
   * @param {Order|Object} taker The taker side of the order
   * @returns {Promise<Swap>}
   */
  async fromOrders (maker, taker) {
    try {
      const swap = await Swap.fromOrders(maker, taker)

      if (this.swaps.has(swap.id)) {
        throw Error(`swap "${swap.id}" already exists!`)
      }

      this.swaps.set(swap.id, swap)
      this.emit(swap.status, swap)
      return swap
    } catch (err) {
      this.error('fromOrders', err, maker, taker, this)
      this.emit('error', err, maker, taker, this)
    }
  }

  /**
   * Handles incoming swap updates
   * @param {Object} swapObj The JSON representation of the swap
   * @param {Object} partyObj The JSON representation of the party that sent the update
   */
  onSwap (swapObj, partyObj) {
    return new Promise((resolve, reject) => {
      if (swapObj == null || swapObj.id == null) {
        return reject(Error('unknown swap!'))
      } else if (!this.swaps.has(swapObj.id)) {
        return reject(Error(`unknown swap "${swapObj.id}"!`))
      }

      const swap = this.swaps.get(swapObj.id)

      if (!swap.isParty(partyObj)) {
        return reject(Error('unauthorized swap update!'))
      }

      try {
        swap.update(swapObj)
      } catch (err) {
        reject(err)
      }

      resolve(swap)
      this.emit(swap.status, swap)
    })
  }
}
