const cote = require('cote');
const { emit } = require('process');
let Web3 = require('web3');

const EventEmitter = require('events');


class SwapClient extends EventEmitter {

    constructor(props){
        super();

        this.keypair = props.keypair;
        this.address = this.keypair.address;
        let web3 = new Web3(); //new Web3.providers.HttpProvider(props.url)
        this.web3 = web3;  
        
        this.secrets = {};   
        this.received = {};
        this.signatures = {};
        this.knownPaymentSignatures = {};
        this.invoices = {};
        this.counterInvoiced = {};        

        this.name = this.address.substr(0,4);
        

        this.testMode = false;
    }

    genRanHex(size){ return  [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join(''); }

    connect(){
        this.subscriber = new cote.Subscriber({ name: 'client subscriber ' + this.name });
        this.publisher = new cote.Publisher({ name: 'client publisher ' + this.name });

        this.subscriber.on('transfersigs', update => this.handleSignaturesRevealed(update) )
        this.subscriber.on('transfer', update => this.handleTransfer(update) );
        this.subscriber.on('invoice', update => this.handleInvoice(update) );
        this.subscriber.on('secret', update => this.handleSecretRevealed(update) );
    }

    revealSecret(secret){
        console.log(this.name, "PUBLISHING SECRET", secret)
        this.publisher.publish('secret', {
            secret: secret
        })
    }

    handleSecretRevealed(update){
        let secret = update.secret;
        let hashOfSecret = this.computeHashOfSecret(secret);

        //only emit secret event if you didn't create the secret
        if(!this.secrets[hashOfSecret]){        
            console.log( this.name, "SECRET REVEALED", secret, hashOfSecret);
            this.emit("secret", secret);
        }
    }

    handleSignaturesRevealed(update){
        console.log(this.name, "RECEIVED SIGS FROM COORDINATOR", update);
       
        let hash = update.hashOfSecret;
        let received = this.received[hash];

        if(!received){
            console.log(this.name, "IGNORING SIGS, HAVENT RECEIVED PAYMENT FOR THIS HASH", update.hashOfSecret);
            return;
        }

        let message = received.hashOfSecret + received.amount;            
        let recovered = this.verifyMessage(update.signatures[received.sourceAddress], message, received.sourceAddress);
        console.log(this.name + " RECOVERED ADDRESS", recovered, "==", received.sourceAddress);

        if(recovered != received.sourceAddress){
            console.log("INVALID SIGNATURE")
            return;
        }else{
            console.log("VALID SIGNATURE")
            this.signatures[update.hashOfSecret] = update.signatures;
            this.knownPaymentSignatures[update.hashOfSecret] = update.signatures[received.sourceAddress];
        }        
    }

    handleTransfer(update){
        
        if(update.invoiceId && update.sourceAddress==this.address) this.emit("invoicePaidByMe", update);
        
        if(update.targetAddress != this.address) return;

        console.log(this.name, "INCOMING PAYMENT", update);

        //if it's an incoming payment save it in local storage        
        this.received[update.hashOfSecret] = update;        
        
        if(!this.secrets[update.hashOfSecret]){ //if secret is not known just send back same amount of token            
            console.log(this.name, "DONT KNOW SECRET");
            if(this.testMode) this.testModeCounterPayment(update)                    
            this.emit("initialPaymentReceived", update);
        }else{ //if you know the secret and received counterpayment, reveal secret to network
            console.log(this.name, "DO KNOW SECRET");
            //for test purposes reveal secret automatically when any counter-payment comes in
            if(this.testMode) this.revealSecret(this.secrets[update.hashOfSecret]);            

            if(update.invoiceId) this.emit("invoicePaid", update);

            this.emit("counterPaymentReceived", update);        
        }


    }

    testModeCounterPayment(update){
        if(!update.invoiceId) {
            this.sendCounterPayment(update);   
        }else{ 
            //this.createCounterInvoice(update)
            //this.emit("invoicePaid", update);
        }
    }

    sendCounterPayment(update){
        console.log(this.name, "SENDING BACK SAME AMOUNT");

        this.sendTransfer({
            tokenAddress: update.tokenAddress, amount: update.amount, 
            hashOfSecret: update.hashOfSecret, targetAddress: update.sourceAddress
        });        
    }

    createCounterInvoice(update, hashOfSecret){    
        if(update.originalInvoiceId) {
            console.log(this.name, "INVOICE ALREADY A COUNTER INVOICE, NOT COUNTER-INVOICING")
            return;
        }
        
        console.log(this.name, "AUTOMATICALLY SENDING COUNTER-INVOICE")

        this.createInvoice({
            tokenAddress: update.tokenAddress, amount: update.amount, 
            hashOfSecret: update.hashOfSecret || hashOfSecret, payee: this.address,
            originalInvoiceId: update.invoiceId || update.id
        })

        this.counterInvoiced[update.hashOfSecret] = true;
    }

    handleInvoice(invoice){
        this.invoices[invoice.id] = invoice;

        //don't process your own invoice
        if(invoice.payee == this.address) {
            this.emit("invoiceFromMe", invoice);
            return;
        }

        if(!invoice.hashOfSecret){ //TODO: default behavior for original invoice
        }else{ //TODO: default behavior for original invoice 
        }
        
        if(this.testMode){
            //TODO: send counter invoice
            console.log(this.name, "RECEIVED INVOICE, AUTOMATICALLY PAYING IT", invoice)
            
            let transfer = this.payInvoice(invoice);
            this.createCounterInvoice(invoice, transfer.hashOfSecret);
        }

        this.emit('invoice', invoice);
    }

    createInvoice(params){
        console.log("createInvoice");
        params.payee = this.address;
        params.id = this.generateRandomSecret();

        console.log(this.name, "SENDING INVOICE", params)
        this.publisher.publish("invoice", params);

        return params;
    }

    payInvoice(invoice){    
        if(typeof invoice == "string") invoice = this.invoices[invoice.id];
        else if(!invoice.payee) {
            let lookedup = this.invoices[invoice.id];
            if(lookedup) invoice.payee = lookedup.payee;
        }

        return this.sendTransfer({
            tokenAddress: invoice.tokenAddress, amount: invoice.amount,
            targetAddress: invoice.payee, invoiceId: invoice.id,
            hashOfSecret: invoice.hashOfSecret,
        })
    }

    sendTransfer(params){
        if(!params.hashOfSecret){ //if a hash of secret is not provided, generate one and store it
            let secret = this.generateRandomSecret();
            let hash = this.computeHashOfSecret(secret);
            this.secrets[hash] = secret;
        
            console.log(this.name, "SENDING TRANSFER SECRET", secret, "HASH", hash);
        
            params.hashOfSecret = hash;
        }

        params.sourceAddress = this.address;

        this.publisher.publish('transfer', params);
        this.publisher.publish("signed", {
            hashOfSecret: params.hashOfSecret,
            signature: this.signMessage(this.serializeTransfer(params)).signature,
            targetAddress: params.targetAddress,
            signer: params.sourceAddress,
        })

        return params;
    }

    serializeTransfer(params){
        return params.hashOfSecret + params.amount;
    }

    computeHashOfSecret(secret){
        return this.web3.utils.soliditySha3(secret);
    }

    registerSecret(secret){
        let hash = this.computeHashOfSecret(secret);
        this.secrets[hash] = secret;
    }

    signMessage(msg) {
        
        let result = null;
      
        try {    
            console.log('from : ' + this.address);
                       
            console.log('msg : ' + msg);
            let sign = this.web3.eth.accounts.sign(msg, this.keypair.private)
            
            console.log('sign : ' + sign);
            
            result = sign;            
        } catch (err) {
            console.error(err);
        }
        return result;
    }

    verifyMessage(signature, message, sender) {
        if(!sender) sender = this.address;
        
        console.log(this.name + " verifying", signature, message);

        let recoveredAddr = null;

        try {
            const from = sender;
            const msg = message;
            recoveredAddr = this.web3.eth.accounts.recover(msg, signature);
            console.log(this.name + ' recoveredAddr : ' + recoveredAddr);
           
            if (recoveredAddr.toLowerCase() === from.toLowerCase()) {
                //console.log(this.name + ` Successfully ecRecovered signer as ${recoveredAddr}`);
             
            } else {
                //console.log(`Failed to verify signer when comparing ${recoveredAddr} to ${from}`);                
            }
        } catch (err) {
            console.error(err);
        }

        return recoveredAddr;
    }

    generateRandomSecret(){
        return '0x' + this.genRanHex(64)
    }
}

module.exports = SwapClient;



