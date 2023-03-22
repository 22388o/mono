const Template = require('../template')

module.exports = class SeekerTemplate extends Template {
    constructor(party, node1, node2) {
        super(party)

        this.node1 = node1
        this.node2 = node2

        // super({ name: props.name, assets: props.assets })
    }

    static fromProps(party, swapType, secretSeekerProps) {
        const nodesProps = secretSeekerProps.templateProps.nodes[swapType]

        // const node1 = Node.fromProps(nodesProps[1])
        // const node2 = Node.fromProps(nodesProps[2])

        // console.log(`seekerTemplate.fromProps: ${JSON.stringify(nodes, null, 2)}`)

        // return new SeekerTemplate(party, node1, node2)
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