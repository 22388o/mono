const Node = require('./node')

module.exports = class Node2 extends Node {
    constructor(props) {
        super(props)
        // console.log(`seeker - submarine - bitcoind: ${JSON.stringify(props, null, 2)}`)
        this.creds = {
            rpcuser: props.rpcuser,
            rpcpassword: props.rpcpassword,
            rpcport: props.rpcport,
            wif: props.wif
        }
    }

}