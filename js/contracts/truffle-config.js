/**
 * @file Configuration for the Truffle framework
 */

/**
 * Use the appropriate configuration file
 * @type {String}
 */
const configPath = process.env.TRUFFLE_CONF_PATH
  ? process.env.TRUFFLE_CONF_PATH
  : './truffle-config.json'

/**
 * Flag checking if debugging is enabled
 * @type {Boolean}
 */
const debugEnabled = Object.values(process.argv).includes('--debug')

/**
 * Export the configuration
 * @type {Object}
 */
const Config = module.exports = Object.assign({}, require(configPath), {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*'
    }
  }
})

/**
 * Start a test blockchain instance
 */
require('ganache')
  .server({
    logging: {
      quiet: !debugEnabled,
      verbose: debugEnabled
    }
  })
  .listen(Config.networks.development.port)
