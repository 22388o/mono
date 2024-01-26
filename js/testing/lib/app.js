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
    * @param {String} props.hostname The HTTP hostname of the peer
    * @param {Number} props.port The HTTP port of the peer
    * @param {String} props.pathname The HTTP path to the websocket of the peer
    * @param {Object} props.browser Properties of the puppeteer instance
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
      this.info('start', { url })
      await state.page.goto(url)

      // subscribe to activity events
      await this._subscribeActivities()

      return this
    } catch (err) {
      this.error(err)
      this.emit('error', err)
    }
  }

  /**
    * Submits a limit order
    * @param {Object} The order to be placed
    * @returns {Promise<Void>}
    */
  async submitLimitOrder (order) {
    const { page } = INSTANCES.get(this)

    // fill out the base quantity and asset
    this.debug('submitLimitOrder', { baseQuantity: order.baseQuantity })
    const txtBaseQuantity = await page.$('.panelSwap .base .quantity')
    await txtBaseQuantity.type(order.baseQuantity.toString())

    this.debug('submitLimitOrder', { baseAsset: order.baseAsset })
    const selectBaseAsset = await page.$('.panelSwap .base .coin-select')
    await selectBaseAsset.select(order.baseAsset)

    // fill out the quote quantity and asset
    this.debug('submitLimitOrder', { quoteQuantity: order.quoteQuantity })
    const txtQuoteQuantity = await page.$('.panelSwap .quote .quantity')
    await txtQuoteQuantity.type(order.quoteQuantity.toString())

    this.debug('submitLimitOrder', { quoteAsset: order.quoteAsset })
    const selectQuoteAsset = await page.$('.panelSwap .quote .coin-select')
    await selectQuoteAsset.select(order.quoteAsset)

    // click exchange to submit the order
    this.debug('submitLimitOrder', { submitted: true })
    const btnExchange = await page.$('.panelSwap .buttonSwapSubmit')
    await btnExchange.click()
  }
  /**
    * Submits a limit order
    * @param {Object} The order to be placed
    * @returns {Promise<Void>}
    */
  async submitLimitOrder2 (order) {
    const { page } = INSTANCES.get(this)

    // fill out the base quantity and asset
    this.debug('submitLimitOrder2', { baseQuantity: order.baseQuantity })
    const txtBaseQuantity = await page.$('.panelSwap .base input.quantity')
    await txtBaseQuantity.type(order.baseQuantity.toString())

    // this.debug('submitLimitOrder2', { baseAsset: order.baseAsset })
    // const selectBaseAsset = await page.$('.panelSwap .base select.coin-select')
    // await selectBaseAsset.select(order.baseAsset)

    // fill out the quote quantity and asset
    this.debug('submitLimitOrder2', { quoteQuantity: order.quoteQuantity })
    const txtQuoteQuantity = await page.$('.panelSwap .quote input.quantity')
    await txtQuoteQuantity.type(order.quoteQuantity.toString())

    // this.debug('submitLimitOrder2', { quoteAsset: order.quoteAsset })
    // const selectQuoteAsset = await page.$('.panelSwap .quote select.coin-select')
    // await selectQuoteAsset.select(order.quoteAsset)

    // click switch base and quote assets
    this.debug('submitLimitOrder2', { submitted: true })
    const btnSwitchSides = await page.$('.panelSwap button.switchBaseQuoteAsset')
    await btnSwitchSides.click()

    // click exchange to submit the order
    this.debug('submitLimitOrder2', { submitted: true })
    const btnExchange = await page.$('.panelSwap .buttonSwapSubmit')
    await btnExchange.click()
  }

  /**
    * Cancels a limit order
    * @returns {Promise}
    */
  async cancelLimitOrder (order) {
    // identify order in activity tab
    // click cancel
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

  /**
    * Subscribes to the activities panel
    */
  async _subscribeActivities () {
    const { page } = INSTANCES.get(this)

    // Exposes an onActivity function to the page that is called by the
    // MutationObserver setup below. This allows the page to emit mutation
    // events, which can then be emitted upstream to the test code.
    await page.exposeFunction('onActivity', (...args) => {
      console.log('got activity', ...args)
      this.emit('...', ...args)
    })

    // Runs within the context of the page and hooks into the Activities panel
    // to observe any mutations to its DOM tree. Every update is then passed
    // to the `onActivity` function exposed above.
    await page.evaluate(function observe () {
      // Select the node that will be observed for mutations
      const targetNode = document.getElementsByClassName('panelActivity')[0]

      // Options for the observer (which mutations to observe)
      const config = { attributes: true, childList: true, subtree: true }

      // Callback function to execute when mutations are observed
      const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
          onActivity(mutation)
          // if (mutation.type === "childList") {
          //   console.log("A child node has been added or removed.");
          // } else if (mutation.type === "attributes") {
          //   console.log(`The ${mutation.attributeName} attribute was modified.`);
          // }
        }
      }

      // Create an observer instance linked to the callback function
      const observer = new MutationObserver(callback)

      // Start observing the target node for configured mutations
      // observer.observe(targetNode, config)

      // Later, you can stop observing
      // observer.disconnect()
    })
  }
}
