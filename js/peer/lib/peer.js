/**
 * @file A peer node
 */

const { Network, Store } = require('@portaldefi/core')
const { join } = require('path')

const Http = require('./http')
const Blockchains = require('./blockchains')
const Swaps = require('./swaps')

/**
 * Defines a peer node
 * @type {Peer}
 */
class Peer extends Http {
  /**
   * Creates a new instance
   * @param {Object} props Properties of the peer
   * @param {String} props.id The unique identifier of the peer
   * @param {String} props.hostname The hostname of the interface to listen on
   * @param {Number} props.port The port to listen on
   * @param {String} [props.root] The root directory for static content
   * @param {Object} props.network Properties of the network
   * @param {Object} props.store Properties of the store
   */
  constructor (props) {
    if (props == null) {
      throw Error('no properties specified!')
    } else if (props.id == null || typeof props.id !== 'string') {
      throw Error('expect props.id to be a string!')
    }

    super({
      id: props.id,
      hostname: props.hostname,
      port: props.port,
      root: props.root,
      api: join(__dirname, 'api')
    })

    const bubbleEvents = emitter => emitter
      .on('log', (level, ...args) => this[level](...args))
      .on('error', (err, ...args) => this.emit('error', err, ...args))

    // initialize the network
    this.network = bubbleEvents(new Network({
      id: 'network',
      uid: props.id,
      hostname: props.network.hostname,
      port: props.network.port,
      pathname: props.network.pathname
    }))

    // initialize the store
    this.store = bubbleEvents(new Store(props.store))

    // initialize the blockchains
    this.blockchains = bubbleEvents(new Blockchains({
      ethereum: props.blockchains.ethereum,
      lightning: props.blockchains.lightning,
      network: this.network
    }))

    // initialize the swaps
    this.swaps = bubbleEvents(new Swaps({
      uid: props.id,
      network: this.network,
      store: this.store,
      blockchains: this.blockchains
    }))

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

  /**
   * @inheritdoc
   */
  async start () {
    await this.store.open()
    await this.swaps.sync()
    await this.blockchains.connect()
    await this.network.connect()
    return super.start()
  }

  /**
   * @inheritdoc
   */
  async stop () {
    const ret = await super.stop()
    await this.network.disconnect()
    await this.blockchains.disconnect()
    await this.swaps.sync()
    await this.store.close()
    return ret
  }
}

/**
 * Export the class
 */
module.exports = { Peer }
