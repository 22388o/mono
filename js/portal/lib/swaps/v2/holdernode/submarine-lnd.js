const Node = require('./node')

module.exports = class Node1 extends Node {
    constructor(props) {
        super(props)
        // console.log(`holder - submarine - lnd: ${JSON.stringify(props, null, 2)}`)
        this.creds = {
            socket: props.socket,
            cert: props.cert,
            admin: props.admin,
            invoice: props.invoice
        }
    }

}