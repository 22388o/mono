/**
 * @file Behavioral testing environment for the network
 */

const Server = require('../../../portal/lib/core/server')
const chai = require('chai')
const puppeteer = require('puppeteer')

/**
 * Returns whether the tests are being run in debug mode
 * @type {Boolean}
 */
const isDebugEnabled = process.argv.includes('--debug')

/**
 * Maps globally visible keys to their values for the duration of the tests
 *
 * The keys/values set here override any existing globals for the duration of
 * the tests.
 *
 * @type {Object}
 */
const GLOBALS = {
  debug: isDebugEnabled ? console.debug : function () {},
  expect: chai.expect
}

before('setup the test environment', async function () {
  // override/install globals
  for (const key in GLOBALS) {
    const existing = global[key]
    global[key] = GLOBALS[key]
    GLOBALS[key] = existing
  }

  this.peer = new Server()
  await this.peer
    .on('log', debug)
    .start()

  this.browser = await puppeteer.launch({
    args: [],
    headless: isDebugEnabled ? false : 'new',
    slowMo: isDebugEnabled ? 100 : 0
  })
})

describe('Network', function () {
  require('./node')
})

after('tear down the test environment', async function () {
  const { browser, peer } = this.test.ctx
  await browser.close()
  await peer.stop()
})
