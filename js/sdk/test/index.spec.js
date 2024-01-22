/**
 * @file Behavioral specification for the Portal SDK
 */

const { Coordinator } = require('@portaldefi/coordinator')
const { Peer } = require('@portaldefi/peer')
const { expect } = require('chai')
const { join } = require('path')
const { inspect } = require('util')
const playnet = require('../../testing/etc/config.playnet')

/**
 * Returns whether the tests are being run in debug mode
 * @type {Boolean}
 */
const isDebugEnabled = process.argv.includes('--debug')

/**
 * Prints logs to the console, when debug mode is enabled
 * @type {Function}
 */
const opts = { showHidden: false, depth: null, colors: true }
const debug = isDebugEnabled
  ? (...args) => console.error(...(args.map(arg => inspect(arg, opts))), '\n\n')
  : function () { }

/**
 * Maps globally visible keys to their values for the duration of the tests
 *
 * The keys/values set here override any existing globals for the duration of
 * the tests.
 *
 * @type {Object}
 */
const GLOBALS = { debug, expect }

/**
 * The root directory to serve the HTML assets from
 * @type {String}
 */
const root = join(__dirname, 'dist')

/**
 * Builds the module for node.js and the browser
 */
before('spin up the test environment', async function () {
  // override/install globals
  for (const key in GLOBALS) {
    const existing = global[key]
    global[key] = GLOBALS[key]
    GLOBALS[key] = existing
  }

  // start the coordinator
  const coordinator = new Coordinator(playnet.coordinator)
    .on('log', (level, ...args) => debug(level, ...args))
    .on('error', err => { console.error(err); process.exit(-1) })
  this.coordinator = await coordinator.start()

  // start the peer
  const network = this.coordinator.toJSON()
  const peer = new Peer({ ...playnet.peers.alice, root, network })
    .on('log', (level, ...args) => debug(level, ...args))
    .on('error', err => { console.error(err); process.exit(-1) })
  this.peer = await peer.start()

  // expose the peer properties globally to be consistent with the browser tests
  global.sdkProps = {
    id: 'sdk',
    hostname: this.peer.hostname,
    port: this.peer.port,
    pathname: this.peer.pathname
  }
})

/**
 * Tear down the test environment
 */
after('teardown the test environment', async function () {
  global.sdkProps = null

  // stop the peer
  await this.test.ctx.peer.stop()

  // stop the coordinator
  await this.test.ctx.coordinator.stop()

  // override/install globals
  for (const key in GLOBALS) {
    const existing = global[key]
    global[key] = GLOBALS[key]
    GLOBALS[key] = existing
  }
})
