/**
 * @file Behavioral specification for the Portal SDK for use in the browser
 */

const config = require('../etc/config.dev')
const { Parcel } = require('@parcel/core')
const Peer = require('@portaldefi/peer')
const chai = require('chai')
const { rmSync, writeFileSync } = require('fs')
const { join } = require('path')
const puppeteer = require('puppeteer')

describe('Portal SDK for the browser', function () {
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

  /**
   * Options to be passed to puppeteer
   * @type {Object}
   */
  const PUPPETEER_OPTS = {
    headless: false,
    timeout: this.timeout
  }

  /**
   * The HTML entry point
   * @type {String}
   */
  const htmlFile = 'index.html'

//   /**
//    * HTML page to build and load to run mocha tests in the browser
//    * @type {String}
//    */
//   const HTML = `<!DOCTYPE html>
// <html lang="en">
//   <head>
//     <title>PortalDefi SDK Testing</title>
//     <meta charset="utf-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//     <link rel="stylesheet" href="node_modules/mocha/mocha.css" />
//   </head>
//   <body>
//     <div id="mocha"></div>
//     <script src="node_modules/mocha/mocha.js"></script>
//     <script src="node_modules/chai/chai.js"></script>
//     <script>
//       var expect = chai.expect
//       mocha.setup('bdd')
//       window.onload = function () {
//         mocha.checkLeaks()
//         mocha.run()
//       }
//     </script>
//     <script type="module" src="index.js"></script>
//     </body>
// </html>`

  /**
   * Sets up the testing environment
   * - Sets up global functions for use within tests
   * - Initializes and starts a peer node
   * - Bundle's the browser tests
   * - Launches the browser
   */
  before('Setup the test environment', async function () {
    // override/install globals
    for (const key in GLOBALS) {
      const existing = global[key]
      global[key] = GLOBALS[key]
      GLOBALS[key] = existing
    }

    // build the HTML
    const distDir = join(__dirname, 'dist')
    try {
      rmSync(distDir, { recursive: true })
    } catch (err) {
      if (err.code !== 'ENOENT') throw err
    }
    // writeFileSync(htmlFile, HTML)

    // bundle the browser tests
    const bundler = new Parcel({
      entries: join(__dirname, htmlFile),
      targets: { testing: { distDir } },
      defaultConfig: '@parcel/config-default'
    })
    console.log(await bundler.run())

    // start the peer node
    this.peer = await new Peer({ ...config.network, root: distDir })
      .on('log', (...args) => isDebugEnabled
        ? console.log(...args)
        : function () {})
      .start()

    // launch the browser
    this.browser = await puppeteer.launch(PUPPETEER_OPTS)
    this.page = await this.browser.newPage()
  })

  /**
   * Tears down the testing environment
   * - Closes the browser
   * - Stops the peer
   * - Restores the global functions that were overridden during setup
   */
  after('Teardown the test environment', async function () {
    // close the browser
    await this.test.ctx.browser.close()

    // stop the peer
    await this.test.ctx.peer.stop()

    // override/install globals
    for (const key in GLOBALS) {
      const existing = global[key]
      global[key] = GLOBALS[key]
      GLOBALS[key] = existing
    }
  })

  /**
   * Ensure the Peer is up and running, and ready for testing
   */
  it('must initilize a peer for the test environment', function () {
    expect(this.test.ctx.peer.isListening).to.equal(true)
  })

  /**
   * Ensure the browser/page instace is up and running, and ready for testing
   */
  it('must initialize one or more SDK instances for every user', function () {
    expect(this.test.ctx.browser).to.be.an('object')
    expect(this.test.ctx.page).to.be.an('object')
  })

  /**
   * Route the test results from the browser to the terminal
   */
  it('must run the tests in the browser', async function () {
    const { hostname, port } = this.test.ctx.peer
    await this.page.goto(`http://${hostname}:${port}/${htmlFile}`)
    await new Promise((resolve, reject) => setTimeout(resolve, 30000))
  })
})
