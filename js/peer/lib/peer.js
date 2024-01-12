/**
 * @file A peer node
 */

const Blockchains = require('./blockchains')
const Swaps = require('./swaps')
const { Client, Server, Store } = require('@portaldefi/core')
const { join } = require('path')

/**
 * Defines a peer node
 * @type {Peer}
 */
module.exports = class Peer extends Server {
  /**
   * Creates a new instance
   * @param {Object} props Properties of the peer
   * @param {String} props.id The unique identifier of the peer
   * @param {String} props.hostname The hostname of the interface to listen on
   * @param {Number} props.port The port to listen on
   * @param {Object} props.coordinator Coordinator connection parameters
   */
  constructor (props) {
    if (props == null) {
      throw Error('no properties specified!')
    } else if (props.id == null || typeof props.id !== 'string') {
      throw Error('expect props.id to be a string!')
    } else if (props.coordinator == null || typeof props.coordinator !== 'object') {
      throw Error('expect props.coordinator to be a object!')
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

    // initialize the client
    this.network = bubbleEvents(new Client({
      id: 'network',
      uid: props.id,
      hostname: props.coordinator.hostname,
      port: props.coordinator.port,
      pathname: props.coordinator.pathname
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
    await this.network.disconnect()
    await this.blockchains.disconnect()
    await this.swaps.sync()
    await this.store.close()
    return super.stop()
  }
}
