/**
 * @file A peer node
 */

const Coordinator = require('./coordinator')
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

    const serverProps = {
      id: props.id,
      hostname: props.hostname,
      port: props.port,
      root: props.root,
      api: join(__dirname, 'api'),
      ctx: {}
    }

    super(serverProps)

    // initialize the coordinator client
    const coordinatorProps = {
      id: 'coordinator',
      hostname: props.coordinator.hostname,
      port: props.coordinator.port,
      pathname: props.coordinator.pathname
    }
    this.coordinator = serverProps.ctx.coordinator = new Coordinator(coordinatorProps, this)
      .on('log', (level, ...args) => this[level](...args))
      .on('error', (err, ...args) => this.emit('error', err, ...args))

    Object.seal(this)
  }

  stop () {
    return this.coordinator.disconnect()
      .then(() => super.stop())
  }
}
