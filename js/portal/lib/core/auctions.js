/**
 * @file Exposes all auctions
 */

const { EventEmitter } = require('events')
const Auction = require('./auction')

/**
 * Exposes all auctions
 * @type {Auctions}
 */
module.exports = class Auctions extends EventEmitter {
  /**
   * Creates a new instance of Auctions
   * @param {Object} props Properties of the instance
   * @param {Context} ctx The application context object
   */
  constructor (props, ctx) {
    super()

    this.ctx = ctx
    this.auctions = new Map()

    Object.seal(this)
  }

  /**
   * Creates a new auction
   * @param {Object} obj The properties of the auction
   * @param {String} obj.uid The unique identifier of the auction
   * @param {String} obj.hash The hash of the secret used for a future swap
   * @param {Object} [opts] Configuration options for the operation
   * @returns {Promise<Auction>}
   */
  create (obj, opts) {
    return new Promise((resolve, reject) => {
      let auction

      try {
        auction = new Auction(obj)
        this.auctions.has(auction.id) || this.auctions.set(auction.id, auction)
      } catch (err) {
        return reject(err)
      }

      Auction.EVENTS.forEach(event => auction.on(event, (...args) => {
        this.emit('log', 'info', `auction.${event}`, ...args)
        this.emit(event, ...args)
      }))

      resolve(auction)
    })
  }

  /**
   * Retrieves an existing auction
   * @param {Object} obj The auction being retrieved
   * @param {String} obj.id The unique identifier of the auction to be retrieved
   * @param {String} obj.uid The unique identifier of the auction owner
   * @param {Object} [opts] Configuration options for the operation
   * @returns {Promise<Auction>}
   */
  async retrieve (obj, opts) {
    if (obj == null || obj.id == null) {
      throw Error('unknown auction!')
    } else if (!this.auctions.has(obj.id)) {
      throw Error(`unknown auction "${obj.id}"!`)
    } else if (this.auctions.get(obj.id).uid !== obj.uid) {
      throw Error(`auction "${obj.id}" is not owned by ${obj.uid}!`)
    }

    return Promise.resolve(this.auctions.get(obj.id))
  }

  /**
   * Cancels a auction
   * @param {Object} obj The auction being cancelled
   * @param {String} obj.id The unique identifier of the auction to be cancelled
   * @param {String} obj.uid The unique identifier of the auction owner
   * @param {Object} [opts] Configuration options for the operation
   * @returns {Promise<Auction>}
   */
  async cancel (obj, opts) {
    if (obj == null || obj.id == null) {
      throw Error('unknown auction!')
    } else if (!this.auctions.has(obj.id)) {
      throw Error(`unknown auction "${obj.id}"!`)
    } else if (this.auctions.get(obj.id).uid !== obj.uid) {
      throw Error(`auction "${obj.id}" is not owned by ${obj.uid}!`)
    }

    const auction = this.auctions.get(obj.id).cancel()
    this.auctions.delete(obj.id)

    return auction
  }

  /**
   * Handles the opening of a auction by a user that is a party to the auction
   * @param {Object} obj The auction on which the bid is to be placed
   * @param {String} obj.id The unique identifier of the auction
   * @param {Object} bid The bid to be placed on the auction
   * @param {String} obj.uid The unique identifier of the bidder
   * @param {Number} bid.price The price being bid on the auction
   * @param {Object} [opts] Configuration options for the operation
   * @returns {Promise<Bid>}
   */
  bid (obj, bid, opts) {
    if (obj == null || obj.id == null) {
      return Promise.reject(Error('unknown auction!'))
    } else if (!this.auctions.has(obj.id)) {
      return Promise.reject(Error(`unknown auction "${obj.id}"!`))
    }

    const auction = this.auctions.get(obj.id)
    return Promise.resolve(auction.placeBid(bid))
  }
}
