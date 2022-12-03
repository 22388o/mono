/**
 * @file Configuration for the Truffle framework
 */

const HDWalletProvider = require('@truffle/hdwallet-provider')
const MNEMONIC = 'maple bag hire erode journey winter midnight mail protect range diagram kidney'
const INFURA_API_KEY = '3f6691a33225484c8e1eebde034b274f'

const configPath = process.env.TRUFFLE_CONF_PATH
  ? process.env.TRUFFLE_CONF_PATH
  : './truffle-config.json'

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
    },
    goerli: {
      provider: () => new HDWalletProvider(MNEMONIC, `https://goerli.infura.io/v3/${INFURA_API_KEY}`),
      network_id: '5',
      gas: 4465030
    },
    sepolia: {
      provider: () => new HDWalletProvider(MNEMONIC, `https://sepolia.infura.io/v3/${INFURA_API_KEY}`),
      network_id: '11155111',
      gas: 4465030
    }
  }
})

require('ganache')
  .server()
  .listen(Config.networks.development.port)
