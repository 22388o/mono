/**
 * @file Behavioral specification for the SDK for node.js
 */

const { Parcel } = require('@parcel/core')
const { mkdirSync, writeFileSync } = require('fs')
const { dirname, join } = require('path')
const puppeteer = require('puppeteer')

describe('SDK - browser', function () {
  const launchOpts = {
    args: ['--window-size=1200,800'],
    defaultViewport: { width: 1200, height: 800 },
    headless: false,
    timeout: 5000
  }

  before('spin up puppeteer', async function () {
    try {
      const { peer } = this.test.ctx
      const testDriver = join(__dirname, 'dist', 'index.html')

      // write out the index.html to load in the browser
      mkdirSync(dirname(testDriver), { recursive: true })
      writeFileSync(testDriver, `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>PortalDefi SDK Tests</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="icon" type="image/x-icon" href="../favicon.ico">
          <link rel="stylesheet" href="https://unpkg.com/mocha@10.2.0/mocha.css" />
        </head>
        <body>
          <div id="mocha"></div>
          <script>
            var sdkProps = {
              id: "${peer.id}",
              hostname: "${peer.hostname}",
              port: ${peer.port},
              pathname: "${peer.pathname}"
            }
          </script>
          <script type="module" src="../browser.js"></script>
        </body>
        </html>
      `)

      // bundle the test driver
      const bundler = new Parcel({
        defaultConfig: '@parcel/config-default',
        entries: testDriver,
        shouldDisableCache: true,
        logLevel: 'info',
        targets: {
          main: {
            distDir: peer.root,
            includeNodeModules: true
          }
        },
        additionalReporters: [{
          packageName: '@parcel/reporter-cli',
          resolveFrom: join(__dirname, '..')
        }]
      })
      await bundler.run()
    } catch (err) {
      console.error(err)
      process.exit(-1)
    }
  })

  it('must pass all browser tests', function (done) {
    let browser = null

    puppeteer.launch(launchOpts)
      .then(instance => {
        browser = instance
        return browser.pages()
      })
      .then(async pages => pages.length === 0
        ? await browser.newPage()
        : pages[pages.length - 1])
      .then(page => page
        .on('console', msg => {
          try {
            const text = msg.text()
            const json = JSON.parse(text)
            const { stats } = json

            if (stats.failures !== 0) {
              console.error('Failed Tests:')
              console.error(json.failures)
            }

            if (stats.pending !== 0) {
              console.error('Pending Tests:')
              console.error(json.pending)
            }

            page.browser().close()
            done()
          } catch (err) {
            console.error(err)
            process.exit(-1)
          }
        })
        .goto(this.test.ctx.peer.url))
      .catch(done)
  })
})
