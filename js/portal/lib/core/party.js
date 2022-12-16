/**
 * @file Defines a party to an atomic swap
 */

/**
 * Defines a party to a swap
 * @type {Party}
 */
module.exports = class Party {
  /**
   * Creates a new instance of a party to a swap
   * @param {Object} props Properties of the instance
   * @param {String} props.id The unique identifier of the party
   * @param {Asset} props.asset The asset which the party wants to trade
   * @param {Network} props.network The network on which the party holds assets
   * @param {Number} props.quantity The quantity of the asset being traded
   */
  constructor (props) {
    if (props == null) {
      throw Error('no properties specified for the party!')
    } else if (props.id == null) {
      throw Error('unique identifier of the user was not specified!')
    }

    this.id = props.id
    this.asset = props.asset
    this.network = props.network
    this.quantity = props.quantity

    this.swap = null // assigned by the swap constructor
    this.state = {} // populated by the user/client over http/rpc
    this.publicInfo = { left: {}, right: {} }
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
    return this.swap && this.swap.secretHolder === this
  }

  /**
   * Returns whether or not the party is the secret seeker
   * @returns {Boolean}
   */
  get isSecretSeeker () {
    return this.swap && this.swap.secretSeeker === this
  }

  /**
   * Opens a swap for a single party
   *
   * The secret holder is expected to open first, followed by the secret seeker.
   * All other cases will error out.
   *
   * @returns {Promise<Party>}
   */
  open () {
    if ((this.swap.isCreated && this.isSecretSeeker) ||
        (this.swap.isOpening && this.isSecretHolder)) {
      return this.counterparty.network.open(this)
    }

    if ((this.swap.isCreated && this.isSecretHolder)) {
      return Promise.reject(Error('waiting for secret seeker to open!'))
    } else if ((this.swap.isOpening && this.isSecretSeeker)) {
      return Promise.reject(Error('swap already opened!'))
    } else {
      return Promise.reject(Error('undefined behavior!'))
    }
  }

  /**
   * Commits to a swap for a single party
   * @returns {Promise<Party>}
   */
  commit () {
    if ((this.swap.isOpened && this.isSecretHolder) ||
        (this.swap.isCommitting && this.isSecretSeeker)) {
      // NOTE: this time around we commit to the counterparty's network
      return this.counterparty.network.commit(this)
    }

    if ((this.swap.isOpened && this.isSecretSeeker)) {
      return Promise.reject(Error('waiting for secret holder to commit!'))
    } else if ((this.swap.isCommitting && this.isSecretHolder)) {
      return Promise.reject(Error('swap already committed!'))
    } else {
      return Promise.reject(Error('undefined behavior!'))
    }
  }

  /**
   * Gracefully aborts a swap for a single party
   * @returns {Promise<Party>}
   */
  abort () {
    return Promise.reject(Error('not implemented yet!'))
  }

  /**
   * Returns the current state of the instance
   * @type {String}
   */
  [Symbol.for('nodejs.util.inspect.custom')] () {
    return this.toJSON()
  }

  /**
   * Returns the JSON representation of this instance
   * @returns {Object}
   */
  toJSON () {
    const obj = {
      '@type': this.constructor.name,
      id: this.id,
      swapId: this.swap && this.swap.id,
      asset: this.asset,
      network: this.network,
      quantity: this.quantity,
      state: this.state,
      publicInfo: this.publicInfo,
      isSecretSeeker: this.isSecretSeeker,
      isSecretHolder: this.isSecretHolder
    }

    return obj
  }

  /**
   * Creates a secret-holding party from the an order from the matching engine
   * @param {Order} order An order (maker or taker) returned by order matching
   * @returns {Party}
   */
  static fromOrder (order, ctx) {
    const asset = order.isAsk ? order.baseAsset : order.quoteAsset
    const network = order.isAsk ? order.baseNetwork : order.quoteNetwork
    const quantity = order.isAsk ? order.baseQuantity : order.quoteQuantity

    return new Party({
      id: order.uid,
      asset: ctx.assets[asset],
      network: ctx.networks[network],
      quantity
    })
  }
}
