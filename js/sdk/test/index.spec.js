/**
 * @file Behavioral specification for the Portal SDK
 */

const { Parcel } = require('@parcel/core')
const { Coordinator } = require('@portaldefi/coordinator')
const { Peer } = require('@portaldefi/peer')
const { expect } = require('chai')
const { join } = require('path')
const { inspect } = require('util')
const pkg = require('../package.json')
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
 * Start the build
 */
let watcher = null
let ready = false
new Parcel({
  defaultConfig: '@parcel/config-default',
  source: join(__dirname, '..', pkg.source),
  distDir: join(__dirname, '..', 'dist'),
  targets: { module: pkg.targets.module, test: pkg.targets.test }
}).watch((err, event) => {
  if (err) {
    console.error('error', 'parcel.error', {
      '@type': 'Parcel',
      status: 'errored',
      error: err
    })
    if (!ready) throw err
  } else if (event.type === 'buildFailure') {
    console.error('error', 'parcel.error', {
      '@type': 'Parcel',
      status: 'failed',
      error: event.diagnostics
    })
    if (!ready) throw Error('build failed!')
  } else if (event.type === 'buildSuccess') {
    console.error('info', 'parcel.build', {
      '@type': 'Parcel',
      status: 'success',
      buildTime: event.buildTime
    })
  }

  if (typeof ready === 'function') {
    ready()
    ready = true
  }
}).then(result => {
  watcher = result
})

/**
 * Builds the module for node.js and the browser
 */
before('spin up the test environment', function (done) {
  // override/install globals
  for (const key in GLOBALS) {
    const existing = global[key]
    global[key] = GLOBALS[key]
    GLOBALS[key] = existing
  }

  // start the coordinator
  new Coordinator(playnet.coordinator)
    .on('log', (level, ...args) => debug(level, ...args))
    .on('error', err => { console.error(err); process.exit(-1) })
    .once('start', network => new Peer({
      ...playnet.peers.alice,
      root: join(__dirname, '..', 'dist', 'test'),
      network
    })
      .on('log', (level, ...args) => debug(level, ...args))
      .on('error', err => { console.error(err); process.exit(-1) })
      .once('start', () => {
        if (ready) {
          done()
        } else {
          ready = done
        }
      })
      .start()
      .then(peer => { this.peer = peer })
      .catch(done))
    .start()
    .then(coordinator => { this.coordinator = coordinator })
    .catch(done)
})

/**
 * Tear down the test environment
 */
after('teardown the test environment', async function () {
  // stop the peer
  await this.test.ctx.peer.stop()

  // stop the coordinator
  await this.test.ctx.coordinator.stop()

  // Stop the build watcher
  await watcher.unsubscribe()

  // override/install globals
  for (const key in GLOBALS) {
    const existing = global[key]
    global[key] = GLOBALS[key]
    GLOBALS[key] = existing
  }
})
