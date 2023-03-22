const Template = require('../template')


module.exports = class HolderTemplate extends Template {
  constructor(party, node1, node2) {
    super(party)
    this.node1 = node1
    this.node2 = node2
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