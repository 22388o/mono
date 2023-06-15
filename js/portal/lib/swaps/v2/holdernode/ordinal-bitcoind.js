
const Node = require('./node')

module.exports = class Node2 extends Node {
  constructor (props) {
    super(props)

    this.creds = {
      rpcuser: props.rpcuser,
      rpcpassword: props.rpcpassword,
      rpcport: props.rpcport,
      wif: props.wif
    }
    // console.log(`holder - submarine - bitcoind: ${JSON.stringify(props, null, 2)}`)
  }
}
