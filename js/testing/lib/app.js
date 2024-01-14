/**
 * @file Defines the web-app as a class for UI testing
 */

const { BaseClass } = require('@portaldefi/core')
const puppeteer = require('puppeteer')

/**
 * A weak-map storing private data for each instance of the class
 * @type {WeakMap}
 */
const INSTANCES = new WeakMap()

/**
 * Export the App page-object model
 * @type {App}
 */
module.exports = class App extends BaseClass {
  /**
   * Constructs a new instance of the App page-object model for a user
   *
   * The App page-object model abstracts the web-app UI to expose simple methods
   * that may be used for the purpose of UI testing.
   *
   * @param {Object} props Properties of the instance
   * @param {String} props.id The unique identifier of the user
   * @constructor
   */
  constructor (props) {
    super({ id: props.id })

    this.hostname = props.hostname
    this.port = props.port
    this.browser = props.browser

    INSTANCES.set(this, {
      browser: null,
      page: null
    })

    Object.freeze(this)
  }

  /**
   * Opens a new browser tab and navigates to the specified url
   * @returns {Promise<Void>}
   */
  async start () {
    try {
      const state = INSTANCES.get(this)

      // launch a browser window
      state.browser = await puppeteer.launch(this.browser)

      // create a new page/tab, if needed
      const pages = await state.browser.pages()
      state.page = pages.length === 0
        ? await state.browser.newPage()
        : pages[pages.length - 1]

      // navigate to the peer's entry point
      const url = `http://${this.hostname}:${this.port}/`
      this.info(`${this.id}.open`, { url })
      await state.page.goto(url)

      return this
    } catch (err) {
      this.error(err)
      this.emit('error', err)
    }
  }

  /**
   * Submits a limit order
   * @returns {Promise<Void>}
   */
  async submitLimitOrder () {
    throw Error('not implemented')
  }

  /**
   * Cancels a limit order
   * @returns {Promise}
   */
  async cancelLimitOrder () {
    throw Error('not implemented')
  }

  /**
   * Closes the browser
   * @returns {Promise<Void>}
   */
  async stop () {
    const state = INSTANCES.get(this)
    await state.browser.close()

    return this
  }
}
