/**
 * @file Behavioral specification for the swap
 */

const Swap = artifacts.require('Swap')
const { writeFileSync } = require('fs')
const { dirname, join } = require('path')

/**
 * Deploys the Swap smart contract
 * @param {Deployer} deployer The truffle smart contract deployer
 * @param {String} network The name of the network to deploy to
 * @param {String[]} accounts A list of accounts available for use
 * @returns {Void}
 */
module.exports = function (deployer, network, accounts) {
  deployer.deploy(Swap)
    .then(contract => {
      const packageJson = require('../package.json')
      const pathPackageRoot = dirname(__dirname)
      const pathPackageMain = join(pathPackageRoot, packageJson.main)
      const packageExport = require(pathPackageMain)

      const { address, transactionHash, abi } = contract
      packageExport[network] = { address, transactionHash, abi }

      writeFileSync(pathPackageMain, JSON.stringify(packageExport, null, 2))
    })
}
