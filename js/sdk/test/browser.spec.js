/**
 * @file Behavioral specification for the SDK for node.js
 */

const { Parcel } = require('@parcel/core')
const { writeFileSync } = require('fs')
const { join } = require('path')
const puppeteer = require('puppeteer')
const { inspect } = require('util')
const pkg = require('../package.json')

describe.only('SDK - browser', function () {
  let browser

  before('spin up puppeteer', async function () {
    try {
      // bundle the test driver
      const bundler = new Parcel({
        defaultConfig: '@parcel/config-default',
        entries: join(__dirname, 'tests.js'),
        logLevel: 'verbose',
        targets: {
          main: {
            includeNodeModules: true,
            distDir: this.test.ctx.peer.root
          }
        },
        additionalReporters: [{
          packageName: '@parcel/reporter-cli',
          resolveFrom: join(__dirname, '..')
        }]
      })
      await bundler.run()

      // write out the index.html to loadin the browser
      writeFileSync(join(__dirname, 'dist', 'index.html'), `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>PortalDefi SDK Tests</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="stylesheet" href="https://unpkg.com/mocha@10.2.0/mocha.css" />
        </head>
        <body>
          <div id="mocha"></div>
          <script src="https://unpkg.com/mocha@10.2.0/mocha.js"></script>
          <script src="https://unpkg.com/chai@4.4.1/chai.js"></script>
          <script>
            var expect = chai.expect
            mocha.setup('bdd')
          </script>
          <script src="tests.js"></script>
          <script>
            mocha.run()
          </script>
        </body>
        </html>
      `)

      // spin up the browser and load the test page
      this.browser = await puppeteer.launch({
        args: ['--window-size=1200,800'],
        defaultViewport: { width: 1200, height: 800 },
        headless: false,
        timeout: 5000
      })
      const pages = await this.browser.pages()
      const page = pages.length === 0
        ? await browser.newPage()
        : pages[pages.length - 1]
      await page.goto(this.test.ctx.peer.url)
    } catch (err) {
      console.error(inspect(err, { depth: null }))
      process.exit(-1)
    }
  })

  it('must run tests in the browser', function (done) {

  })

  after('spin down puppeteer', async function () {
    await this.test.ctx.browser.close()
  })
})
