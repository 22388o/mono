/**
 * @file An interface to all supported blockchains
 */

const { BaseClass } = require('@portaldefi/core')
const { readdirSync, statSync } = require('fs')
const { basename, extname, join } = require('path')

/**
 * The names of all supported blockchains
 * @type {String[]}
 */
const BLOCKCHAINS = readdirSync(__dirname)
  .map(f => join(__dirname, f))
  .filter(f => statSync(f).isFile())
  .filter(f => extname(f) === '.js')
  .filter(f => f !== __filename)
  .map(f => basename(f, extname(f)))

/**
 * Expose the interface to all supported blockchains
 *
 * This class is expected to be a singleton in production-facing scenarios.
 *
 * @type {Blockchains}
 */
module.exports = class Blockchains extends BaseClass {
  constructor (sdk) {
    super()

    this.sdk = sdk

    BLOCKCHAINS.reduce((blockchains, name) => {
      const Blockchain = require(join(__dirname, name))
      blockchains[name] = new Blockchain(this)
      return blockchains
    }, this)

    Object.seal(this)
  }

  /**
   * The names of all supported blockchains
   * @type {String[]}
   */
  static get SUPPORTED () {
    return BLOCKCHAINS
  }

  /**
   * Initializes connections to all supported blockchains
   * @returns {Blockchain[]}
   */
  connect () {
    return Promise.all(BLOCKCHAINS.map(name => this[name].connect()))
  }

  /**
   * Gracefully closes connections to all supported blockchains
   * @returns {Blockchain[]}
   */
  disconnect () {
    return Promise.all(BLOCKCHAINS.map(name => this[name].disconnect()))
  }
}
