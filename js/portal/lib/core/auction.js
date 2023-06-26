/**
 * @file Defines an auction
 */

const { hash, uuid } = require('../helpers')
const Bid = require('./bid')
const { EventEmitter } = require('events')

/**
 * Stores the internal state of each instance
 * @type {WeakMap}
 */
const INSTANCES = new WeakMap()

/**
 * Describes the state machine for an auction
 * @type {Object}
 */
const STATUS = [
  'CREATED',
  'OPENED',
  'CONCLUDED',
  'CANCELLED'
].reduce((statuses, status) => {
  statuses[status] = status.toLowerCase()
  return statuses
}, {})

/**
 * Defines an auction
 * @type {Auction}
 */
module.exports = class Auction extends EventEmitter {
  /**
   * Creates a new instance
   * @param {Object} props Properties of the instance
   * @param {String} [props.id] The unique identifier of the instance
   * @param {String} props.uid The unique identifier of the asset owner
   * @param {String} props.hash The hash of the secret used to swap the asset
   * @param {String} props.collectible The parent network of the asset
   * @param {String} props.collectibleAsset The asset being auctioned
   * @param {String} props.collectibleNetwork The parent network of the asset being auctioned
   * @param {String} props.paymentAsset The asset used to pay for the collectible
   * @param {String} props.paymentNetwork The network of the payment asset
   * @param {String} props.paymentQuantity The quantity of the payment asset
   */
  constructor (props) {
    if (props.uid == null) {
      throw new Error('no uid specified!')
    } else if (typeof props.uid !== 'string' || props.uid.length <= 0) {
      throw new Error(`uid must be a string; got ${typeof props.uid}`)
    } else if (props.hash == null) {
      throw new Error('no hash specified!')
    } else if (typeof props.hash !== 'string' || props.hash.length <= 0) {
      throw new Error(`hash must be a string; got ${typeof props.hash}`)
    }

    super()

    this.id = props.id || uuid()
    this.ts = props.ts || Date.now()

    this.uid = props.uid
    this.hash = props.hash

    this.collectible = props.collectible
    this.collectibleAsset = props.collectibleAsset
    this.collectibleNetwork = props.collectibleNetwork

    this.paymentAsset = props.paymentAsset
    this.paymentNetwork = props.paymentNetwork
    this.paymentQuantity = props.paymentQuantity

    INSTANCES.set(this, Object.seal({
      bids: [],
      status: STATUS.CREATED
    }))

    Object.seal(this)

    // Fire the event after allowing time for handlers to be registered
    setImmediate(() => this.emit(this.status, this))
  }

  /**
   * Returns a list of events based on the status of the auction
   * @returns {Array<String>}
   */
  static get EVENTS () {
    return Object.values(STATUS)
  }

  /**
   * The number of bids received
   * @returns {Number}
   */
  get bids () {
    return INSTANCES.get(this).bids.length
  }

  /**
   * The best bid on the auction; null if no bids have been received
   * As of now, this is the last bid instance in the bids array.
   * @returns {Bid|null}
   */
  get winningBid () {
    const { bids } = INSTANCES.get(this)
    const winningBid = bids[bids.length - 1]
    return winningBid == null ? null : winningBid
  }

  /**
   * The current status of the instance
   * @returns {String}
   */
  get status () {
    return INSTANCES.get(this).status
  }

  /**
   * Returns whether or not the instance is in the `created` state
   * @returns {Boolean}
   */
  get isCreated () {
    return this.status === STATUS.CREATED
  }

  /**
   * Returns whether or not the instance is in the `opened` state
   * @returns {Boolean}
   */
  get isOpened () {
    return this.status === STATUS.OPENED
  }

  /**
   * Returns whether or not the instance is in the `concluded` state
   * @returns {Boolean}
   */
  get isConcluded () {
    return this.status === STATUS.CONCLUDED
  }

  /**
   * Returns whether or not the instance is in the `cancelled` state
   * @returns {Boolean}
   */
  get isCancelled () {
    return this.status === STATUS.CANCELLED
  }

  /**
   * Returns the current state of the instance
   * @type {String}
   */
  [Symbol.for('nodejs.util.inspect.custom')] () {
    return this.toJSON()
  }

  /**
   * Returns the JSON representation of the instance
   * @returns {Object}
   */
  toJSON () {
    return Object.freeze({
      '@type': this.constructor.name,
      id: this.id,
      ts: this.ts,
      uid: this.uid,
      hash: this.hash,
      collectible: this.collectible,
      collectibleAsset: this.collectibleAsset,
      collectibleNetwork: this.collectibleNetwork,
      paymentAsset: this.paymentAsset,
      paymentNetwork: this.paymentNetwork,
      paymentQuantity: this.paymentQuantity,
      bids: this.bids,
      status: this.status,
      winningBid: this.winningBid
    })
  }

  /**
   * Returns whether or not the specified user is a party to the
   * @param {[type]} uid  [description]
   * @returns {Boolean} [description]
   */
  isParty (uid) {
    return (
      (this.uid === uid) ||
      (this.winningBid && this.winningBid.uid === uid)
    )
  }

  /**
   * Cancels the auction
   * @returns {Auction}
   */
  cancel () {
    if (this.isCreated || (this.isOpened && this.bids > 0)) {
      INSTANCES.get(this).status = STATUS.CANCELLED
      return this
    }

    throw Error(`auction is currently ${this.status}!`)
  }

  /**
   * Places a bid on an the auction
   * @param {Bid} bid The bid to be added
   * @returns {Bid} The winning bid; may be different from the incoming bid
   */
  placeBid (bid) {
    if (!(bid instanceof Bid)) {
      throw Error('bid is not an instance of Bid!')
    } else if (this.status !== STATUS.OPENED) {
      throw Error(`auction is not ${STATUS.OPENED}`)
    }

    const obj = INSTANCES.get(this)
    const { bids } = obj
    const winningBid = bids[bids.length - 1]

    if ((winningBid != null) && (bid.price > winningBid.price)) {
      bids.push(bid)
    }

    return this.winningBid
  }
}
