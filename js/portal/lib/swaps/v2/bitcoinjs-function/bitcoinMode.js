const bitcoin = require('bitcoinjs-lib')

function getBitcoinMode (mode) {
    if (mode === 'regtest') {
      return bitcoin.networks.regtest
    }
    else if (mode === 'testnet') {
      return bitcoin.networks.testnet
    }
    else if (mode === 'mainnet') {
      return bitcoin.networks.bitcoin
    }
    else {
      throw new Error(`Incorrect or missing mode: ${mode}`)
    }
}

module.exports = getBitcoinMode