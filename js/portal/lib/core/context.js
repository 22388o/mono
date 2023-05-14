/**
 * @file Request Context
 */

const Assets = require('./assets')
const Networks = require('./networks')
const Orderbooks = require('./orderbooks')
const Orderbooks2 = require('../swaps/v2/orderbook/orderbooks')
const Store = require('./store')
const Swaps = require('./swaps')
const Swaps2 = require('../swaps/v2/swaps')
const Contracts = require('../../contracts/index.json')
const Channels = require('./channels')

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
  goerli: {
    '@type': 'ethereum',
    assets: ['ETH'],
    abi: Contracts.abi,
    address: process.env.PORTAL_GOERLI_CONTRACT_ADDRESS,
    chainId: 5,
    url: process.env.PORTAL_GOERLI_URL
  },
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
  },
  sepolia: {
    '@type': 'ethereum',
    assets: ['ETH'],
    abi: Contracts.abi,
    address: process.env.PORTAL_SEPOLIA_CONTRACT_ADDRESS,
    chainId: 11155111,
    url: process.env.PORTAL_SEPOLIA_URL
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
 * Interface to all supported orderbooks
 * @type {Orderbooks2}
 */
HttpContext.orderbooks2 = new Orderbooks2(null, HttpContext)

/**
 * Interface to all open atomic swaps in progress
 * @type {Swaps}
 */
HttpContext.swaps = new Swaps(null, HttpContext)

/**
 * Interface to all version2 open atomic swaps in progress
 * @type {Swaps2}
 */
HttpContext.swaps2 = new Swaps2(null, HttpContext)


/**
 * Interface to L2 channels
 * @type {Channels}
 */
HttpContext.channels = new Channels(null, HttpContext)
