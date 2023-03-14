/**
 * @file Exposes L2 channels
 */

const { EventEmitter } = require('events')
const debug = require('debug')('channels')

/**
 * Forwards events to the specified EventEmitter instance
 * @param {EventEmitter} self The EventEmitter instance that will fire the event
 * @param {String} event The event being fired/handled
 * @returns {[Void}
 */
function forwardEvent (self, event) {
    return function (...args) {
        self.emit('log', 'info', `channels.${event}`, ...args)
        self.emit(event, ...args)
    }
}

/**
 * Exposes L2 channel info
 * @type {Channels}
 */
module.exports = class Channels extends EventEmitter {
    constructor(props, ctx) {
        super()

        this.ctx = ctx

        Object.seal(this)
    }

    async getBalance (opts) {
        debug(`\nChannels.getBalance:  ${JSON.stringify(opts)}`)

        debug(`\nSupported networks: ${JSON.stringify(this.ctx.networks.SUPPORTED)}`)

        const result = {balances: []}
        for (const entry of Object.entries(opts)) {
            const [network, creds] = entry
            debug(`${network}: ${JSON.stringify(creds)}`)
            if (network == 'lightning') { // TEMP
                debug(`--> ${JSON.stringify(this.ctx.networks)}`)
                const balance = await this.ctx.networks['lightning.btc'].getBalance(creds)
                debug(`balance returned from lightning.getBalance: ${JSON.stringify(balance)}`)
                result['balances'].push(balance)
            }
        }
        return result

    }
}