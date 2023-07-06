const Node = require('./node')

module.exports = class Node1 extends Node {
  constructor (props) {
    super(props)

    console.log("seeker lnd node: ", JSON.stringify(props, null, 2))

    this.creds = {
      socket: props.socket,
      cert: props.cert,
      adminMacaroon: props.admin,
      invoiceMacaroon: props.invoice
    }
  }
}
