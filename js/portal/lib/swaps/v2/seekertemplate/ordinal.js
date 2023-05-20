

const SeekerTemplate = require('./seekertemplate')

const bitcoin = require('bitcoinjs-lib');
const bip65 = require('bip65');
const Client = require('bitcoin-core');
const { getDescriptorInfo, createRawTransaction } = require('bitcoin-core/src/methods');
const ln = require('lightning')
const { createInvoice, createHodlInvoice, subscribeToInvoice, decodePaymentRequest, payViaPaymentRequest, settleHodlInvoice } = require('lightning')
const SwapInfo = require('../swap-info');
const witnessStackToScriptWitness  = require('../bitcoinjs-function/witnessStackToScriptWitness')


const RELATIVE_SWAP_TIMELOCK = 36;
const RELATIVE_PAYMENT_DEADLINE = 24;
const REQUIRED_CONFIRMATIONS = 1;
const DEFAULT_MINER_FEE = 2000;
const NETWORK = bitcoin.networks.regtest

module.exports = class Ordinal extends SeekerTemplate {
    constructor(party, node1, node2) {
        super(party, node1, node2)
    }

    async open(party, opts) {
        // console.log("Open in seeker ordinal")

        const scriptGenerator = function(secretSeekerPublicKey,  secretHolderPublicKey, swapHash, timelock) {
            return bitcoin.script.fromASM(
              `
        OP_HASH160
        ${bitcoin.crypto.ripemd160(Buffer.from(swapHash, 'hex')).toString('hex')}
        OP_EQUAL
        OP_IF
            ${secretSeekerPublicKey}
        OP_ELSE
            ${bitcoin.script.number.encode(timelock).toString('hex')}
            OP_CHECKLOCKTIMEVERIFY
            OP_DROP
            ${secretHolderPublicKey}
        OP_ENDIF
        OP_CHECKSIG
        `
                .trim()
                .replace(/\s+/g, ' ')
            );
        };

        // console.log(`node1: ${JSON.stringify(this.node1, null, 2)}`)
        // console.log(`node2: ${JSON.stringify(this.node2, null, 2)}`)

            const carol = new Client({
                port:       this.node2.creds.rpcport,
                password:   this.node2.creds.rpcpassword,
                username:   this.node2.creds.rpcuser
            });

            const info = await carol.command([{method: 'getblockchaininfo', parameters: []}]);

            // console.log(`info: ${JSON.stringify(info, null, 2)}`)

            const wif = this.node2.creds.wif
            // console.log(`wif: ${wif}`)
            // const network = bitcoin.networks.regtest
            // console.log(`network: ${network}`)
            const seekerPair = bitcoin.ECPair.fromWIF(wif, NETWORK);
            // console.log(`holderPair created`)
            const seekerPublicKey = seekerPair.publicKey.toString('hex');
            // console.log(`seekerPublicKey: ${seekerPublicKey}`)

            party.state.shared.seekerPublicKey = seekerPublicKey

            const height = info[0].blocks;
            const timelock = height +  RELATIVE_SWAP_TIMELOCK;
            const holderPublicKey = party.state.shared.holderPublicKey

            party.state.initialHeight = height

            console.log(`holderPublicKey: ${holderPublicKey}`)
            const swapHash = party.swapHash
            const witnessScriptRaw = scriptGenerator(seekerPublicKey, holderPublicKey, swapHash, timelock);
            const p2wsh = bitcoin.payments.p2wsh({redeem: {output: witnessScriptRaw, NETWORK}, NETWORK})

            const witnessScript = witnessScriptRaw.toString('hex');

            const scriptInfo = await carol.decodeScript(witnessScript);
            const payAddress = scriptInfo.segwit.address;
            const barePayDescriptor = `addr(${payAddress})`;
            const descriptorInfo = await carol.command([{method: 'getdescriptorinfo', parameters: [barePayDescriptor]}]);
            const checksum = descriptorInfo[0].checksum;
            const payDescriptor =  `${barePayDescriptor}#${checksum}`;


            const swapinfo = new SwapInfo.constructor( {descriptor: payDescriptor, witnessScript, timelock});
            party.state.shared.swapinfo = swapinfo
            party.swap.setStatusToHolderPaymentPending()
            party.swap.emit('holderPaymentPending', party.swap, party.username, payDescriptor)

            // console.log(`party in submarine.open: ${JSON.stringify(party, null, 2)}`)

        return party
    }

    // async function commit(secret, swapinfo, amount, fee) {
    async commit(party, opts) {

        const carol = new Client({
            port:       this.node2.creds.rpcport,
            password:   this.node2.creds.rpcpassword,
            username:   this.node2.creds.rpcuser
        });

        let fee = 0
        // if (typeof(party.state.shared.holderFee) == "string") {
        //     fee = parseInt(party.state.shared.holderFee, 10)
        // }
        // else {
        //     fee = party.state.shared.holderFee
        // }

        let paymentAmount
        if (typeof(party.quoteQuantity) == "string") {
            paymentAmount = parseInt(party.quoteQuantity, 10)
        }
        else {
            paymentAmount = party.quoteQuantity
        }

        let ordinalAmount
        if (typeof(party.baseQuantity) == "string") {
            ordinalAmount = parseInt(party.baseQuantity, 10)
        }
        else {
            ordinalAmount = party.baseQuantity
        }

        const swapinfo = party.state.shared.swapinfo

        const wif = this.node2.creds.wif
        const seekerPair = bitcoin.ECPair.fromWIF(wif, NETWORK)
        const seekerPublicKey = seekerPair.publicKey

        const secretSeeker_p2wpkh = bitcoin.payments.p2wpkh({pubkey: seekerPublicKey, NETWORK});

        const secretSeeker_redeemAddress = secretSeeker_p2wpkh.address;

        const psbt = new bitcoin.Psbt({NETWORK});

        const amountAndFee = ordinalAmount + fee;
        console.log(`### fee           ###: ${fee}`)
        console.log(`### fee (type)    ###: ${typeof(fee)}`)
        console.log(`### amount        ###: ${ordinalAmount}`)
        console.log(`### amount (type) ###: ${typeof(ordinalAmount)}`)
        console.log(`### amountAndFee  ###: ${amountAndFee}`)

        const height = party.state.initialHeight
        console.log(`### height (type) ###: ${typeof(height)}`)
        console.log(`### height  ###: ${height}`)

        const scantx = await carol.command([{method: 'scantxoutset', parameters: ['start', [{ "desc": `${swapinfo.descriptor}`}] ]}]); // TODO: add range

        // for basic demo - assume one payment
        // later accommodate multiple payments that add up to at least amount + fee with sufficient confirmations for all

        const success = scantx[0].success;
        if (!success) {
            console.log("scan for tx outputs failed")
            return void 0;
            // TODO: throw exception?
        }

        const currentHeight = scantx[0].height;
        const totalAmount = Math.round(scantx[0].total_amount * 10E7);
        console.log(`### totalAmount   ###: ${totalAmount}`)

        const utxos = scantx[0].unspents
        const numUtxos = utxos.length;

        if (numUtxos == 0) {
            console.log('payment not received yet')
            // TODO: determine return contract
            // return void 0;
            return party
        } else if (numUtxos > 1) {
            console.log(`multiple payments, numUtxos: ${numUtxos}`)
            // TODO: determine return contract and implement handling in time
            return void 0;
        } else if (numUtxos == 1) {
            // current happy path
        } else {
            console.log(`unusual value for numUtxos: ${numUtxos}`)
            // TODO: throw exception?
            return void 0;
        }

        const utxo = utxos[0]
        const paymentTxHeight = utxo.height
        const confirmations = currentHeight - paymentTxHeight + 1;
        if (confirmations < REQUIRED_CONFIRMATIONS) {
            console.log(`insufficient confirmations so far: ${confirmations} (must be ${REQUIRED_CONFIRMATIONS} or greater)`)    // TODO: determine return contract
            return void 0;
        }

        const timeZero = swapinfo.timelock - RELATIVE_SWAP_TIMELOCK;
        const paymentDeadline = timeZero + RELATIVE_PAYMENT_DEADLINE

        if (paymentTxHeight > paymentDeadline ) {
            console.log(`L1 payment was made late, you really shouldn't have paid the invoice, payment height: ${paymentTxHeight}, payment deadline: ${paymentDeadline}, timelock: ${swapinfo.timelock}`)
            // continue anyway
        }

        if (totalAmount < amountAndFee) {
            console.log(`amount paid insufficient, expect ${amountAndFee}, paid ${totalAmount}`)
            // TODO: determine return contract
            return void 0;
        }

        const auth = {
            cert: this.node1.creds.cert,
            macaroon: this.node1.creds.adminMacaroon,
            socket: this.node1.creds.socket
        }

        const carolAdmin = ln.authenticatedLndGrpc(auth)
        const request = party.state.shared.request
        carolAdmin.request = request
        const details = await decodePaymentRequest(carolAdmin).catch(reason => console.log(reason))
        const swapHash = party.swapHash
        if (swapHash !== details.id) {
            throw new Error('Swap hash does not match payment hash for invoice ')
        }

        console.log('Bob about to pay invoice')
        const paidInvoice = await payViaPaymentRequest(carolAdmin).catch(reason => console.log(reason))

        console.log(`paidInvoice.secret: ${paidInvoice.secret}`)
        const secret = paidInvoice.secret


        psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            sequence: 0xfffffffe,
            witnessUtxo: {
                script: Buffer.from('0020' + bitcoin.crypto.sha256(Buffer.from(swapinfo.witnessScript, 'hex')).toString('hex'), 'hex'),
                value: amountAndFee
            },
            witnessScript: Buffer.from(swapinfo.witnessScript, 'hex')
        });

        psbt.addOutput({
            address: secretSeeker_redeemAddress,
            value: amountAndFee - DEFAULT_MINER_FEE
        });

        console.log(`secretSeeker_redeemAddress: ${secretSeeker_redeemAddress}`)


        psbt.signInput(0, seekerPair);

        psbt.finalizeInput(0, (inputIndex, input, script) => {
            const p2wsh = bitcoin.payments.p2wsh({
                redeem: {
                    input: bitcoin.script.compile([
                        input.partialSig[inputIndex].signature,
                        Buffer.from(secret, 'hex')
                    ]),
                    output: Buffer.from(script, 'hex')
                }
            });
            return {
                finalScriptWitness: witnessStackToScriptWitness(p2wsh.witness)
            }
        })
        const transaction = psbt.extractTransaction();

        try {
            const txid = await carol.command([{method: 'sendrawtransaction', parameters: [`${transaction.toHex()}` ]}]);
            party.state.shared.txid = txid
            // return transaction.toHex();
        } catch( exception ) {
            console.log(`Failed broadcast of commit transaction, exception: ${exception}`)
            // return transaction.toHex();
        }
        party.state.shared.transaction = transaction.toHex()
        return party

    }

    async abort(party, opts) {
        throw new Error('not implemented!')
    }


    static fromProps(party, nodesProps) {

        const props1 = nodesProps[0]
        const props2 = nodesProps[1]
        const Node1 = require(`../seekernode/ordinal-${props1.nodetype}`);
        const Node2 = require(`../seekernode/ordinal-${props2.nodetype}`);
        const node1 = new Node1(props1)
        const node2 = new Node2(props2)
        return new Ordinal(party, node1, node2)
    }



}