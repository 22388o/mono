/**
 * @file Defines a swap and other related classes
 */

const { BaseClass, Util } = require('@portaldefi/core')

/**
 * An object mapping swap status strings to the expected order of transitions
 * @type {Object}
 */
const SWAP_STATUS = [
  'received',
  'created',
  'holder.invoice.created',
  'holder.invoice.sent',
  'seeker.invoice.created',
  'seeker.invoice.sent',
  'holder.invoice.paid',
  'seeker.invoice.paid',
  'holder.invoice.settled',
  'seeker.invoice.settled'
].reduce((obj, status, index) => {
  obj[status] = index
  return obj
}, {})

/**
 * Holds the private data of instances of classes
 * @type {WeakMap}
 */
const INSTANCES = new WeakMap()

/**
 * Defines a cross-chain swap between two parties
 * @type {Swap}
 */
module.exports = class Swap extends BaseClass {
  /**
   * Creates a new instance of a swap
   * @param {Object} props Properties of the instance
   * @param {Object} [opts] Options for the operation
   * @param {String} [opts.id] The unique identifier of the party
   */
  constructor (props, opts) {
    if (props == null) {
      throw Error('no properties provided for swap!')
    } else if (props.id != null && typeof props.id !== 'string') {
      throw Error(`expected id to be a string; got ${typeof props.id}!`)
    } else if (props.secretHash != null) {
      if (typeof props.id !== 'string') {
        throw Error(`expected secretHash to be a string; got ${typeof props.id}!`)
      } else if (props.secretHash.startsWith('0x')) {
        throw Error('expected secretHash to not include the leading "0x"')
      } else if (props.secretHash.length !== 64) {
        throw Error(`expected secretHash to be a sha256 hex-string; got ${props.secretHash}`)
      }
    } else if (props.secretHolder == null) {
      throw Error('no secretHolder provided!')
    } else if (props.secretSeeker == null) {
      throw Error('no secretSeeker provided!')
    }

    super({ id: props.id || Util.uuid() })

    this.secretHolder = new Party(props.secretHolder, this)
    this.secretSeeker = new Party(props.secretSeeker, this)

    //  the fields that may be updated, but never by any code outside this class
    INSTANCES.set(this, Object.seal({
      uid: opts && opts.id,
      status: props.status || 'received',
      secretHash: props.secretHash
    }))

    Object.freeze(this)
  }

  /**
   * Returns the hash of the secret used by the swap
   * @returns {String}
   */
  get secretHash () {
    return INSTANCES.get(this).secretHash
  }

  /**
   * Sets the secret hash for the swap and transitions to the 'created' state
   */
  set secretHash (val) {
    const state = INSTANCES.get(this)

    // TODO: Ensure only secret holder can set the secret hash
    if (state.secretHash == null) {
      state.secretHash = val
    } else {
      throw Error('cannot set secret hash anymore!')
    }
  }

  /**
   * Returns the current status of the swap
   * @returns {String}
   */
  get status () {
    return INSTANCES.get(this).status
  }

  /**
   * Sets the status of the swap
   * @param {String} val The new status of the swap
   * @returns {Void}
   */
  set status (val) {
    INSTANCES.get(this).status = val
  }

  /**
   * The owner of the SDK instance
   * @returns {Party}
   */
  get party () {
    return INSTANCES.get(this).uid === this.secretHolder.id
      ? this.secretHolder
      : this.secretSeeker
  }

  /**
   * Returns whether the party is the "holder" or "seeker"
   * @returns {String}
   */
  get partyType () {
    return this.party === this.secretHolder ? 'holder' : 'seeker'
  }

  /**
   * The party at the other end of the swap
   * @returns {Party}
   */
  get counterparty () {
    return INSTANCES.get(this).uid === this.secretSeeker.id
      ? this.secretHolder
      : this.secretSeeker
  }

  /**
   * Returns whether the counterparty is the "holder" or "seeker"
   * @returns {String}
   */
  get counterpartyType () {
    return this.party === this.secretSeeker ? 'holder' : 'seeker'
  }

  /**
   * Returns whether or not the swap is in the received state
   * @returns {Boolean}
   */
  get isReceived () {
    return this.status === 'received'
  }

  /**
   * Returns whether or not the swap is in the created state
   * @returns {Boolean}
   */
  get isCreated () {
    return this.status === 'created'
  }

  /**
   * Returns whether or not the swap is in the holder.invoice.created state
   * @returns {Boolean}
   */
  get isHolderInvoiceCreated () {
    return this.status === 'holder.invoice.created'
  }

  /**
   * Returns whether or not the swap is in the holder.invoice.sent state
   * @returns {Boolean}
   */
  get isHolderInvoiceSent () {
    return this.status === 'holder.invoice.sent'
  }

  /**
   * Returns whether or not the swap is in the seeker.invoice.created state
   * @returns {Boolean}
   */
  get isSeekerInvoiceCreated () {
    return this.status === 'seeker.invoice.created'
  }

  /**
   * Returns whether or not the swap is in the seeker.invoice.sent state
   * @returns {Boolean}
   */
  get isSeekerInvoiceSent () {
    return this.status === 'seeker.invoice.sent'
  }

  /**
   * Returns whether or not the swap is in the holder.invoice.paid state
   * @returns {Boolean}
   */
  get isHolderInvoicePaid () {
    return this.status === 'holder.invoice.paid'
  }

  /**
   * Returns whether or not the swap is in the seeker.invoice.paid state
   * @returns {Boolean}
   */
  get isSeekerInvoicePaid () {
    return this.status === 'seeker.invoice.paid'
  }

  /**
   * Returns whether or not the swap is in the holder.invoice.settled state
   * @returns {Boolean}
   */
  get isHolderInvoiceSettled () {
    return this.status === 'holder.invoice.settled'
  }

  /**
   * Returns whether or not the swap is in the seeker.invoice.settled state
   * @returns {Boolean}
   */
  get isSeekerInvoiceSettled () {
    return this.status === 'seeker.invoice.settled'
  }

  /**
   * Returns the JSON representation of the instance
   * @returns {Object}
   */
  toJSON () {
    const { status, secretHash, secretHolder, secretSeeker } = this
    const obj = { status, secretHash, secretHolder, secretSeeker }
    return Object.assign(super.toJSON(), obj)
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
   * Updates the swap instance
   *
   * This method is used when a JSON version of a swap is received from the
   * counterparty to update local state.
   *
   * @param {Object} swap The updated swap instance
   * @returns {Void}
   * @throws {Error}
   */
  update (swap) {
    // the unique identifier of the swap must not ever change!
    if (this.id !== swap.id) {
      throw Error('swap id mismatch!')
    }

    if (swap.secretHash == null) {
      throw Error('expected updated swap to have a secret-hash!')
    } else if (this.secretHash != null && this.secretHash !== swap.secretHash) {
      throw Error('secret-hash must not be changed once set!')
    }

    if (SWAP_STATUS[this.status] >= SWAP_STATUS[swap.status]) {
      throw Error(`cannot transition from ${this.status} to ${swap.status}!`)
    }

    this.secretHolder.update(swap.secretHolder)
    this.secretSeeker.update(swap.secretSeeker)

    const state = INSTANCES.get(this)
    state.status = swap.status
    state.secretHash = swap.secretHash
  }

  /**
   * Creates a Swap instance from a JSON object
   * @param {Object} obj The JSON representation of the swap
   * @param {Object} opts Configuration options for the operation
   * @param {String} opts.id The unique identifier of the party
   * @returns {Swap}
   */
  static fromJSON (obj, opts) {
    return new Swap(obj, opts)
  }

  /**
   * Creates a swap from a pair of orders that were matched
   *
   * The protocol followed here is as follows:
   * - The ID of the swap is the hash of the IDs of the orders
   * - The maker becomes the secret holder
   * - The taker becomes the secret seeker
   *
   * @param {Order} maker The maker of the order
   * @param {Order} taker The taker of the order
   * @returns {Swap}
   */
  static async fromOrders (maker, taker) {
    return new Swap({
      id: await Util.hash(maker.id, taker.id),
      secretHolder: {
        id: maker.uid,
        oid: maker.id,
        asset: maker.isAsk ? maker.baseAsset : maker.quoteAsset,
        blockchain: maker.isAsk ? maker.baseNetwork : maker.quoteNetwork,
        quantity: maker.isAsk ? maker.baseQuantity : maker.quoteQuantity
      },
      secretSeeker: {
        id: taker.uid,
        oid: taker.id,
        asset: taker.isAsk ? taker.baseAsset : taker.quoteAsset,
        blockchain: taker.isAsk ? taker.baseNetwork : taker.quoteNetwork,
        quantity: taker.isAsk ? taker.baseQuantity : taker.quoteQuantity
      }
    })
  }
}

/**
 * Abstracts the notion of a party to a swap
 * @type {Party}
 */
class Party {
  constructor (props, swap) {
    this.swap = swap

    this.id = props.id
    this.oid = props.oid
    this.asset = props.asset
    this.quantity = props.quantity
    this.blockchain = props.blockchain

    INSTANCES.set(this, Object.seal({
      invoice: props.invoice || null,
      payment: props.payment || null,
      receipt: props.receipt || null
    }))

    Object.freeze(this)
  }

  /**
   * Returns whether or not the party is the secret holder
   * @returns {Boolean}
   */
  get isHolder () {
    return this.swap.secretHolder === this
  }

  /**
   * Returns whether or not the party is the secret seeker
   * @returns {Boolean}
   */
  get isSeeker () {
    return this.swap.secretSeeker === this
  }

  /**
   * Returns the invoice to be paid by the party
   */
  get invoice () {
    return INSTANCES.get(this).invoice
  }

  /**
   * Sets the invoice to be paid by the party
   * @returns {Void}
   */
  set invoice (val) {
    const state = INSTANCES.get(this)
    if (state.invoice != null) {
      throw Error('invoice already created!')
    }

    state.invoice = val
  }

  /**
   * Returns the details of the payment by the party
   */
  get payment () {
    return INSTANCES.get(this).payment
  }

  /**
   * Sets the details of the payment by the party
   * @returns {Void}
   */
  set payment (val) {
    const state = INSTANCES.get(this)
    if (state.payment != null) {
      throw Error('payment already created!')
    }
    state.payment = val
  }

  /**
   * Returns the settlement receipt
   */
  get receipt () {
    return INSTANCES.get(this).receipt
  }

  /**
   * Sets the settlement receipt
   * @returns {Void}
   */
  set receipt (val) {
    const state = INSTANCES.get(this)
    if (state.receipt != null) {
      throw Error('receipt already created!')
    }
    state.receipt = val
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
    return {
      id: this.id,
      oid: this.oid,
      asset: this.asset,
      quantity: this.quantity,
      blockchain: this.blockchain,
      invoice: this.invoice,
      payment: this.payment,
      receipt: this.receipt
    }
  }

  /**
   * Updates the party instance
   * @param {Party} party
   */
  update (party) {
    if (this.id !== party.id) {
      throw Error('cannot modify party id anymore!')
    }

    if (this.asset !== party.asset) {
      throw Error('cannot modify party asset anymore!')
    }

    if (this.quantity !== party.quantity) {
      throw Error('cannot modify party quantity anymore!')
    }

    if (this.blockchain !== party.blockchain) {
      throw Error('cannot modify party blockchain anymore!')
    }

    // TODO: Fix this check to be more rigorous
    if (this.invoice == null && party.invoice != null) {
      this.invoice = party.invoice
    }

    if (this.payment == null && party.payment != null) {
      this.payment = party.payment
    }
  }
}
