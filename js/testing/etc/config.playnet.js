/**
 * @file Configuration for the development environment
 */

const { readFileSync } = require('fs')
const { join, resolve } = require('path')
const keythereum = require('keythereum')

/**
 * Path to the root of the repository
 * @type {String}
 */
const PATH_PLAYNET = resolve(process.env.PORTAL_ROOT, 'playnet')

/**
 * Export the configuration for the development environment
 * @type {Object}
 */
const Config = module.exports = {}

/**
 * Configuration for the coordinator node
 * @type {Object}
 */
Config.coordinator = coordinatorConfig('coordinator')

/**
 * Configuration for each of the peer nodes
 * @type {Object}
 */
Config.peers = {
  alice: peerConfig('alice', Config.coordinator),
  bob: peerConfig('bob', Config.coordinator)
}

/**
 * Configuration for each of the SDKs
 */
Config.sdks = {
  alice: sdkConfig('alice'),
  bob: sdkConfig('bob')
}

/**
 * Configuration for each of the apps
 */
Config.apps = {
  alice: appConfig('alice'),
  bob: appConfig('bob')
}

/**
 * Generates configuration for the coordinator
 * @param {String} id The unique identifier of the coordinator node
 * @returns {Object}
 */
function coordinatorConfig (id) {
  return {
    id,
    hostname: '127.0.0.1',

    dex: undefined,
    swaps: undefined
  }
}

/**
 * Generates configuration for the specified peer
 * @param {String} id The unique identifier of the coordinator node
 * @param {Object} coordinator The configuration to connect to the coordinator
 * @returns {Object}
 */
function peerConfig (id, coordinator) {
  return {
    id,
    hostname: '127.0.0.1',
    root: resolve(__dirname, '..', 'dist'),

    blockchains: { ethereum: gethConfig(id), lightning: lndConfig(id) },
    coordinator,
    dex: undefined,
    swaps: undefined
  }
}

/**
 * Generates configuration for the specified sdk
 * @param {String} id The unique identifier of the coordinator node
 * @returns {Object}
 */
function sdkConfig (id) {
  return {
    id
  }
}

/**
 * Generates configuration for the specified app
 * @param {String} id The unique identifier of the coordinator node
 * @returns {Object}
 */
function appConfig (id) {
  return {
    id,
    browser: {
      args: ['--window-size=800,600'],
      defaultViewport: { width: 800, height: 600 },
      headless: false,
      slowMo: 50,
      timeout: 10000
    }
  }
}

/**
 * Returns the geth configuration for the specified user
 * @param {String} id The unique identifier of the user
 * @returns {Object}
 */
function gethConfig (id) {
  const statePath = join(PATH_PLAYNET, 'state', id, 'geth')
  const keystorePath = join(statePath, 'keystore.json')
  const keystore = JSON.parse(readFileSync(keystorePath))
  return {
    url: process.env.PORTAL_ETHEREUM_URL,
    chainId: process.env.PORTAL_ETHEREUM_CHAINID,
    contracts: JSON.parse(readFileSync(process.env.PORTAL_ETHEREUM_CONTRACTS)),
    public: `0x${keystore.address}`,
    private: `0x${keythereum.recover(id, keystore).toString('hex')}`
  }
}

/**
 * Returns the lnd configuration for the specified user
 * @param {String} id The unique identifier of the user
 * @returns {Object}
 */
function lndConfig (id) {
  const statePath = join(PATH_PLAYNET, 'state', id, 'lnd')

  const certPath = join(statePath, 'tls.cert')
  const macaroonsPath = join(statePath, 'data', 'chain', 'bitcoin', 'regtest')
  const adminMacaroonPath = join(macaroonsPath, 'admin.macaroon')
  const invoiceMacaroonPath = join(macaroonsPath, 'invoice.macaroon')

  const configPath = join(PATH_PLAYNET, `lnd.${id}.conf`)
  const config = readFileSync(configPath).toString('utf8')
    .split('\n')
    .filter(line => !!line)
    .map(line => line.split('='))
    .reduce((conf, [k, v]) => {
      if (v === 'true' || v === 'false') {
        conf[k] = Boolean(v)
      } else if (!isNaN(+v)) {
        conf[k] = +v
      } else {
        conf[k] = v
      }

      return conf
    }, {})

  return {
    hostname: config.restlisten.split(':')[0],
    port: Number(config.restlisten.split(':')[1]),
    cert: readFileSync(certPath).toString('hex'),
    admin: readFileSync(adminMacaroonPath).toString('hex'),
    invoice: readFileSync(invoiceMacaroonPath).toString('hex')
  }
}
