

const SeekerTemplate = require('./seekertemplate')



module.exports = class Submarine extends SeekerTemplate {
    constructor(party, node1, node2) {
        super(party, node1, node2)
    }

    static fromProps(party, nodesProps) {

        const props1 = nodesProps[0]
        const props2 = nodesProps[1]
        const Node1 = require(`../seekernode/submarine-${props1.nodetype}`);
        const Node2 = require(`../seekernode/submarine-${props2.nodetype}`);
        const node1 = new Node1(props1)
        const node2 = new Node2(props2)
        return new Submarine(party, node1, node2)
    }

}