#!/usr/bin/env node
/**
 * @file Runs the app in development mode
 */

const { Coordinator } = require('@portaldefi/coordinator')
const { Peer } = require('@portaldefi/peer')
const { join } = require('path')
const playnet = require('../../testing/etc/config.playnet')

/**
 * Sets up a watcher to restart the Peer instance, as needed
 * @returns {Void}
 */
;(async function main () {

  try {
    // start the coordinator
    const coordinator = new Coordinator(playnet.coordinator)
      .on('log', (level, ...args) => console.log(level, ...args))
      .on('error', err => { console.error(err); process.exit(-1) })
    this.coordinator = await coordinator.start()

    // start the peer
    const root = join(__dirname, '..', 'dist')
    const network = this.coordinator.toJSON()
    const peer = new Peer({ ...playnet.peers.alice, root, network })
      .on('log', (level, ...args) => console.log(level, ...args))
      .on('error', err => { console.error(err); process.exit(-1) })
    this.peer = await peer.start()

  } catch(err) {
    console.error(err)
    process.exit(-1)
  }
}())
