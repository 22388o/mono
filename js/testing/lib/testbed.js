/**
 * @file Provides functions to manage the testbed
 */

const Playnet = require('./playnet')
const { compile, deploy } = require('./helpers')
const { expect } = require('chai')
const { writeFileSync } = require('fs')
const { join, resolve } = require('path')
const { inspect } = require('util')
const { Web3 } = require('web3')
const { Parcel } = require('@parcel/core')

/**
* Returns whether the tests are being run in debug mode
* @type {Boolean}
*/
const isDebugEnabled = process.argv.includes('--debug')

/**
* Returns whether the tests are being run in watch mode
* @type {Boolean}
*/
const isWatchEnabled = process.argv.includes('--watch')

/**
* Prints logs to the console with different log levels
* @type {Function}
*/
const logLevels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly']
const log = (level, ...args) => {
  if (logLevels.includes(level) && (isDebugEnabled || level === 'error')) {
    console.log(`[${level.toUpperCase()}]`, ...args.map(arg => inspect(arg, { showHidden: false, depth: null, colors: true })))
  }
}

/**
* Maps globally visible keys to their values for the duration of the tests
* @type {Object}
*/
const GLOBALS = { log, expect }

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

  // build the UI assets
  this.watcher = await buildApp()

  // start the playnet
  this.playnet = new Playnet(PLAYNET_PROPS)
  await this.playnet
    .on('log', (level, ...args) => log(level, ...args))
    .on('error', err => { console.error(err); process.exit(1) })
    .start()
}

/**
* Tears down the testbed
* @returns {Void}
*/
Testbed.afterAll = async function () {
  const { playnet, watcher, web3 } = this.test.ctx

  // stop the watcher
  try {
    await watcher.stop()
  } catch (err) {
    console.error(err)
  }

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

/**
 * Build the application using Parcel
 * @returns {Promise<void>}
 */
async function buildApp () {
  const entryFile = join(__dirname, '..', '..', 'app', 'src', 'index.jsx')
  const options = {
    entries: entryFile,
    defaultConfig: '@parcel/config-default'
  }

  const bundler = new Parcel(options)

  try {
    const { bundleGraph, buildTime } = await bundler.run()
    const bundles = bundleGraph.getBundles()
    log('info', `✨ Built ${bundles.length} bundles in ${buildTime}ms!`)
  } catch (err) {
    log('error', err.diagnostics)
    throw err
  }
}
