/**
 * @file The EVM blockchain network
 */

const Network = require('../core/network')
const Web3 = require('web3')

/**
 * The EVM blockchain network
 * @type {EVM}
 */
module.exports = class EVM extends Network {
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

  abort (party) {
    throw new Error('yet to be implemented!')
  }
}
