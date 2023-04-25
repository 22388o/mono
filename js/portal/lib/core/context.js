/**
 * @file Request Context
 */

const Assets = require('./assets')
const Networks = require('./networks')
const Orderbooks = require('./orderbooks')
const Store = require('./store')
const Swaps = require('./swaps')
const Contracts = require('../../contracts/index.json')
const Channels = require('./channels')
const Invoice = require('./invoice')

/**
 * Export the request context
 * @type {HttpContext}
 */
const HttpContext = module.exports = {
  log: console,
  store: new Store()
}

/**
 * Interface to all supported blockchain networks
 * @type {Networks}
 */
HttpContext.networks = new Networks({
  'eth-l2.eth': {
    '@type': 'eth-l2',
    assets: ['ETH'],
    abi: Contracts.abi,
    address: process.env.PORTAL_GOERLI_CONTRACT_ADDRESS,
    chainId: 5,
    url: process.env.PORTAL_GOERLI_URL
  },
  'lightning.btc': {
    '@type': 'lightning',
    assets: ['BTC']
  }
}, HttpContext)

/**
 * Interface to all supported assets
 * @type {Map}
 */
HttpContext.assets = Assets

/**
 * Interface to all supported orderbooks
 * @type {Orderbooks}
 */
HttpContext.orderbooks = new Orderbooks(null, HttpContext)

/**
 * Interface to all open atomic swaps in progress
 * @type {Swaps}
 */
HttpContext.swaps = new Swaps(null, HttpContext)


/**
 * Interface to L2 channels
 * @type {Channels}
 */
HttpContext.channels = new Channels(null, HttpContext)

 /**
  * Interface to creating Invoices
  * @type {Invoice}
  */
HttpContext.invoice = new Invoice(null, HttpContext)
