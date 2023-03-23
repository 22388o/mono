const Template = require('../template')
const ln = require('lightning')

module.exports = class SeekerTemplate extends Template {
    constructor(party, node1, node2) {
        super(party)

        this._node1 = node1
        this._node2 = node2

    }

    get node1() {
        return this._node1
    }

    get node2() {
        return this._node2
    }

    // async open (party, opts) {
    //     console.log('\nlightning.open', this, party, opts)
    //
    //     // Requests are made using the Invoice macaroon for both parties
    //     const grpc = ln.authenticatedLndGrpc({
    //         cert: opts.lightning.cert,
    //         macaroon: opts.lightning.invoice,
    //         socket: opts.lightning.socket
    //     })
    //
    //     // Invoices are for the quantity of tokens specified by the counterparty
    //     const args = Object.assign(grpc, {
    //         id: party.swap.secretHash,
    //         tokens: party.counterparty.quantity
    //     })
    //
    //     // Newly created invoices are saved into the Counterparty's state-bag
    //     try {
    //         debug(party.id, `is creating an ${this.name} invoice`)
    //         const invoice = await ln.createHodlInvoice(args)
    //         debug(party.id, `created a ${this.name} invoice`, invoice)
    //         party.counterparty.state[this.name] = { invoice }
    //     } catch (err) {
    //         debug(party.id, 'createHodlInvoice', err)
    //         if (err instanceof Array) {
    //             // ln errors are arrays with 3 elements
    //             // 0: Numeric error code (HTTP status code)
    //             // 1: String error code
    //             // 2: JSON object with an `err` property
    //             throw Error(err[2].err.details)
    //         } else {
    //             throw err
    //         }
    //     }
    //
    //     if (party.isSecretSeeker) {
    //         // no-op
    //     } else if (party.isSecretHolder) {
    //         // For the SecretHolder, setup subscription(s) to auto-settle the invoice
    //         try {
    //             const subscription = await ln.subscribeToInvoice(args)
    //             subscription.on('invoice_updated', invoice => {
    //                 if (invoice.is_held) {
    //                     invoice.secret = opts.secret
    //                     ln.settleHodlInvoice(opts)
    //                 }
    //             })
    //         } catch (err) {
    //             debug(party.id, '(secretHolder) subscribeToInvoice', err)
    //             if (err instanceof Array) {
    //                 // ln errors are arrays with 3 elements
    //                 // 0: Numeric error code (HTTP status code)
    //                 // 1: String error code
    //                 // 2: JSON object with an `err` property
    //                 throw Error(err[2].err.details)
    //             } else {
    //                 throw err
    //             }
    //         }
    //     } else {
    //         throw Error('multi-party swaps are not supported!')
    //     }
    //
    //     return party
    // }

    async open(party, opts) {
        console.log("Open in seekerTemplate")
        return party
    }

    static fromProps(party, swapType, secretSeekerProps) {
        const nodesProps = secretSeekerProps.templateProps.nodes[swapType]

        let template

        switch(swapType) {
            case 'submarine':
                const Submarine = require('./submarine')
                template = Submarine.fromProps(party, nodesProps)
                break
            default:
                template = null
        }
        return template

    }
}