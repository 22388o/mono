/**
 * @file The Goerli blockchain network
 */

const Network = require('../core/network')
const Web3 = require('web3')

/**
 * Exports a Web3 interface to the Goerli blockchain network
 * @type {Goerli}
 */
module.exports = class Goerli extends Network {
  constructor (props) {
    const assets = ['ETH', 'USDC']
    const client = new Web3(props.url)
    const contract = new client.eth.Contract(props.abi, props.address)

    super({ assets, client, contract })
  }

  open (party) {
    throw new Error('yet to be implemented!')
  }

  commit (party) {
    throw new Error('yet to be implemented!')
  }
}
