/**
 * @file The Portal SDK
 */

const { BaseClass, Client, Store } = require('@portaldefi/core')
const Dex = require('./dex')
const Swaps = require('./swaps')

/**
 * The Portal SDK
 * @type {Sdk}
 */
module.exports = class Sdk extends BaseClass {
  /**
   * Creates a new instance of the Portal SDK
   * @param {Object} props Properties of the instance
   * @param {String} props.id Unique identifier of the instance
   * @param {Object} props.dex Properties of the dex
   * @param {Object} props.swaps Properties of the swaps
   */
  constructor (props) {
    super({ id: props.id })

    const bubbleEvents = emitter => emitter
      .on('log', (level, ...args) => this[level](...args))
      .on('error', (err, ...args) => this.emit('error', err, ...args))

    /**
     * Interface to the underlying network (browser/node.js)
     * @type {Network}
     */
    this.network = bubbleEvents(new Client({
      id: 'network',
      uid: props.id,
      hostname: props.hostname,
      port: props.port,
      pathname: props.pathname
    }))

    // Forward network events
    const forward = event => [event, (...args) => this.emit(event, ...args)]
    this.network
      // DEX events
      .on(...forward('order.created'))
      .on(...forward('order.opened'))
      .on(...forward('order.closed'))
      // Swap events
      .on(...forward('swap.received'))
      .on(...forward('swap.created'))
      .on(...forward('swap.holder.invoice.created'))
      .on(...forward('swap.holder.invoice.sent'))
      .on(...forward('swap.seeker.invoice.created'))
      .on(...forward('swap.seeker.invoice.sent'))
      .on(...forward('swap.holder.invoice.paid'))
      .on(...forward('swap.seeker.invoice.paid'))
      .on(...forward('swap.holder.invoice.settled'))
      .on(...forward('swap.seeker.invoice.settled'))

    /**
     * Interface to the store
     * @type {Store}
     */
    this.store = bubbleEvents(new Store(props.store))

    /**
     * Interface to the decentralized exchange
     * @type {Dex}
     */
    this.dex = bubbleEvents(new Dex({
      id: 'dex',
      network: this.network,
      store: this.store
    }))

    /**
     * Interface to atomic swaps
     * @type {Swaps}
     */
    this.swaps = bubbleEvents(new Swaps({
      id: 'swaps',
      network: this.network,
      store: this.store
    }))

    Object.freeze(this)
  }

  /**
   * Returns whether the SDK is connected to the network
   * @returns {Boolean}
   */
  get isConnected () {
    return this.network.isConnected
  }

  /**
   * Returns the JSON representation of the instance
   * @returns {Object}
   */
  toJSON () {
    return Object.assign(super.toJSON(), {
      network: this.network,
      store: this.store,
      dex: this.dex,
      swaps: this.swaps
    })
  }

  /**
   * Starts the Portal SDK
   * @returns {Promise<Sdk>}
   */
  async start () {
    this.info('starting', this)
    await this.network.connect()
    await this.dex.open()
    await this.swaps.sync()
    this.info('start', this)

    this.emit('start')
    return this
  }

  /**
   * Gracefully closes the Portal SDK.
   * @returns {Promise<Sdk>}
   */
  async stop () {
    this.info('stopping', this)
    await this.network.disconnect()
    await this.dex.close()
    await this.swaps.sync()
    this.info('stop', this)

    this.emit('stop')
    return this
  }
}
