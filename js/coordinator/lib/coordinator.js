/**
 * @file A coordinator node
 */

const Dex = require('./dex')
const Swaps = require('./swaps')
const { Server } = require('@portaldefi/core')
const { join } = require('path')

/**
 * Defines a coordinator node
 * @type {Coordinator}
 */
module.exports = class Coordinator extends Server {
  /**
   * Creates a new instance
   * @param {Object} props Properties of the coordinator
   */
  constructor (props) {
    const ctx = {
      dex: new Dex(),
      swaps: new Swaps()
    }

    super(Object.assign({
      id: 'coordinator'
    }, props, {
      api: join(__dirname, 'api'),
      ctx
    }))

    // Trigger the creation of a swap whenever an order match occurs
    ctx.dex.on('match', (...args) => ctx.swaps.fromOrders(...args))

    // Propagate the log events
    ctx.dex.on('log', (level, ...args) => this[level](...args))
    ctx.swaps.on('log', (level, ...args) => this[level](...args))

    Object.freeze(this)
  }

  /**
   * Returns the JSON representation of the instance
   * @returns {Object}
   */
  toJSON () {
    return Object.assign(super.toJSON(), {
      pathname: this.pathname
    })
  }

  /**
   * Returns the path to the default websocket for receiving updates
   * @returns {String}
   */
  get pathname () {
    return '/api/v1'
  }
}
