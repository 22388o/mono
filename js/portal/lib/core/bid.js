/**
 * @file Defines a single bid on an auction
 */

const { uuid } = require('../helpers')

/**
 * Defines a single bid on an auction
 * @type {Bid}
 */
module.exports = class Bid {
  constructor (props) {
    if (props.uid == null) {
      throw new Error('no uid specified!')
    } else if (typeof props.uid !== 'string' || props.uid.length <= 0) {
      throw new Error(`uid must be a string; got ${typeof props.uid}`)
    } else if (props.hash == null) {
      throw new Error('no hash specified!')
    }

    Object.seal(Object.assign(this, {
      id: props.id || uuid(),
      ts: props.ts || Date.now(),
      uid: props.uid,
      asset: props.asset,
      network: props.network,
      quantity: props.quantity
    }))
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
      ts: this.ts,
      uid: this.uid,
      asset: this.asset,
      network: this.network,
      quantity: this.quantity
    }

    return obj
  }
}
