const Template = require('../template')

module.exports = class SeekerTemplate extends Template {
  constructor (party, node1, node2) {
    super(party)

    this._node1 = node1
    this._node2 = node2
  }

  get node1 () {
    return this._node1
  }

  get node2 () {
    return this._node2
  }

  async open (party, opts) {
    console.log('Open in seekerTemplate')
    return party
  }

  async commit (party, opts) {
    console.log('Commit in seekerTemplate')
    return party
  }

  async abort (party, opts) {
    console.log('Abort in seekerTemplate')
    return party
  }

  static fromProps (party, swapType, secretSeekerProps) {
    const nodesProps = secretSeekerProps.templateProps.nodes[swapType]

    console.log("seeker nodesProps: ", JSON.stringify(nodesProps))

    console.log('in holder template fromProps - swapType: ', swapType)

    let template

    switch (swapType) {
      case 'submarine':
        const Submarine = require('./submarine')
        template = Submarine.fromProps(party, nodesProps)
        break
      case 'ordinal':
        console.log('seekerTemplate switch swapType: ordinal')
        const Ordinal = require('./ordinal')
        template = Ordinal.fromProps(party, nodesProps)
        console.log('template: ', JSON.stringify(template))
        break
      default:
        console.log('seekerTemplate switch swapType: default')
        template = null
    }
    return template
  }
}
