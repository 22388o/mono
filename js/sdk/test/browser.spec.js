/**
 * @file Behavioral specification for the SDK for node.js
 */

const puppeteer = require('puppeteer')

describe.only('SDK - browser', function () {
  let browser

  before('spin up puppeteer', async function () {
    try {
      browser = await puppeteer.launch({
        args: ['--window-size=1200,800'],
        defaultViewport: { width: 1200, height: 800 },
        headless: false,
        timeout: 10000
      })

      const pages = await browser.pages()
      const page = pages.length === 0
        ? await browser.newPage()
        : pages[pages.length - 1]
      await page.goto(this.test.ctx.peer.url)
    } catch (err) {
      console.error(err)
      process.exit(-1)
    }
  })

  it('must run tests in the browser', function (done) {

  })

  after('spin down puppeteer', async function () {
    await browser.close()
  })
})
