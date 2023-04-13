const cote = require('cote');
let Web3 = require('web3');
const { ethers } = require("ethers");

class ChannelCoordinator {
    constructor(){
        this.signatures = {};
        this.web3 = new Web3();    
        this.name = "COORDINATOR";
    }

    async connect(){
        this.publisher = new cote.Publisher({ name: 'service publisher' });
        this.subscriber = new cote.Subscriber({ name: 'service subscriber' });
       
        this.subscriber.on('secret', (update) => {
            console.log(this.name, "SECRET RECEIVED FROM KNOWER", update);

            let hash = this.computeHashOfSecret(update.secret);

            console.log(this.name, "HASH OF SECRET", hash);

            console.log(this.name, "PUBLISHING KNOWN SIGNATURES", this.signatures[hash]);
            this.publisher.publish('transfersigs', {
                hashOfSecret: hash,
                signatures: this.signatures[hash],
            });
        })

        this.subscriber.on('signed', (update) => {
            console.log(this.name, "RECEIVED TRANSFER SIGNATURE", update)

            if(!this.signatures[update.hashOfSecret]) this.signatures[update.hashOfSecret] = {};

            this.signatures[update.hashOfSecret][update.signer] = update.signature;
            //this.publisher.publish
        })
    }

    computeHashOfSecret(secret){               
        return ethers.sha256(secret); //use btc compatible hash for secrets
    }    
}

module.exports = ChannelCoordinator;
