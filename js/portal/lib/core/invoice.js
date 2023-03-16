/**
 * @file Exposes L2 invoice
 */

const { EventEmitter } = require('events')
const debug = require('debug')('invoice')

/**
 * Forwards events to the specified EventEmitter instance
 * @param {EventEmitter} self The EventEmitter instance that will fire the event
 * @param {String} event The event being fired/handled
 * @returns {[Void}
 */
function forwardEvent (self, event) {
    return function (...args) {
        self.emit('log', 'info', `invoice.${event}`, ...args)
        self.emit(event, ...args)
    }
}

/**
 * Exposes L2 create invoice method
 * @type {Invoice}
 */
module.exports = class Invoice extends EventEmitter {
    constructor(props, ctx) {
        super()

        this.ctx = ctx

        Object.seal(this)
    }

    async createInvoice (opts) {
        debug(`\nInvoice.createInvoice:  ${JSON.stringify(opts)}`)
        // debug(`\nInvoice.createInvoice this.ctx:  ${JSON.stringify(opts)}`)

        debug(`\nSupported networks: ${JSON.stringify(this.ctx.networks.SUPPORTED)}`)

        const result = {invoices: []}
        // for (const entry of Object.entries(opts)) {
            // const {network, lndCreds, paymentAmount} = opts
            // debug(`${network}: ${JSON.stringify(lndCreds)}`)
            // if (network == 'lightning') { // TEMP
                debug(`--> ${JSON.stringify(this.ctx.networks)}`)
                const invoice = await this.ctx.networks['lightning.btc'].createInvoice(opts.lndCreds.lightning, opts.paymentAmount)
                debug(`invoice returned from lightning.createInvoice: ${JSON.stringify(invoice)}`)
                result['invoices'].push(invoice)
            // }
        // }
        return result

    }
}