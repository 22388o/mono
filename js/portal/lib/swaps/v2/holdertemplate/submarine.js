

const HolderTemplate = require("./holdertemplate")

module.exports = class Submarine extends HolderTemplate {

    constructor(party, node1, node2) {
        super(party, node1, node2)
    }

    static fromProps(party, nodesProps) {

        console.log(`HolderTemplate: ${HolderTemplate}`)
        const props1 = nodesProps[0]
        const props2 = nodesProps[1]
        const Node1 = require(`../holdernode/submarine-${props1.nodetype}`);
        const Node2 = require(`../holdernode/submarine-${props2.nodetype}`);
        const node1 = new Node1(props1)
        const node2 = new Node2(props2)
        return new Submarine(party, node1, node2)
    }
mai
}