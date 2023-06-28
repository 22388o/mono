/**
 * @file Request Context
 */

<<<<<<< HEAD
const Assets = require("./assets");
const Networks = require("./networks");
const Orderbooks = require("./orderbooks");
const Orderbooks2 = require("../swaps/v2/orderbook/orderbooks");
const Store = require("./store");
const Swaps = require("./swaps");
const Swaps2 = require("../swaps/v2/swaps");
const Contracts = require("../../contracts/index.json");
const Channels = require("./channels");
=======
const Assets = require('./assets')
const Networks = require('./networks')
const Orderbooks = require('./orderbooks')
const Store = require('./store')
const Swaps = require('./swaps')
>>>>>>> master

/**
 * Export the request context
 * @type {HttpContext}
 */
<<<<<<< HEAD
const HttpContext = (module.exports = {
  log: console,
  store: new Store(),
});
=======
const HttpContext = module.exports = {
  log: console,
  store: new Store()
}
>>>>>>> master

/**
 * Interface to all supported blockchain networks
 * @type {Networks}
 */
<<<<<<< HEAD
HttpContext.networks = new Networks(
  {
    // 'eth-l2.eth': {
    //   '@type': 'eth-l2',
    //   assets: ['ETH'],
    //   abi: Contracts.abi,
    //   address: process.env.PORTAL_GOERLI_CONTRACT_ADDRESS,
    //   chainId: 5,
    //   url: process.env.PORTAL_GOERLI_URL
    // },
    ethereum: {
      "@type": "ethereum",
      assets: ["ETH"],
      abi: Contracts.abi,
      address: process.env.PORTAL_GOERLI_CONTRACT_ADDRESS,
      chainId: 5,
      url: process.env.PORTAL_GOERLI_URL,
    },
    "lightning.btc": {
      "@type": "lightning",
      assets: ["BTC"],
    },
    sepolia: {
      "@type": "ethereum",
      assets: ["ETH"],
      abi: Contracts.abi,
      address: process.env.PORTAL_SEPOLIA_CONTRACT_ADDRESS,
      chainId: 11155111,
      url: process.env.PORTAL_SEPOLIA_URL,
    },
    "btc.btc": {
      "@type": "btc",
      assets: ["BTC", "BTCORD"],
    },
  },
  HttpContext
);
=======
HttpContext.networks = new Networks({
  ethereum: {
    '@type': 'ethereum',
    assets: ['ETH'],
    contracts: process.env.PORTAL_ETHEREUM_CONTRACTS,
    chainId: process.env.PORTAL_ETHEREUM_CHAINID,
    url: process.env.PORTAL_ETHEREUM_URL
  },
  'lightning.btc': {
    '@type': 'lightning',
    assets: ['BTC']
  }
}, HttpContext)
>>>>>>> master

/**
 * Interface to all supported assets
 * @type {Map}
 */
<<<<<<< HEAD
HttpContext.assets = Assets;
=======
HttpContext.assets = Assets
>>>>>>> master

/**
 * Interface to all supported orderbooks
 * @type {Orderbooks}
 */
<<<<<<< HEAD
HttpContext.orderbooks = new Orderbooks(null, HttpContext);

/**
 * Interface to all supported orderbooks
 * @type {Orderbooks2}
 */
HttpContext.orderbooks2 = new Orderbooks2(null, HttpContext);
=======
HttpContext.orderbooks = new Orderbooks(null, HttpContext)
>>>>>>> master

/**
 * Interface to all open atomic swaps in progress
 * @type {Swaps}
 */
<<<<<<< HEAD
HttpContext.swaps = new Swaps(null, HttpContext);

/**
 * Interface to all version2 open atomic swaps in progress
 * @type {Swaps2}
 */
HttpContext.swaps2 = new Swaps2(null, HttpContext);

/**
 * Interface to L2 channels
 * @type {Channels}
 */
HttpContext.channels = new Channels(null, HttpContext);
=======
HttpContext.swaps = new Swaps(null, HttpContext)
>>>>>>> master
