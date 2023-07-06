const Template = require('../template')
const { normalize } = require('../adaptor/adaptor')

module.exports = class HolderTemplate extends Template {
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
    console.log('Open in holderTemplate')
    return party
  }

  async commit (party, opts) {
    console.log('Commit in holderTemplate')
    return party
  }

  async abort (party, opts) {
    console.log('Abort in holderTemplate')
    return party
  }

  static fromProps (party, swapType, holderSeekerProps) {

    const defaultNodeProps = holderSeekerProps.defaultTemplateProps.nodes[swapType]
    console.log('holder defaultNodeProps: ', defaultNodeProps)

    const specificNodeProps = holderSeekerProps.templateProps.nodes[swapType]

    const adaptor = holderSeekerProps.defaultTemplateProps.adaptor
    console.log('adaptor: ', adaptor)

    console.log('specificNodeProps: ', JSON.stringify(specificNodeProps, null, 2))

    let nodesProps = []
    for (const [i, props] of specificNodeProps.entries()) {
      const normalizedProps = normalize(adaptor, defaultNodeProps[i])
      console.log('i: ', i)
      console.log('props at i: ', props)
      console.log('normalizedProps at i: ', JSON.stringify(normalizedProps, null, 2))
      nodesProps[i] = { ...normalizedProps, ...props }
    }

    console.log("holder nodesProps: ", JSON.stringify(nodesProps))

    console.log('in holder template fromProps - swapType: ', swapType)

    let template

    console.log('in holder template fromProps - swapType: ', swapType)

    switch (swapType) {
      case 'submarine':
        const Submarine = require('./submarine')
        template = Submarine.fromProps(party, nodesProps)
        break
      case 'ordinal':
        const Ordinal = require('./ordinal')
        template = Ordinal.fromProps(party, nodesProps)
        break
      default:
        template = null
    }
    return template
  }
}
