/**
 * @file Defines a playnet setup used for testing
 */

const { BaseClass } = require('@portaldefi/core')
const { Coordinator } = require('@portaldefi/coordinator')
const { Peer } = require('@portaldefi/peer')
const { Sdk } = require('@portaldefi/sdk')

/**
 * Defines a playnet
 * @type {Playnet}
 */
module.exports = class Playnet extends BaseClass {
  constructor (props) {
    if (props == null) {
      throw Error('no props specified!')
    } else if (props.id != null && typeof props.id !== 'string') {
      throw Error('expected props.id to be a string!')
    } else if (typeof props.coordinator !== 'object') {
      throw Error('expected props.coordinator to be an object!')
    } else if (typeof props.peers !== 'object') {
      throw Error('expected props.peers to be an object!')
    }

    super({ id: props.id || 'playnet' })

    this.coordinator = new Coordinator(props.coordinator)
    this.peers = props.peers
    this.sdks = {}
    this.browsers = {}

    Object.freeze(this)
  }

  /**
   * Starts the playnet
   * @returns {Promise<Void>}
   */
  async start () {
    try {
      // start the coordinator first
      const { coordinator } = this
      coordinator
        .on('log', (level, ...args) => this[level](...args))
        .on('error', (err, ...args) => this.emit('error', err, ...args))
      await coordinator.start()

      // then start the peers
      for (const id in this.peers) {
        const props = Object.assign({}, this.peers[id], { id, coordinator })
        const peer = new Peer(props)
          .on('log', (level, id, ...args) => this[level](`peers.${id}`, ...args))
          .on('error', (err, ...args) => this.emit('error', err, ...args))
        this.peers[id] = await peer.start()
      }

      // then start the SDKs
      for (const id in this.peers) {
        const peer = this.peers[id]
        const sdk = new Sdk(peer)
          .on('log', (level, id, ...args) => this[level](`sdks.${id}`, ...args))
          .on('error', (err, ...args) => this.emit('error', err, ...args))
        this.sdks[id] = await sdk.start()
      }
    } catch (err) {
      this.error('start', err, this)
      throw err
    }
  }

  /**
   * Stops the playnet
   * @returns {Promise<Void>}
   */
  async stop () {
    try {
      for (const id in this.sdks) {
        const sdk = this.sdks[id]
        await sdk.stop()
      }

      for (const id in this.peers) {
        const peer = this.peers[id]
        await peer.stop()
      }

      this.coordinator.stop()
    } catch (err) {
      this.error('stop', err, this)
      this.emit(err)
    }
  }
}
