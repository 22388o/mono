

const HolderTemplate = require("./holdertemplate")
const ln = require('lightning')
const { createHodlInvoice, subscribeToInvoice, decodePaymentRequest, payViaPaymentRequest, settleHodlInvoice } = require('lightning')


module.exports = class Submarine extends HolderTemplate {

    constructor(party, node1, node2) {
        super(party, node1, node2)
    }

    async open(party, opts) {
        console.log("Open in holder submarine")
        console.log(`party: ${JSON.stringify(party, null, 2)}`)


        const carolInvoice2 = ln.authenticatedLndGrpc({
            cert: node1.creds.cert,
            macaroon: node1.creds.invoiceMacaroon,
            socket: node1.creds.socket
        })
        const swapHash = party.swapHash
        const quantity = party.quantity

        carolInvoice2.id = swapHash
        carolInvoice2.tokens = quantity
        console.log
        const request2 = (await createHodlInvoice(carolInvoice2)).request
        console.log(`request1: ${request2}`)

        // const subscription = await subscribeToInvoice(carolInvoice2)
        //
        // await subscription.on('invoice_updated', async invoice2 => {
        //     console.log('invoice updated for invoice1')
        //     if (invoice2.is_confirmed) {
        //         console.log('INVOICE in N2 PAID and SETTLED')
        //     }
        //
        //     if (!invoice2.is_held) {
        //         console.log('but not held')
        //         return
        //     }
        //
        //     console.log('invoice2 now held')
        //     console.log(`secret: ${party.state.secret}`)
        //     carolInvoice2.secret = party.state.secret
        //     console.log('about to settle invoice2')
        //     await settleHodlInvoice(carolInvoice2)
        //     console.log('Carol has performed paymentStep2 on invoice2')
        // })
        // console.log(`in commit for carol: request2: ${request2}`)
        // party.publicInfo.right.request = request2
        // party.state.right.lnd.subscription = subscription
    // }

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