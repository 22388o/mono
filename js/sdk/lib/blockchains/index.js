/**
 * @file An interface to all supported blockchains
 */

const { BaseClass } = require('@portaldefi/core')
const Ethereum = require('./ethereum')
const Lightning = require('./lightning')

/**
 * Expose the interface to all supported blockchains
 *
 * This class is expected to be a singleton in production-facing scenarios.
 *
 * @type {Blockchains}
 */
module.exports = class Blockchains extends BaseClass {
  constructor (sdk, props) {
    super({ id: 'blockchains' })

    this.sdk = sdk

    this.ethereum = new Ethereum(sdk, props.ethereum)
      .on('log', (level, ...args) => this[level](...args))
    this.lightning = new Lightning(sdk, props.lightning)
      .on('log', (level, ...args) => this[level](...args))

    Object.seal(this)
  }

  /**
   * Returns the current state of the server as a JSON string
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
      ethereum: this.ethereum,
      lightning: this.lightning
    })
  }

  /**
   * Initializes connections to all supported blockchains
   * @returns {Blockchain[]}
   */
  connect () {
    return Promise.all([
      this.ethereum.connect(),
      this.lightning.connect()
    ])
  }

  /**
   * Gracefully closes connections to all supported blockchains
   * @returns {Blockchain[]}
   */
  disconnect () {
    return Promise.all([
      this.ethereum.disconnect(),
      this.lightning.disconnect()
    ])
  }
}
