const { ethers } = require('ethers')

const SeekerTemplate = require('./seekertemplate')

const swapAbi = require('../../../../abi/Swap.json');

module.exports = class Evm extends SeekerTemplate {
    constructor(party, node1, node2) {
        super(party, node1, node2)
    }

    async open(party, opts) {
        const provider = new ethers.providers.JsonRpcProvider(opts.rpcurl)
        const swapContract = new ethers.Contract(
            opts.contractAddress,
            swapAbi,
            provider
        )

        const []
    }

    async commit(party, opts) {

    }

    async abort(party, opts) {
        throw new Error('not implemented!')
    }
}