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
    await state.observer.disconnect()
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
      console.log('page.evaluate Activities')

      function buildEventName(details) {
        // Construct the event name based on the type and status of the activity
        return `${details.type.toLowerCase()}.${details.status.replace(/\s+/g, '.').toLowerCase()}`;
      }
      /**
       * Returns a JSON object for the specified mutation
       * @param {MutationRecord} mutation The mutation that occurred
       * @returns 
       */
      function mutationRecordToObject(mutation) {
        console.log('mutationRecordToObject(mutation)', mutation)
        const obj = { event: 'mutation', details: {} };
      
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          console.log('Added Nodes:', mutation.addedNodes);
          Array.from(mutation.addedNodes).forEach(node => {
            console.log('Processed Node:', node.outerHTML);
            if (node.classList.contains('activity-item')) {
              const activityInfo = node.querySelector('.activity-info');
              if (activityInfo) {
                obj.details = {
                  id: activityInfo.querySelector('.activity-id')?.textContent.trim() || null,
                  orderId: activityInfo.querySelector('.activity-orderId')?.textContent.trim() || null,
                  ts: activityInfo.querySelector('.activity-ts')?.textContent.trim() || null,
                  uid: activityInfo.querySelector('.activity-uid')?.textContent.trim() || null,
                  type: activityInfo.querySelector('.activity-type')?.textContent.trim() || null,
                  side: activityInfo.querySelector('.activity-side')?.textContent.trim() || null,
                  hash: activityInfo.querySelector('.activity-hash')?.textContent.trim() || null,
                  baseNetwork: activityInfo.querySelector('.activity-baseNetwork')?.textContent.trim() || null,
                  quoteNetwork: activityInfo.querySelector('.activity-quoteNetwork')?.textContent.trim() || null,
                  ordinalLocation: activityInfo.querySelector('.activity-ordinalLocation')?.textContent.trim() || null,
                  status: node.querySelector('.MuiTypography-root.MuiTypography-body1')?.textContent.trim() || null,
                  baseAsset: node.querySelector('.base-asset')?.textContent.trim() || null,
                  baseQuantity: node.querySelector('.base-quantity')?.textContent.trim() || null,
                  quoteAsset: node.querySelector('.quote-asset')?.textContent.trim() || null,
                  quoteQuantity: node.querySelector('.quote-quantity')?.textContent.trim() || null,
                  createdDate: node.querySelector('.activity-date')?.textContent.trim() || null
                };
                console.log('Extracted Details:', obj.details);

                // // if (obj.details.type === 'Order') {
                // //   if(obj.details.status === 'opened') {
                // //     obj.event = 'order.opened';
                // //   } 
                // //   else if (obj.details.status === 'created') {
                // //       obj.event = 'order.created';
                // //   }
                // // }
                // // if (obj.details.type === 'Swap') {
                // //   obj.event = 'swap.' + obj.details.status;
                // //   // if(obj.details.status === 'opened') {
                // //   //   obj.event = 'swap.opened';
                // //   // } 
                // //   // else if (obj.details.status === 'created') {
                // //   //     obj.event = 'order.created';
                // //   // }
                // // }
                // if (obj.details.type === 'Order') {
                //   obj.event = 'order.' + obj.details.status.toLowerCase().replace(/\s/g, '.');
                // }

                obj.event = buildEventName(obj.details);
              } else {
                console.log('Activity info not found in node:', node.outerHTML)
              }
            } else {
              console.log('Processed node does not have class activity-item:', node.outerHTML);
            }
          });
        } else {
          console.log('No added nodes to process in this mutation:', mutation);
        }
      
        return obj;
      }
      // Create an observer instance linked to the callback function
      const observer = new MutationObserver((mutationList) => {
        console.log('mutation observed', mutationList)
        for (const mutation of mutationList) {
          console.log('mutation', mutation)

          const obj = mutationRecordToObject(mutation);
          // if (obj && obj.details &&  obj.details.id) {  // Checking if there's meaningful data
          //   onEvent(obj);
          // }

          if (obj.event && obj.details.id) {
            window.onActivityEvent(obj.event, obj.details);
          }
          console.log('event', event)

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
