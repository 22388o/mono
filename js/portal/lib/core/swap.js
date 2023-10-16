/**
 * @file Defines a swap
 */

const { BaseClass, Util } = require('@portaldefi/core')
const { Util } = require('@portaldefi/core')

/**
 * Holds the private data of instances of classes
 * @type {WeakMap}
 */
const INSTANCES = new WeakMap()

module.exports = class Swap {
  constructor(props, ctx) {
    this.ctx = ctx

    this.id = props.id

    INSTANCES.set(this, Object.seal({
      status: props.status || 'received',
      secretHash: props.secretHash,
      secretHolder: new Party(this, props.secretHolder),
      secretSeeker: new Party(this, props.secretSeeker),
    }))

    Object.freeze(this)
  }

  /**
   * Returns the current status of the swap
   * @returns {String}
   */
  get status () {
    return INSTANCES.get(this).status
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
    if (state.secretHash != null) {
      throw Error('cannot set secret hash anymore!')
    }

    state.secretHash = val
    state.status = 'created'
  }

  /**
   * Returns the secret holding party
   * @returns {String}
   */
  get secretHolder () {
    return INSTANCES.get(this).secretHolder
  }

  /**
   * Returns the secret seeking party
   * @returns {String}
   */
  get secretSeeker () {
    return INSTANCES.get(this).secretSeeker
  }

  /**
   * The owner of the SDK instance
   * @returns {Party}
   */
  get party () {
    return this.sdk.id === this.secretHolder.id
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
    return this.sdk.id == this.secretSeeker.id
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
    const { id, status, secretHash, party, counterparty } = this
    return {
      '@type': this.constructor.name,
      id,
      status,
      secretHash,
      party,
      counterparty
    }
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
   * @param {Object} deps Injected dependences
   * @returns {Swap}
   */
  static fromOrder (maker, taker, deps) {
    return new Swap(deps, {
      id: Util.hash(maker.id, taker.id),
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
