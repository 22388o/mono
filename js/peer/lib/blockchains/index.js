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
  constructor (props) {
    super({ id: 'blockchains' })

    this.ethereum = new Ethereum(props.ethereum)
      .on('log', (level, ...args) => this[level](...args))
      .on('error', (err, ...args) => this.emit('error', err, ...args))

    this.lightning = new Lightning(props.lightning)
      .on('log', (level, ...args) => this[level](...args))
      .on('error', (err, ...args) => this.emit('error', err, ...args))

    Object.freeze(this)
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
  async connect () {
    await this.ethereum.connect()
    await this.lightning.connect()
    this.emit('connect', this)
    return this
  }

  /**
   * Gracefully closes connections to all supported blockchains
   * @returns {Blockchain[]}
   */
  async disconnect () {
    await this.ethereum.disconnect()
    await this.lightning.disconnect()
    this.emit('disconnect', this)
    return this
  }
}
