/**
 * @file Request Context
 */

const Assets = require('./assets')
const Networks = require('./networks')
const Orderbooks = require('./orderbooks')
const Store = require('./store')
const Swaps = require('./swaps')
const Contracts = require('../../contracts/index.json')

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
    abi: Contracts.abi,
    address: process.env.PORTAL_GOERLI_CONTRACT_ADDRESS,
    assets: ['ETH'],
    chainId: 5,
    url: process.env.PORTAL_GOERLI_URL
  },
  'lightning.btc': {
    '@type': 'lightning',
    assets: ['BTC']
  },
  sepolia: {
    '@type': 'ethereum',
    abi: Contracts.abi,
    address: process.env.PORTAL_SEPOLIA_CONTRACT_ADDRESS,
    assets: ['ETH'],
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
 * Interface to all open atomic swaps in progress
 * @type {Swaps}
 */
HttpContext.swaps = new Swaps(null, HttpContext)
