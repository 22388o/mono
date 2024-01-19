/**
 * @file A coordinator node
 */

const { Store } = require('@portaldefi/core')
const { join } = require('path')

const Http = require('./http')
const Dex = require('./dex')
const Swaps = require('./swaps')

/**
 * Defines a coordinator node
 * @type {Coordinator}
 */
class Coordinator extends Http {
  /**
   * Creates a new instance
   * @param {Object} props Properties of the coordinator
   * @param {String} props.id The unique identifier of the coordinator
   * @param {String} props.hostname The hostname of the interface to listen on
   * @param {Number} props.port The port to listen on
   */
  constructor (props) {
    if (props == null) {
      throw Error('no properties specified!')
    }

    super({
      id: props.id,
      hostname: props.hostname,
      port: props.port,
      api: join(__dirname, 'api')
    })

    const bubbleEvents = emitter => emitter
      .on('log', (level, ...args) => this[level](...args))
      .on('error', (err, ...args) => this.emit('error', err, ...args))

    // initialize the store
    this.store = bubbleEvents(new Store(props.store))

    // Interface to the decentralized exchange
    this.dex = bubbleEvents(new Dex({ store: this.store }))

    // Interface to the swaps
    this.swaps = bubbleEvents(new Swaps({ dex: this.dex, store: this.store }))

    Object.freeze(this)
  }

  /**
   * Returns the path to the default websocket for receiving updates
   * @returns {String}
   */
  get pathname () {
    return '/api/v1'
  }

  /**
   * Returns the JSON representation of the instance
   * @returns {Object}
   */
  toJSON () {
    return Object.assign(super.toJSON(), { pathname: this.pathname })
  }
}

/**
 * Export the class
 */
module.exports = { Coordinator }
