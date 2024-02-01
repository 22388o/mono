/**
 * @file Defines the web-app as a class for UI testing
 */

const { BaseClass } = require('@portaldefi/core')
const puppeteer = require('puppeteer')
const SWAP_STATUS_NAME = [
  'Submitting order',
  'Finding match',
  'Swap matched',
  'Holder Invoice Created',
  'Holder Invoice Sent',
  'Seeker Invoice Created',
  'Seeker Invoice Sent',
  'Holder Invoice Paid',
  'Seeker Invoice Paid',
  'Holder Invoice Settled',
  'Seeker Invoice Settled',
  'Completed'
];

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
    
    // // Exposes an onEvent function to the page that is called by the
    // // MutationObserver setup below. This allows the page to emit mutation
    // // events, which can then be emitted upstream to the test code.
    // await page.exposeFunction('onEvent', (eventObject) => {
    //   console.log('Event received: ', eventObject.event, 
    //               'Details: ', eventObject.details)
    //   console.log(eventObject);
    //   // const { args } = mutationRecordToObject(eventObject)
    //   if(eventObject && eventObject.event)
    //     this.emit(eventObject.event, eventObject.details)
    // })
    // Expose the function to handle the events from the page
    await page.exposeFunction('onActivityEvent', (eventName, details) => {
      this.emit(eventName, details);
    });

    // Runs within the context of the page and hooks into the Activities panel
    // to observe any mutations to its DOM tree. Every update is then passed
    // to the `onEvent` function exposed above.
    await page.evaluate(function observe () {
      // console.log('page.evaluate Activities')

      function buildEventName(details) {
        // Construct the event name based on the type and status of the activity
        return `${details.type.toLowerCase()}.${details.status.replace(/\s+/g, '.').toLowerCase()}`;
      }

      /**
       * Returns the text contents of the specified element
       * @param {HTMLElement} e The element whose text content is to be retrieved
       * @param {String} s The selector used to identify the span with the element
       * @returns {String}
       */
      const getText = (e, s) => e.querySelector(s)?.textContent

      /**
       * Returns a JSON object for the specified mutation
       * @param {MutationRecord} mutation The mutation that occurred
       * @returns 
       */
      function mutationRecordToObject(mutation) {
        console.log('mutationRecordToObject(mutation)', mutation)
        const obj = { event: 'mutation', details: {} }
        // console.log('mutationRecordToObject(mutation)', mutation)
      
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // console.log('Added Nodes:', mutation.addedNodes)
          Array.from(mutation.addedNodes).forEach(node => {
            // node is a plain div. The `Stack` component renders in a div under it.
            node = node.querySelector('.activity-item')
            console.log('child node', node)
            if (node == null) return

            const activityInfo = node.querySelector('.activity-info')
            // console.log('activityInfo', activityInfo)
            if (activityInfo == null) return

            obj.details = {
              id: getText(activityInfo, '.activity-id'),
              orderId: getText(activityInfo, '.activity-orderId'),
              ts: getText(activityInfo, '.activity-ts'),
              uid: getText(activityInfo, '.activity-uid'),
              type: getText(activityInfo, '.activity-type'),
              side: getText(activityInfo, '.activity-side'),
              hash: getText(activityInfo, '.activity-hash'),
              baseNetwork: getText(activityInfo, '.activity-baseNetwork'),
              quoteNetwork: getText(activityInfo, '.activity-quoteNetwork'),
              status: getText(node, '.activity-status'),
              statusNumber: getText(node, '.activity-statusNumber'),
              baseAsset: getText(node, '.base-asset'),
              baseQuantity: getText(node, '.base-quantity'),
              quoteAsset: getText(node, '.quote-asset'),
              quoteQuantity: getText(node, '.quote-quantity'),
              createdDate: getText(node, '.activity-date'),
            }
            // obj.event = buildEventName(obj.details)
            const SWAP_STATUS = [
              'created',
              'opened',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              ''];
            obj.event = "order." + SWAP_STATUS[obj.details.statusNumber]

            console.log("mutationRecordToObject return obj", obj)
            console.log("mutationRecordToObject obj.details", obj.details)
            console.log("mutationRecordToObject obj.event", obj.event)
          })
        }

        return obj
      }
      // Create an observer instance linked to the callback function
      const observer = new MutationObserver((mutationList) => {
        // console.log('mutation observed', mutationList)
        for (const mutation of mutationList) {
          // console.log('mutation', mutation)

          const obj = mutationRecordToObject(mutation);
          // if (obj && obj.details &&  obj.details.id) {  // Checking if there's meaningful data
          //   onEvent(obj);
          // }

          if (obj.event && obj.details.id) {
            window.onActivityEvent(obj.event, obj.details);
          }
          // console.log('event', event)

          // onEvent(obj)
        }
      })
      // console.log('observer', observer)

      // // Start observing the target node for configured mutations
      // observer.observe(document.querySelector('.panelActivity'), {
      //   attributes: true,
      //   childList: true,
      //   subtree: true
      // })

      // Start observing the target node for configured mutations
      const targetNode = document.querySelector('.MuiGrid-root');
      if (!targetNode) {
        console.error('Target node for observer not found');
        return;
      }

      observer.observe(targetNode, {
        childList: true,
        subtree: true
      });
    })
  }
}
