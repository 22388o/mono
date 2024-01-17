/**
 * @file The core types used by the Portal code-bases
 */

const { BaseClass } = require('./lib/base_class')
Object.assign(module.exports, { BaseClass })

const { Network } = require('./lib/network/node')
const { Store } = require('./lib/store/node')
const { Util } = require('./lib/util/node')
Object.assign(module.exports, { Network, Store, Util })

const { Assets } = require('./lib/assets')
const { Blockchain } = require('./lib/blockchain')
const { Order } = require('./lib/order')
const { Swap } = require('./lib/swap')
Object.assign(module.exports, { Assets, BaseClass, Blockchain, Order, Swap })
