/**
 * @file Swap Interface Specification
 */

const ganache = require('ganache')
const path = require('path')
const truffle = require('truffle')
const url = require('url')
const Swaps = require('../../../../lib/core/swaps')
const Context = require('../../../../lib/core/context')

/**
 * Root directory of this module; used to find files, and write assets
 * @type {String}
 */
const pathRoot = path.resolve(path.join(__dirname, '..', '..', '..', '..'))

/**
 * Default configuration for Truffle
 * @type {Object}
 */
const TRUFFLE_BUILD_CONFIG = {
  build_directory: path.join(pathRoot, 'dist'),
  contracts_build_directory: path.join(pathRoot, 'dist', 'contracts'),
  contracts_directory: path.join(pathRoot, 'contracts'),
  compilers: { solc: { version: '0.7.6' } },
  mocha: { diff: true, reporter: 'spec', ui: 'bdd' },
  networks: {},
  working_directory: pathRoot
}

// Setup environment variables as needed
process.env.PORTAL_URL_EVM = 'http://localhost:8545'

/**
 * Spins up the testing environment
 */
before('Spin up testing environment', async function () {
  this.evm = await startEVM(process.env.PORTAL_URL_EVM)
  await buildEVMContracts(TRUFFLE_BUILD_CONFIG)
  this.swaps = new Swaps(null, Context)
})

/**
 * Spins down the testing environment
 */
after('Spin down testing environment', async function () {
  const { evm } = this.test.ctx
  this.test.ctx.swaps = null
  await stopEVM(evm)
})

/**
 * Compiles smart-contracts to be deployed to EVMs
 * @param {Object} config The build/compile configuration
 * @returns {Void}
 */
async function buildEVMContracts (config) {
  await truffle.build.build(config)
}

/**
 * Starts a ganache-backed EVM blockchain
 * @param {String} urlEVM The HTTP url where the EVM server is running/listening
 * @returns {Promise<Server>}
 */
async function startEVM (urlEVM) {
  const parsedUrl = url.parse(urlEVM)
  const evm = ganache.server()
  await evm.listen(parsedUrl.port, parsedUrl.hostname)
  return evm
}

/**
 * Stops a ganache-backed EVM blockchain
 * @param {Server} server The EVM server to stop
 * @returns {Promise<Void>}
 */
function stopEVM (server) {
  return server.close()
}
