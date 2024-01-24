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
   constructor(props) {
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
   async start() {
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
   async submitLimitOrder(order) {
     console.log('submitting order', order)
 
     const { page } = INSTANCES.get(this)
 
     // fill out the base and quote quantity
     const txtBaseQuantity = await page.$('.panelSwap .base .quantity')
     await txtBaseQuantity.type(order.baseQuantity.toString())
 
     const txtQuoteQuantity = await page.$('.panelSwap .quote .quantity')
     await txtQuoteQuantity.type(order.quoteQuantity.toString())
 
     // TODO: Fix this to use a select/dropdown
     // const selectBaseAsset = await page.$('.panelSwap .base .asset')
     // await selectBaseAsset.select(order.baseAsset)
     // const selectQuoteAsset = await page.$('.panelSwap .quote .asset')
     // await selectQuoteAsset.select(order.quoteAsset)
     const selectedAsset = await page.$eval('.panelSwap .base .asset', element => element.innerText)
     if (selectedAsset !== order.baseAsset) {
       console.log('selectedAsset', selectedAsset)
       await page.$('.panelSwap .switchBaseQuoteAsset').click()
     }
 
     // click submit
     const btnExchange = await page.$('.panelSwap .buttonSwapSubmit')
     await btnExchange.click()
   }
 
   /**
    * Cancels a limit order
    * @returns {Promise}
    */
   async cancelLimitOrder(order) {
     // identify order in activity tab
     // click cancel
     throw Error('not implemented')
   }
 
   /**
    * Closes the browser
    * @returns {Promise<Void>}
    */
   async stop() {
     const state = INSTANCES.get(this)
     await state.browser.close()
 
     return this
   }
 
   /**
    * Subscribes to the activities panel
    */
   async _subscribeActivities() {
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
     await page.evaluate(function observe() {
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