

const HolderTemplate = require("./holdertemplate")
const ln = require('lightning')
const { createInvoice, createHodlInvoice, subscribeToInvoice, decodePaymentRequest, payViaPaymentRequest, settleHodlInvoice } = require('lightning')

const bitcoin = require('bitcoinjs-lib');

module.exports = class Submarine extends HolderTemplate {

    constructor(party, node1, node2) {
        super(party, node1, node2)
    }

    async open(party, opts) {
        console.log("Open in holder submarine")
        console.log(`party: ${JSON.stringify(party, null, 2)}`)

        const wif = this.node2.creds.wif
        console.log(`wif: ${wif}`)
        const network = bitcoin.networks.regtest
        console.log(`network: ${network}`)
        const holderPair = bitcoin.ECPair.fromWIF(wif, network);
        console.log(`holderPair created`)
        const holderPublicKey = holderPair.publicKey.toString('hex');
        console.log(`holderPublicKey: ${holderPublicKey}`)

        party.state.shared.holderPublicKey = holderPublicKey

        const auth = {
            cert: this.node1.creds.cert,
            macaroon: this.node1.creds.invoiceMacaroon,
            socket: this.node1.creds.socket
        }
        console.log(`auth: ${JSON.stringify(auth, null, 2)}`)

        const carolInvoice = ln.authenticatedLndGrpc(auth)


        console.log(`party: ${JSON.stringify(party, null, 2)}`)
        const swapHash = party.swapHash
        const quantity = party.quantity
        const swapSecret = party.state.secret
        const fee = party.fee

        carolInvoice.id = swapHash
        carolInvoice.secret = swapSecret
        carolInvoice.tokens = quantity
        console.log(`carolInvoice: ${JSON.stringify(carolInvoice, null, 2)}`)
        // const request2 = (await createHodlInvoice(carolInvoice)).request

        let request
        try {
            request = (await createHodlInvoice(carolInvoice)).request
        }
        catch(err) {
            console.log(`Error: ${err}`)
        }
        console.log(`request: ${request}`)

        const subscription = await subscribeToInvoice(carolInvoice)

        await subscription.on('invoice_updated', async invoice => {
            // console.log('invoice updated for invoice')
            if (invoice.is_confirmed) {
                console.log(`INVOICE for ${party.id} PAID and SETTLED`)
            }

            if (!invoice.is_held) {
                // console.log('but not held')
                return
            }

            // console.log('invoice now held')
            console.log(`secret: ${swapSecret}`)
            carolInvoice.secret = swapSecret
            // console.log('about to settle invoice')
            await settleHodlInvoice(carolInvoice)
            // console.log('Carol has performed paymentStep2 on invoice')
        })
        // console.log(`in commit for carol: request2: ${request}`)
        party.state.shared.request = request
        party.state.shared.holderFee = fee
        party.state.subscription = subscription

        console.log(`party in holder submarine: ${JSON.stringify(party, null, 2)}`)
        return party
    }

    static fromProps(party, nodesProps) {

        // console.log(`HolderTemplate: ${HolderTemplate}`)
        const props1 = nodesProps[0]
        const props2 = nodesProps[1]
        const Node1 = require(`../holdernode/submarine-${props1.nodetype}`);
        const Node2 = require(`../holdernode/submarine-${props2.nodetype}`);
        const node1 = new Node1(props1)
        const node2 = new Node2(props2)
        return new Submarine(party, node1, node2)
    }
mai
}