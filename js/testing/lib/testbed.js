/**
 * @file Provides functions to manage the testbed
 */

const Playnet = require('./playnet')
const { compile, deploy } = require('./helpers')
const { expect } = require('chai')
const { writeFileSync } = require('fs')
const { inspect } = require('util')
const { Web3 } = require('web3')

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
 * The configuration for the testbed
 * @type {Array}
 */
const PLAYNET_PROPS = require('../etc/config.playnet')

/**
 * Export the Testbed functions
 * @type {Object}
 */
const Testbed = module.exports

/**
 * Spins up the testbed
 * @returns {Void}
 */
Testbed.beforeAll = async function () {
  // override/install globals
  for (const key in GLOBALS) {
    const existing = global[key]
    global[key] = GLOBALS[key]
    GLOBALS[key] = existing
  }

  // compile and deploy the smart-contracts, and export the abi/address details
  this.web3 = new Web3(process.env.PORTAL_ETHEREUM_URL)
  this.contracts = await deploy(await compile(), this.web3)
  const abiData = JSON.stringify(this.contracts, null, 2)
  const abiFile = process.env.PORTAL_ETHEREUM_CONTRACTS
  writeFileSync(abiFile, abiData)

  // start the playnet
  this.playnet = new Playnet(PLAYNET_PROPS)
  await this.playnet
    .on('log', (level, ...args) => debug(level, ...args))
    .on('error', err => debug(err))
    .start()
}

/**
 * Tears down the testbed
 * @returns {Void}
 */
Testbed.afterAll = async function () {
  const { playnet, web3 } = this.test.ctx

  // stop the playnet
  try {
    await playnet.stop()
  } catch (err) {
    console.error(err)
  }

  // tear down the web3 instance
  try {
    await web3.provider.disconnect()
  } catch (err) {
    console.error(err)
  }

  // override/install globals
  for (const key in GLOBALS) {
    const existing = global[key]
    global[key] = GLOBALS[key]
    GLOBALS[key] = existing
  }
}
