/**
 * @file A list of constants useful for development, testing, and deployment
 */

const { readdirSync, readFileSync, writeFileSync } = require('fs')
const { basename, extname, resolve, join } = require('path')
const Web3 = require('web3')
const Solc = require('solc')

const PATH_ROOT = resolve(__dirname, '..')
const PATH_INPUT = join(PATH_ROOT, 'contracts')
const PATH_OUTPUT = join(PATH_ROOT, 'index.json')
const CONTRACTS = require(PATH_OUTPUT).contracts
const CONTRACTS_TO_DEPLOY = [
  'PaymentChannel',
  'Swap'
]

/**
 * Export all relevant constants
 * @type {Object}
 */
const Lib = module.exports

/**
 * Compiles the contracts
 * @returns {Promise<Object>}
 */
Lib.compile = function () {
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
      settings: { outputSelection: { '*': { '*': [ '*' ] } } }
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
Lib.deploy = function (contract, web3) {
  return web3.eth.getAccounts()
    .then(accounts => new web3.eth.Contract(contract.abi)
      .deploy({ data: contract.evm.bytecode.object })
      .send({ from: accounts[0] }))
}

/**
 * Deploy the contracts
 * @param {Object} contract Contracts returned by .compile()
 * @param {Web3} web3 The web3 instance to use to deploy the contracts
 * @returns {Promise<Contract[]>}
 */
Lib.deployPublic = function (contracts, web3) {
  return web3.eth.getAccounts()
    .then(accounts => Promise.all(CONTRACTS_TO_DEPLOY
      .map(name => [
        new web3.eth.Contract(CONTRACTS[`${name}.sol`][name].abi),
        { data: CONTRACTS[`${name}.sol`][name].evm.bytecode.object }
      ])
      .map(([contract, options]) => contract.deploy(options))
      .map(transaction => transaction.send({ from: accounts[0] }))))
    .then(contracts => contracts.reduce((obj, contract, index) => {
      obj[CONTRACTS_TO_DEPLOY[index]] = contracts[index]
      return obj
    }, {}))
}
