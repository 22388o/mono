/**
 * @file Defines an instance of an atomic swap
 */

const BaseClass = require('./base_class')
const { hash, uuid } = require('./util')

/**
 * An enum of swap states
 * @type {Array}
 */
const SWAP_STATUS = [
  'created',
  'opening',
  'opened',
  'committing',
  'committed',
  'aborting',
  'aborted'
]

/**
 * Holds the private data of instances of classes
 * @type {WeakMap}
 */
const INSTANCES = new WeakMap()

/**
 * An instance of an Atomic Swap
 * @type {Swap}
 */
module.exports = class Swap extends BaseClass {
  /**
   * Creates a new Swap instance
   * @param {Object} props Properties of the atomic swap
   * @param {String} props.id The unique identifier of the atomic swap
   * @param {String} props.secretHash The hash of the secret of the atomic swap
   * @param {String} [props.status] The current status of the swap
   */
  constructor (props) {
    super({ id: props.id })

    this.secretHash = props.secretHash
    this.secretHolder = new Party(this, props.secretHolder)
    this.secretSeeker = new Party(this, props.secretSeeker)
    this.status = props.status || SWAP_STATUS[0]

    Object.seal(this)

    // Fire the event after allowing time for handlers to be registerd
    setImmediate(() => this.emit(this.status, this))
  }

  /**
   * Returns whether or not the swap is in the `created` state
   * @returns {Boolean}
   */
  get isCreated () {
    return this.status === SWAP_STATUS[0]
  }

  /**
   * Returns whether or not the swap is in the `opening` state
   * @returns {Boolean}
   */
  get isOpening () {
    return this.status === SWAP_STATUS[1]
  }

  /**
   * Returns whether or not the swap is in the `opened` state
   * @returns {Boolean}
   */
  get isOpened () {
    return this.status === SWAP_STATUS[2]
  }

  /**
   * Returns whether or not the swap is in the `committing` state
   * @returns {Boolean}
   */
  get isCommitting () {
    return this.status === SWAP_STATUS[3]
  }

  /**
   * Returns whether or not the swap is in the `committed` state
   * @returns {Boolean}
   */
  get isCommitted () {
    return this.status === SWAP_STATUS[4]
  }

  /**
   * Returns whether or not the swap is in the `aborting` state
   * @returns {Boolean}
   */
  get isAborting () {
    return this.status === SWAP_STATUS[5]
  }

  /**
   * Returns whether or not the swap is in the `aborted` state
   * @returns {Boolean}
   */
  get isAborted () {
    return this.status === SWAP_STATUS[6]
  }

  /**
   * Returns the current state of the instance as a JSON string
   * @type {String}
   */
  [Symbol.for('nodejs.util.inspect.custom')] () {
    return this.toJSON()
  }

  /**
   * Returns the JSON representation of the swap
   * @returns {Object}
   */
  toJSON () {
    return Object.assign(super.toJSON(), {
      status: this.status,
      secretHash: this.secretHash,
      secretHolder: this.secretHolder,
      secretSeeker: this.secretSeeker
    })
  }

  /**
   * Returns whether or not the specified user is a party to the swap
   * @param {Party|Object} party.id The unique identifier of the party
   * @returns {Boolean}
   */
  isParty (party) {
    const { secretHolder, secretSeeker } = this
    return secretHolder.id === party.id || secretSeeker.id === party.id
  }

  /**
   * Creates an instance of a swap from a JSON object
   * @param {Object} obj The JSON object to recreate the Swap instance from
   * @returns {Swap}
   */
  static fromJSON (obj) {
    return new Swap(obj)
  }

  /**
   * Creates an atomic swap for settling a pair of orders
   * @param {Order} maker The maker of the order
   * @param {Order} taker The taker of the order
   * @returns {Swap}
   */
  static fromOrders (maker, taker) {
    return new Swap({
      id: hash(maker.id, taker.id),
      secretHash: maker.hash,
      secretHolder: {
        id: maker.uid,
        asset: maker.isAsk ? maker.baseAsset : maker.quoteAsset,
        blockchain: maker.isAsk ? maker.baseNetwork : maker.quoteNetwork,
        quantity: maker.isAsk ? maker.baseQuantity : maker.quoteQuantity
      },
      secretSeeker: {
        id: taker.uid,
        asset: taker.isAsk ? taker.baseAsset : taker.quoteAsset,
        blockchain: taker.isAsk ? taker.baseNetwork : taker.quoteNetwork,
        quantity: taker.isAsk ? taker.baseQuantity : taker.quoteQuantity
      }
    })
  }
}

/**
 * Defines a party to a swap
 * @type {Party}
 */
class Party {
  constructor (swap, props) {
    /**
     * The parent swap for the party
     * @type {Swap}
     */
    this.swap = swap

    /**
     * The unique identifier of the user
     * @type {String}
     */
    this.id = props.id
    /**
     * The unique identifier of the asset
     * @type {String}
     */
    this.asset = props.asset
    /**
     * The unique identifier of the blockchain
     * @type {String}
     */
    this.blockchain = props.blockchain
    /**
     * The quantity of the asset being traded
     * @type {Number}
     */
    this.quantity = props.quantity
    /**
     * The invoice to be paid by the party
     * @type {String}
     */
    this.invoice = null

    Object.seal(this)
  }

  /**
   * Returns the counterparty to the swap
   * @returns {Party}
   */
  get counterparty () {
    if (this.isSecretHolder) {
      return this.swap.secretSeeker
    } else if (this.isSecretSeeker) {
      return this.swap.secretHolder
    } else {
      throw Error('cannot use .counterparty in multi-party swap!')
    }
  }

  /**
   * Returns whether or not the party is the secret holder
   * @returns {Boolean}
   */
  get isSecretHolder () {
    return this.swap.secretHolder === this
  }

  /**
   * Returns whether or not the party is the secret seeker
   * @returns {Boolean}
   */
  get isSecretSeeker () {
    return this.swap.secretSeeker === this
  }

  /**
   * Returns the current state of the instance as a JSON string
   * @type {String}
   */
  [Symbol.for('nodejs.util.inspect.custom')] () {
    return this.toJSON()
  }

  /**
   * Returns the JSON representation of the party
   * @returns {Object}
   */
  toJSON () {
    return {
      '@type': this.constructor.name,
      swap: { id: this.swap.id },
      id: this.id,
      asset: this.asset,
      quantity: this.quantity,
      blockchain: this.blockchain,
      invoice: this.invoice
    }
  }
}
