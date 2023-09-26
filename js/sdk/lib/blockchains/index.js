/**
 * @file An interface to all supported blockchains
 */

const { BaseClass } = require('@portaldefi/core')
const Bitcoin = require('./bitcoin')
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
    super()

    this.sdk = sdk

    this.bitcoin = new Bitcoin(this, props.bitcoin)
    this.ethereum = new Ethereum(this, props.ethereum)
    this.lightning = new Lightning(this, props.lightning)

    Object.seal(this)
  }

  /**
   * Initializes connections to all supported blockchains
   * @returns {Blockchain[]}
   */
  connect () {
    return Promise.all([
      this.bitcoin.connect(),
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
      this.bitcoin.disconnect(),
      this.ethereum.disconnect(),
      this.lightning.disconnect()
    ])
  }
}
