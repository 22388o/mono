const { bitcoin } = require('../holdernode/submarine-bitcoind')
const { lnd } = require('../holdernode/submarine-lnd')
const { node } = require('../holdernode/node')

module.exports = class HolderTemplate extends Template {

  constructor (party, node1, node2) {
    super(party)

    this.node1 = node1
    this.node2 = node2

  }
}