/**
 * @file Behavioral specification for the Portal SDK
 */

const { writeFileSync } = require('fs')
const { Web3 } = require('web3')
const { compile, deploy } = require('./lib/helpers')

const isDebugEnabled = process.argv.includes('--debug')

const core = async () => {
  const web3 = this.web3 = new Web3(process.env.PORTAL_ETHEREUM_URL)
  const contracts = this.contracts = await deploy(await compile(), web3)
  const abiFile = '../swap-client/contracts.json'
  writeFileSync(abiFile, JSON.stringify(contracts, null, 2))
};

core();