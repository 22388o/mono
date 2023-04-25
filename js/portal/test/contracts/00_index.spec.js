/**
 * @file Sets up the Mocha testing environment for testing the smart contracts
 */

const { expect } = require('chai')
const { readdirSync, readFileSync } = require('fs')
const { basename, extname, resolve, join } = require('path')
const Web3 = require('web3')
const Solc = require('solc')

const PATH_INPUT = resolve(__dirname, '..', '..', 'contracts')

/**
 * Compiles the contracts
 * @returns {Promise<Object>}
 */
function compile () {
  return new Promise((resolve, reject) => {
    const input = {
      language: 'Solidity',
      sources: readdirSync(PATH_INPUT)
        .filter(file => extname(file) === '.sol')
        .map(file => join(PATH_INPUT, file))
        .reduce((sources, file) => {
          sources[basename(file)] = { content: readFileSync(file, 'utf-8') }
          return sources
        }, {}),
      settings: { outputSelection: { '*': { '*': ['*'] } } }
    }
    const output = JSON.parse(Solc.compile(JSON.stringify(input)))
    const message = output.errors
      .filter(err => err.severity === 'error')
      .map(err => err.formattedMessage)
      .join('\n')

    message.length
      ? reject(Error(message))
      : resolve(output.contracts)
  })
}

/**
 * Deploy the specified contract
 * @param {Object} contract The contract to deploy; returned by .compile()
 * @param {Web3} web3 The web3 instance used to deploy the contract
 * @returns {Promise<Contract>}
 */
function deploy (contract, web3) {
  return web3.eth.getAccounts()
    .then(accounts => new web3.eth.Contract(contract.abi)
      .deploy({ data: contract.evm.bytecode.object })
      .send({ from: accounts[0] }))
}

before('Initialize Web3 and compile the contracts', async function () {
  const web3 = new Web3(process.env.PORTAL_ETHEREUM_URL)
  const contracts = await compile()

  this.web3 = web3
  this.contracts = {}

  for (const name in contracts) {
    const contractName = basename(name, extname(name, '.sol'))
    const contract = contracts[name][contractName]
    this.contracts[contractName] = { deploy: () => deploy(contract, web3) }
  }
})

describe('Must have initialized the test environment', function () {
  it('must have a web3 instance', function () {
    const { web3 } = this.test.ctx
    expect(web3).to.be.an.instanceof(Web3)
  })

  it('must have compiled all contracts', function () {
    const { contracts } = this.test.ctx

    expect(contracts).to.be.an('object')
    expect(contracts).to.have.all.deep.keys(
      'ECDSA',
      'IERC20',
      'PaymentChannel',
      'ReentrancyGuard',
      'Swap'
    )
  })
})
