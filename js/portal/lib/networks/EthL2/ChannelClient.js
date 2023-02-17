const cote = require('cote');
const { emit } = require('process');
let Web3 = require('web3');
let Web3legacy = require('web3melnx');

const EventEmitter = require('events');
const Common = require('ethereumjs-common').default
const Tx = require('ethereumjs-tx').Transaction

class ChannelClient extends EventEmitter {

    constructor(props){
        super();

        this.keypair = props.keypair;
        this.address = this.keypair.address;
        let web3new = new Web3(); //new Web3.providers.HttpProvider(props.url)
        this.web3new = web3new;  

        let web3 = new Web3legacy(new Web3legacy.providers.HttpProvider(props.rpc));
        web3.chainId = props.chainId;
        this.web3 = web3;        

        this.channelContractAddress = '0x8a14863aDEE8926edD56f263d026AD2816f1C983';
        let abi = require('./abi_multichannel.js');
        this.channelContract = this.web3.eth.contract(abi).at(this.channelContractAddress);
        
        console.log("ETH_RPC:", props.rpc);

        this.secrets = {};   
        this.received = {};
        this.signatures = {};
        this.knownPaymentSignatures = {};
        this.invoices = {};
        this.counterInvoiced = {};      
        
        this.channels = {};        

        this.name = this.address.substr(0,4);
        
        this.testMode = props.testMode;
    }

    connect(){
        console.log(this.name, "CONNECTING CLIENT")
        this.subscriber = new cote.Subscriber({ name: 'client subscriber ' + this.name });
        this.publisher = new cote.Publisher({ name: 'client publisher ' + this.name });

        this.subscriber.on('transfersigs', update => this.handleSignaturesRevealed(update) )
        this.subscriber.on('transfer', update => this.handleTransfer(update) );
        this.subscriber.on('invoice', update => this.handleInvoice(update) );
        this.subscriber.on('secret', update => this.handleSecretRevealed(update) );
    }

    toJSON(){
        return {
            address: this.address,
            name: this.name,
            channels: this.channels,
            secrets: this.secrets,            
        }
    }

    //////////////////////////////////////////////////////////////////////////////
    // CHANNEL MANAGEMENT FUNCTIONS

    async loadChannel(sourceAddress, targetAddress, tokenAddress='0x00'){
        let channelId = this.getChannelId(sourceAddress, targetAddress, tokenAddress);
       
        let chan = await this.channelContract.channels(channelId);

        console.log(this.name, "CHANNEL FROM CHAIN", chan);
    
        let sender = chan[0]; let receiver = chan[1]; let deposited = chan[2]; let claimed = chan[3];
        if(!(sender.toLowerCase() == sourceAddress.toLowerCase() && receiver.toLowerCase() == targetAddress.toLowerCase())){
            //throw(this.name + " channel not opened " + sourceAddress + "=>" + targetAddress)
            return null;
        }

        let channel = {
            id: channelId,
            tokenAddress: tokenAddress,
            spender: sourceAddress, 
            recipient: targetAddress,
            deposited: parseInt(deposited.toFixed()), 
            spent: parseInt(claimed.toFixed()), 
        }
        this.channels[channelId] = channel;

        console.log("LOADED CHANNEL FROM CHAIN", channel);
        
        return channel;
    }

    async getOrLoadChannel(sourceAddress, targetAddress, tokenAddress){
        let channel = this.getChannel(sourceAddress, targetAddress, tokenAddress);

        if(!channel){
            console.log(this.name, "CHANNEL NOT LOADED YET, LOADING FROM CHAIN")
            channel = await this.loadChannel(sourceAddress, targetAddress);
        }       

        return channel;
    }

    async depositToChannel(channelId, amount){
        return await this._callSolidity('deposit', [channelId], this.keypair, amount)
    }

    async openChannel(targetAddress, capacity, tokenAddress='0x00'){
        return await this._callSolidity('openChannel', [targetAddress], this.keypair, capacity)
    }

    async settleChannel(channelId, amount, signature){
        return await this._callSolidity('settle', [channelId, amount, signature], this.keypair)
    }

    getChannelId(sourceAddress, targetAddress, tokenAddress='0x00'){        
        let buffer = this.concatHex(this.channelContractAddress, sourceAddress, targetAddress);       
        return this.computeHashKeccak(buffer) //, tokenAddress
    }

    getChannelCapacity(channel){
        if(typeof channel == 'string') channel = this.channels[channel];

        //TODO: look up from smart contract
        return channel.deposited - channel.spent;
    }

    getChannelBalance(channel){
        if(typeof channel == 'string') channel = this.channels[channel];        
        if(channel.recipient == this.address) return channel.spent;
        if(channel.spender == this.address) return this.getChannelCapacity(channel);
        return null;
    }

    concatHex(){
        var args = Array.prototype.slice.call(arguments);
        return '0x' + args.map(x => x.startsWith('0x') ? x.substr(2) : x ).join('');
    }

    getChannel(sourceAddress, targetAddress, tokenAddress='0x00'){
        return this.channels[ this.getChannelId(sourceAddress, targetAddress, tokenAddress) ];
    }

    getBalance(tokenAddress='0x00'){
        let sum = 0;
        for(var id in this.channels){
            let channel = this.channels[id];
            if(channel.tokenAddress == tokenAddress){
                sum += this.getChannelCapacity(channel);
            }
        }
        return sum;
    }

    //////////////////////////////////////////////////////////////////////////////
    // LOCAL STATE FUNCTIONS

    registerSecret(secret){
        let hash = this.computeHash(secret);
        this.secrets[hash] = secret;
    }

    //////////////////////////////////////////////////////////////////////////////
    // NETWORK ACTION FUNCTIONS

    revealSecret(secret){
        console.log(this.name, "PUBLISHING SECRET", secret)
        this.publisher.publish('secret', {
            secret: secret
        })
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

    updateChannelState(channel, params){
        if(typeof channel == 'string') channel = this.channels[channel];

        if(params.transfer){
            let transfer = params.transfer;
            channel.spent += parseInt(transfer.amount);
        }            
    }

    async sendTransfer(transfer){
        let channel = await this.getOrLoadChannel(this.address, transfer.targetAddress, transfer.tokenAddress);
        if(!channel){
            console.log(this.name, "CHANNEL NOT OPENED TO", transfer.targetAddress);
            return null;
        }

        console.log("CHANNEL", channel);
        let capacity = this.getChannelCapacity(channel);

        if(capacity < parseInt(transfer.amount)){
            console.log(this.name, "NOT ENOUGH CAPACITY", capacity, "FOR AMOUNT", transfer.amount)
            return null;
        }
        
        if(!transfer.hashOfSecret){ //if a hash of secret is not provided, generate one and store it
            let secret = this.generateRandomSecret();
            let hash = this.computeHash(secret);
            this.secrets[hash] = secret;
        
            console.log(this.name, "TRANSFER SECRET", secret, "HASH", hash);
        
            transfer.hashOfSecret = hash;
        }

        transfer.channelId = channel.id;

        //TODO: move this into signature reveal callback
        this.updateChannelState(channel, {transfer}); //increment channel spent by transfer amount
        transfer.spent = channel.spent.toString();    

        transfer.sourceAddress = this.address;

        console.log(this.name, "OUTGOING TRANSFER", transfer)
        console.log(this.name, "NEW CHANNEL BALANCE PENDING", this.getChannelBalance(channel) )
   
        this.publisher.publish('transfer', transfer);
        this.publisher.publish("signed", {
            hashOfSecret: transfer.hashOfSecret,
            signature: this.signMessage(this.encodeTransferForSig(transfer)).signature,
            targetAddress: transfer.targetAddress,
            signer: transfer.sourceAddress,
        })

        return transfer;
    }


    //////////////////////////////////////////////////////////////////////////////
    // NETWORK EVENT HANDLERS

    handleSecretRevealed(update){
        let secret = update.secret;
        let hashOfSecret = this.computeHash(secret);

        //only emit secret event if you didn't create the secret
        if(!this.secrets[hashOfSecret]){        
            console.log( this.name, "SECRET REVEALED", secret, hashOfSecret);
            this.emit("secret", secret);
        }
    }

    async handleSignaturesRevealed(revealed){
        //ignore if sigs already know
        if(this.signatures[revealed.hashOfSecret]) return;
     
        let hash = revealed.hashOfSecret;
        let received = this.received[hash];

        if(!received){
            console.log(this.name, "IGNORING SIGS, HAVENT RECEIVED PAYMENT FOR THIS HASH", revealed.hashOfSecret);
            this.signatures[revealed.hashOfSecret] = revealed.signatures;
            return false;
        }
        console.log(this.name, "RECEIVED SIGS FROM COORDINATOR", revealed);      

        let message = this.encodeTransferForSig(received);            
        let recovered = this.verifyMessage(revealed.signatures[received.sourceAddress], message, received.sourceAddress);
        console.log(this.name, "RECOVERED ADDRESS", recovered, "==", received.sourceAddress);

        if(recovered.toLowerCase() != received.sourceAddress.toLowerCase()){
            console.log(this.name, "INVALID SIGNATURE")
            return false;
        }else{
            console.log(this.name, "VALID SIGNATURE")
            this.signatures[revealed.hashOfSecret] = revealed.signatures;
            this.knownPaymentSignatures[revealed.hashOfSecret] = revealed.signatures[received.sourceAddress];
            
            let channel = await this.getOrLoadChannel(received.sourceAddress, received.targetAddress, received.tokenAddress);

            if(!channel){
                console.log(this.name, "INCOMING CHANNEL NOT OPENED");
                return false;
            }

            channel.spent = received.spent;
            
            let balance = this.getChannelBalance(channel);
            console.log(this.name, "NEW CHANNEL BALANCE REVEALED", balance);
        } 
        
        return true;
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
            this.emit("counterPaymentReceived", update);        
        }

        if(update.invoiceId) this.emit("invoicePaid", update);
        this.emit("paymentReceived", update);
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

    //////////////////////////////////////////////////////////////////////////////
    // CRYPTOGRAPHIC UTILS

    decToUint256Hex(value){
        let res = parseInt(value).toString(16).padStart(64, '0');        
        return res;
    }

    encodeTransferForSig(params){            
        let message = this.concatHex(this.channelContractAddress, params.channelId, this.decToUint256Hex(params.spent));        
        return this.web3new.utils.keccak256(message);;
    }

    computeHashKeccak(message){
        return this.web3new.utils.keccak256(message);
    }

    computeHash(secret){
        return this.web3new.utils.soliditySha3(secret);
    }    

    signMessage(msg) {        
        let result = null;      
        try {    
            //console.log('from : ', this.address);                       
            //console.log('msg : ', msg);
            let sign = this.web3new.eth.accounts.sign(msg, this.keypair.private)            
            //console.log('sign : ', sign);            
            result = sign;            
        } catch (err) {
            console.error(err);
        }
        return result;
    }

    verifyMessage(signature, message, sender) {
        if(!sender) sender = this.address;        
        //console.log(this.name + " verifying", signature, message);

        let recoveredAddr = null;

        try {
            const from = sender;
            const msg = message;
            recoveredAddr = this.web3new.eth.accounts.recover(msg, signature);
            console.log(this.name + ' recoveredAddr : ' + recoveredAddr);
           
            if (recoveredAddr.toLowerCase() === from.toLowerCase()) {
                console.log(this.name, `Successfully ecRecovered signer as ${recoveredAddr}`);             
            } else {
                console.log(this.name, `Failed to verify signer when comparing ${recoveredAddr} to ${from}`);                
            }
        } catch (err) {
            console.error(err);
        }

        return recoveredAddr;
    }

    generateRandomSecret(){
        return '0x' + this.genRanHex(64)
    }

    genRanHex(size=64){ return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join(''); }


    //////////////////////////////////////////////////////////////////////////////
    // ETHEREUM HELPER

    async _callSolidity (funcName, funcParams, keys, ethValue) {
        return new Promise((resolve, reject) => {
          let web3 = this.web3;
          let contract = this.channelContract;

          const txMetadata = { from: keys.address, value: ethValue }
          const func = contract[funcName]
          const paramsArray = [...funcParams, txMetadata]
          const getData = func.getData
          const calldata = getData.apply(func, paramsArray)
          const estimateGasArgs = {
            from: keys.address,
            to: contract.address,
            gas: '1000000',
            value: ethValue,
            data: calldata
          }
    
          web3.eth.estimateGas(estimateGasArgs, function (err, estimatedGas) {
            if (err) return reject(err)
    
            web3.eth.getGasPrice((err, gasPrice) => {
              if (err) return reject(err)
    
              web3.eth.getTransactionCount(keys.address, (err, nonce) => {
                if (err) return reject(err)
    
                const txObj = {
                  gasPrice: web3.toHex(gasPrice.mul(2)),
                  gasLimit: web3.toHex(estimatedGas * 2),
                  data: calldata,
                  from: keys.address,
                  to: contract.address,
                  nonce,
                  value: ethValue,
                  chainId: web3.chainId // ropsten = 3, mainnet = 1
                }
                const common = Common.forCustomChain('mainnet', {
                  name: 'shyft',
                  chainId: web3.chainId,
                  networkId: web3.chainId
                }, 'petersburg')
                const tx = new Tx(txObj, { common })
                tx.sign(Buffer.from(keys.private, 'hex'))
                const stx = `0x${tx.serialize().toString('hex')}`
    
                web3.eth.sendRawTransaction(stx, (err, hash) => {
                  if (err) return reject(err)
    
                  console.log("TX HASH", funcName, hash)

                  ;(function pollForReceipt () {
                    web3.eth.getTransactionReceipt(hash, function (err, receipt) {
                      if (err != null) {
                        reject(err)
                      } else if (receipt != null) {
                        resolve(receipt)
                      } else {
                        setTimeout(pollForReceipt, 10000)
                      }
                    })
                  }())
                })
              })
            })
          })
        })
    }

    //////////////////////////////////////////////////////////////////////////////
    // TEST-MODE FUNCTIONS

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
}

module.exports = ChannelClient;



