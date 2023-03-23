

const SeekerTemplate = require('./seekertemplate')

const bitcoin = require('bitcoinjs-lib');
const bip65 = require('bip65');
const Client = require('bitcoin-core');
const { getDescriptorInfo, createRawTransaction } = require('bitcoin-core/src/methods');

//const { alice, bob } = require('../bitcoin-test-wallets-generator/wallets.json');
// const SwapInfo = require('./swap-info');
// const witnessStackToScriptWitness  = require('./bitcoinjs-function/witnessStackToScriptWitness')

// const NETWORK = bitcoin.networks.regtest;
// const RELATIVE_SWAP_TIMELOCK = 36;
// const RELATIVE_PAYMENT_DEADLINE = 24;
// const REQUIRED_CONFIRMATIONS = 3;
// const DEFAULT_MINER_FEE = 200;

module.exports = class Submarine extends SeekerTemplate {
    constructor(party, node1, node2) {
        super(party, node1, node2)
    }

    async open(party, opts) {
        console.log("Open in seeker submarine")
        console.log(`node1: ${JSON.stringify(this.node1, null, 2)}`)
        console.log(`node2: ${JSON.stringify(this.node2, null, 2)}`)

            const carol = new Client({
                port:       this.node2.creds.rpcport,
                password:   this.node2.creds.rpcpassword,
                username:   this.node2.creds.rpcuser,
            });

            const info = await carol.command([{method: 'getblockchaininfo', parameters: []}]);

            console.log(`info: ${JSON.stringify(info, null, 2)}`)
            //
            // const height = info[0].blocks;
            // const timelock = height +  RELATIVE_SWAP_TIMELOCK;
            // const holderPublicKey = SECRET_HOLDER.publicKey.toString('hex');
            // const seekerPublicKey = SECRET_SEEKER.publicKey.toString('hex');
            //
            // const witnessScriptRaw = scriptGenerator(seekerPublicKey, holderPublicKey, swapHash, timelock);
            // const p2wsh = bitcoin.payments.p2wsh({redeem: {output: witnessScriptRaw, NETWORK}, NETWORK})
            //
            // const witnessScript = witnessScriptRaw.toString('hex');
            //
            // const scriptInfo = await carol.decodeScript(witnessScript);
            // const payAddress = scriptInfo.segwit.address;
            // const barePayDescriptor = `addr(${payAddress})`;
            // const descriptorInfo = await carol.command([{method: 'getdescriptorinfo', parameters: [barePayDescriptor]}]);
            // const checksum = descriptorInfo[0].checksum;
            // const payDescriptor =  `${barePayDescriptor}#${checksum}`;
            //
            // const swapinfo = new SwapInfo.constructor( {descriptor: payDescriptor, witnessScript, timelock});

            // return swapinfo;


        return party
    }


    static fromProps(party, nodesProps) {

        const props1 = nodesProps[0]
        const props2 = nodesProps[1]
        const Node1 = require(`../seekernode/submarine-${props1.nodetype}`);
        const Node2 = require(`../seekernode/submarine-${props2.nodetype}`);
        const node1 = new Node1(props1)
        const node2 = new Node2(props2)
        return new Submarine(party, node1, node2)
    }

}