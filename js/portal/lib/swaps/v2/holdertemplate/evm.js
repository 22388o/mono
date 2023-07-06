const { ethers } = require('ethers')

const HolderTemplate = require("./holdertemplate")

module.exports = class Evm extends HolderTemplate { 
    constructor(party, node1, node2) {
        super(party, node1, node2)
    }

    async open(party, opts) { 

    }

    async abort(party, opts) {

    }
}