/**
 * @file A peer node
 */

const { Server } = require('@portaldefi/core')
const { join } = require('path')

/**
 * Defines a peer node
 * @type {Peer}
 */
module.exports = class Peer extends Server {
  /**
   * Creates a new instance
   * @param {Object} props Properties of the peer
   */
  constructor (props) {
    const ctx = {}

    super(Object.assign({
      id: 'peer'
    }, props, {
      api: join(__dirname, 'api'),
      ctx
    }))

    Object.freeze(this)
  }
}
