#!/usr/bin/env node
/**
 * @file Deploys the contracts
 */

const { resolve, join } = require('path')
const Web3 = require('web3')

const PATH_ROOT = resolve(__dirname, '..')
const PATH_INPUT = join(PATH_ROOT, 'contracts')
const PATH_OUTPUT = join(PATH_ROOT, 'index.json')
const CONTRACTS = require(PATH_OUTPUT).contracts
const CONTRACTS_TO_DEPLOY = [
  'PaymentChannel',
  'Swap'
]

const web3 = new Web3(process.env.PORTAL_ETHEREUM_URL)

web3.eth.getAccounts()
  .then(accounts => Promise.all(CONTRACTS_TO_DEPLOY
    .map(name => [
      new web3.eth.Contract(CONTRACTS[`${name}.sol`][name].abi),
      { data: CONTRACTS[`${name}.sol`][name].evm.bytecode.object }
    ])
    .map(([contract, options]) => contract.deploy(options))
    .map(transaction => transaction.send({ from: accounts[0] }))))
  .then(contracts => console.log(contracts))
  .catch(console.error)
