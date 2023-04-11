const cote = require('cote');
const { emit } = require('process');
let Web3 = require('web3');
let Web3legacy = require('web3melnx');
const { ethers } = require("ethers");

const EventEmitter = require('events');
const Common = require('ethereumjs-common').default
const Tx = require('ethereumjs-tx').Transaction
NULL_ADDRESS =  '0x0000000000000000000000000000000000000000';

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

        this.l1SwapContractAddress = '0xFA0551AD1B896CC77f4750A2d6B6D3dF08e72c26'; //L1 swap contract

        this.channelContractAddress = '0x1d03039dfbA5939AA536aAb6dD77FF5Abf299485';//sepolia deployment

        //this.channelContractAddress = '0xa95d15f30E369151af5bf89dA1074ff1B6666864'; //erc20 contract
        //this.channelContractAddress = '0xf7aC6619aB81D8E0e06f573d3A9c0E14983C15D7'; //updated eth-only contract
        //this.channelContractAddress = '0x8a14863aDEE8926edD56f263d026AD2816f1C983'; //current mono contract


        let channelAbi = require('./abi/abi_multichannel_erc20.js');
        this.channelContract = this.web3.eth.contract(channelAbi).at(this.channelContractAddress);

        let l1SwapsAbi = require('./abi/abi_L1swap');
        this.l1SwapsContract = this.web3.eth.contract(l1SwapsAbi).at(this.l1SwapContractAddress);


        this.mediatorAddress = '0x8584223Ea6Bd70d30FbA40175595F0F09a61cA2a';
        
        this.state = {
            secrets: {},
            received: {},
            signatures: {},
            knownPaymentSignatures: {}, //TODO: not needed?
            invoices: {},
            counterInvoiced: {},
            channels: {},
            sent:{},
        }

        Object.keys(this.state).forEach(k => {
            Object.defineProperty(this, k, {
                get() { return this.state[k] },
            });
        })
        
        this.name = this.address.substr(0,4);
        
        this.testMode = props.testMode;
    }

    connect(){
        console.log(this.name, "CONNECTING CLIENT")
        this.subscriber = new cote.Subscriber({ name: 'client subscriber ' + this.name });
        this.publisher = new cote.Publisher({ name: 'client publisher ' + this.name });

        this.subscriber.on('transfersigs', update => this.handleSignaturesRevealed(update) );
        this.subscriber.on('transfer', async update => await this.handleTransfer(update) );
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

    async loadChannel(sourceAddress, targetAddress, tokenAddress){
        let channelId = this.getChannelId(sourceAddress, targetAddress, tokenAddress);
        return await this._loadChannel(channelId);
    }

    async loadChannelById(channelId){
        return await this._loadChannel(channelId);
    }

    async _loadChannel(channelId){

        let chan = await this.channelContract.channels(channelId);

        console.log(this.name, "CHANNEL FROM CHAIN", channelId, chan);
    
        let sender = chan[0]; let receiver = chan[1]; let deposited = chan[2]; let claimed = chan[3]; let token = chan[4];
        //if(!(sender.toLowerCase() == sourceAddress.toLowerCase() && receiver.toLowerCase() == targetAddress.toLowerCase())){
        if(sender == NULL_ADDRESS){
            //throw(this.name + " channel not opened " + sourceAddress + "=>" + targetAddress)
            return null;
        }

        let channel = {
            id: channelId,
            tokenAddress: token,
            spender: sender, 
            recipient: receiver,
            deposited: parseInt(deposited.toFixed()), 
            spent: parseInt(claimed.toFixed()), 
        }
        this.channels[channelId] = channel;

        console.log(this.name, "LOADED CHANNEL FROM CHAIN", channel);
        
        return channel;
    }

    async getOrLoadChannel(sourceAddress, targetAddress, tokenAddress){
        let channel = this.getChannel(sourceAddress, targetAddress, tokenAddress);

        if(!channel){
            console.log(this.name, "CHANNEL NOT LOADED YET, LOADING FROM CHAIN")
            channel = await this.loadChannel(sourceAddress, targetAddress, tokenAddress);
        }       

        return channel;
    }

    async getOrLoadChannelById(channelId){
        let channel = this.getChannelById(channelId);

        if(!channel){
            console.log(this.name, "CHANNEL NOT LOADED YET, LOADING FROM CHAIN")
            channel = await this.loadChannelById(channelId);
        }       

        return channel;
    }

    async depositToChannel(channelId, amount, tokenAddress){
        if(!tokenAddress) throw("provide tokenAddress to depositToChannel");

        let value = tokenAddress == NULL_ADDRESS ? amount : '0x0';
        
        return await this._callSolidity('deposit', [channelId, amount, tokenAddress], this.keypair, value);

        //TODO increase local balance
    }

    async openChannel(targetAddress, capacity, tokenAddress){
        if(!tokenAddress) throw("provide tokenAddress to openChannel");

        let value = tokenAddress == NULL_ADDRESS ? capacity : '0x0';
        
        return await this._callSolidity('openChannel', [targetAddress, capacity, tokenAddress], this.keypair, value);
        
        //TODO increase local balance
    }

    async settleChannel(channelId, amount, signature){
        return await this._callSolidity('settle', [channelId, amount, signature], this.keypair);

        //TODO increase local balance
    }

    async depositL1Payment(receiver, hashOfSecret, amount, tokenAddress){
        if(tokenAddress == NULL_ADDRESS){
            let hexAmount = '0x'+parseInt(amount).toString(16);            
            let result = await this._callSolidity('depositEth', [
                tokenAddress,
                amount,
                5,
                hashOfSecret,
                receiver,
            ], this.keypair, hexAmount, this.l1SwapsContract);
            console.log("DEPOSITED", amount, "WITH HASH", hashOfSecret);
            return result;
        }else{
            //TODO 
            throw("ERC20 submarine swaps not implemented")
        }
    }

    getChannelId(sourceAddress, targetAddress, tokenAddress){  
        if(!tokenAddress) throw("provide token address to getChannelId");
                 
        let buffer = this.concatHex(this.channelContractAddress, sourceAddress, targetAddress, tokenAddress); 
        return this.computeHashKeccak(buffer) 
    }

    getChannelCapacity(channel){
        if(typeof channel == 'string') channel = this.channels[channel];

        //TODO: lazy load channel here
        return channel.deposited - channel.spent;
    }

    getChannelBalance(channel){
        if(typeof channel == 'string') channel = this.channels[channel];  
        if(!channel) return null;        
        if(channel.recipient.toLowerCase() == this.address.toLowerCase()) return parseInt(channel.spent); //TODO replace parseint with BigInt
        if(channel.spender.toLowerCase() == this.address.toLowerCase()) return this.getChannelCapacity(channel);
        return null;
    }

    concatHex(){
        var args = Array.prototype.slice.call(arguments);
        return '0x' + args.map(x => x.startsWith('0x') ? x.substr(2) : x ).join('');
    }

    getChannel(sourceAddress, targetAddress, tokenAddress){
        return this.channels[ this.getChannelId(sourceAddress, targetAddress, tokenAddress) ];
    }

    getChannelById(id){
        return this.channels[ id ];
    }

    getCapacity(tokenAddress='0x0000000000000000000000000000000000000000'){
        return this._getChannelsSum("capacity", tokenAddress);
    }

    getBalance(tokenAddress='0x0000000000000000000000000000000000000000'){
        return this._getChannelsSum("balance", tokenAddress);
    }

    _getChannelsSum(type, tokenAddress){
        let sum = 0;
        for(var id in this.channels){
            let channel = this.channels[id];
            if(channel.tokenAddress == tokenAddress){
                if(type == "balance"){
                    sum += this.getChannelBalance(channel);
                }else if(type == "capacity"){
                    sum += this.getChannelCapacity(channel);
                }
            }
        }
        return sum;
    }

    getMultihopPath(sourceAddress, targetAddress){
        return [sourceAddress, this.mediatorAddress, targetAddress];
    }

    //////////////////////////////////////////////////////////////////////////////
    // LOCAL STATE FUNCTIONS

    registerSecret(secret){
        let hash = this.computeHashOfSecret(secret);
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

    updateChannelState(channel, params, clone){
        if(typeof channel == 'string') channel = this.channels[channel];

        if(!channel) throw("ERROR: not found channel to update state");

        if(clone) channel = {...channel};

        if(params.transfer){
            let transfer = params.transfer;
            channel.spent += parseInt(transfer.amount);
        }            

        return channel;
    }

    async sendTransfer(transfer){      
        transfer = {...transfer};
        
        let nextAddress = transfer.path ? 
            transfer.path[transfer.path.indexOf(this.address)+1] : 
            transfer.targetAddress;

        console.log(this.name, "NEXT ADDRESS", nextAddress);

        let channel = await this.getOrLoadChannel(this.address, nextAddress, transfer.tokenAddress);
        if(!channel){
            console.log(this.name, "CHANNEL NOT OPENED TO", nextAddress);
            return null;
        }

        console.log(this.name, "TRANSFER CHANNEL", channel);
        let capacity = this.getChannelCapacity(channel);

        if(capacity < parseInt(transfer.amount)){
            console.log(this.name, "NOT ENOUGH CAPACITY", capacity, "FOR AMOUNT", transfer.amount)
            return null;
        }
        
        if(!transfer.hashOfSecret){ //if a hash of secret is not provided, generate one and store it
            let secret = this.generateRandomSecret();
            let hash = this.computeHashOfSecret(secret);
            this.secrets[hash] = secret;
        
            console.log(this.name, "TRANSFER SECRET", secret, "HASH", hash);
        
            transfer.hashOfSecret = hash;
        }

        transfer.channelId = channel.id;

        //make a temporary clone channel and increment spent by transfer amount
        let chan = this.updateChannelState(channel, {transfer}, true); 
        transfer.spent = chan.spent.toString();    

        transfer.sourceAddress = this.address;

        transfer.targetAddress = nextAddress; //in case multihop, send payment to mediator

        console.log(this.name, "OUTGOING TRANSFER", transfer)
        console.log(this.name, "NEW CHANNEL BALANCE PENDING", this.getChannelBalance(chan) )   
      
        if(transfer.signature) console.log("USING PREMADE SIGNATURE");
        else console.log("SIGNING IN NODE");

        let encodedTx = this.encodeTransferForSig(transfer);
        let sig = transfer.signature || this.signMessage(encodedTx).signature;

        //store outgoing transfer for future reference
        this.sent[transfer.hashOfSecret] = {...transfer};

        delete transfer.signature; //make sure you don't directly leak sig to receiver

        this.publisher.publish('transfer', transfer);
        this.publisher.publish("signed", {
            hashOfSecret: transfer.hashOfSecret,
            signature: sig,
            targetAddress: nextAddress,
            signer: this.address,
        })

        return transfer;
    }


    //////////////////////////////////////////////////////////////////////////////
    // NETWORK EVENT HANDLERS

    handleSecretRevealed(update){
        let secret = update.secret;
        let hashOfSecret = this.computeHashOfSecret(secret);

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
        let sent = this.sent[hash];

        console.log(this.name, "RECEIVED SIGS FROM COORDINATOR", revealed);      
        
        if(sent){
            console.log(this.name, "LOADED SENT TRANSACTION, UPDATING CHANNEL STATE");
            this.updateChannelState(sent.channelId, {transfer:sent});       
            console.log(this.name, "NEW CHANNEL BALANCE CONFIRMED", this.getChannelBalance(sent.channelId) )        
        }

        if(!received){
            console.log(this.name, "NO RECEIVED PAYMENT FOR THIS HASH", revealed.hashOfSecret);
            this.signatures[revealed.hashOfSecret] = revealed.signatures;
            return false;
        }
       
        //console.log(this.name, "TRANSFER FOR SIGS", received);

        let message = this.encodeTransferForSig(received);            
        let recovered = this.ecRecover(revealed.signatures[received.sourceAddress], message, received.sourceAddress);
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
            console.log(this.name, "NEW CHANNEL BALANCE CONFIRMED (after secret reveal)", channel.id, balance);         
        } 

        this.emit("signatures",{
            signature: revealed.signatures[received.sourceAddress], ...received, 
        })
        
        return true;
    }

    async handleTransfer(transfer){
        
        if(transfer.invoiceId && transfer.sourceAddress==this.address) this.emit("invoicePaidByMe", transfer);
        
        if(transfer.targetAddress != this.address) return; //ignore payments not for you

        console.log(this.name, "INCOMING PAYMENT", transfer);        

        //if it's an incoming payment save it in local storage        
        this.received[transfer.hashOfSecret] = {...transfer};      
        
        if(!this.secrets[transfer.hashOfSecret]){ //if secret is not known just send back same amount of token            
            console.log(this.name, "DONT KNOW SECRET");
            if(this.testMode) this.testModeCounterPayment(transfer)                    
            this.emit("initialPaymentReceived", transfer);
        }else{ //if you know the secret and received counterpayment, reveal secret to network
            console.log(this.name, "DO KNOW SECRET");
            //for test purposes reveal secret automatically when any counter-payment comes in
            if(this.testMode) this.revealSecret(this.secrets[transfer.hashOfSecret]);                      
            this.emit("counterPaymentReceived", transfer);        
        }        

        if(transfer.invoiceId) this.emit("invoicePaid", transfer);
        this.emit("paymentReceived", transfer);

        //if there's a payment path and you're not the last one in it, forward payment
        if(transfer.path && this.address != transfer.path[transfer.path.length-1]){
            console.log(this.name, "FORWARDING PAYMENT AS MEDIATOR");
            this.sendTransfer(transfer);
        }else if(transfer.submarineSwap){
            console.log("SUBMARINE SWAP: DEPOSITING EQUIVALIENT L1 AMOUNT")
            
            await this.depositL1Payment(transfer.sourceAddress, transfer.hashOfSecret, transfer.amount, transfer.tokenAddress);            

            //console.log("BLOCK NUMBER", this.web3.blockNumber);
            let claimedEvent = this.l1SwapsContract.Claimed({secretHash: transfer.hashOfSecret}, {fromBlock: this.web3.blockNumber});            
            claimedEvent.watch((error, result) => {
                if(error){ 
                    console.log("ERROR WITH CLAIMED EVENT WATCH");
                    throw error;
                }
                claimedEvent.stopWatching();

                //console.log("EVENT ARGS", result.args)
                let secretHex = result.args.secret;
                let secretHashHex = result.args.secretHash;
                
                console.log(this.name, "L1 CLAIMED EVENT FOR HASH", secretHashHex, "SECRET", secretHex );
                //console.log("REVEALING SECRET", secretHex)
                this.revealSecret( secretHex );
            })
        }
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
        //console.log("ENCODED TX", message);
        let hash =  this.web3new.utils.keccak256(message);;
        //console.log("ENCODED TX HASH", hash);
        return hash;
    }

    computeHashKeccak(message){
        return this.web3new.utils.keccak256(message);
    }

    computeHashOfSecret(secret){        
        //return this.web3new.utils.soliditySha3(secret);
        //return this.web3new.utils.keccak256(secret);   
        return ethers.sha256(secret); //use btc compatible hash for secrets
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

    verifySignature(signature, message, sender){
        if(!sender) throw("provide valid sender address to verifySignature");
        return this.ecRecover(signature, message).toLowerCase() == sender.toLowerCase();
    }

    ecRecover(signature, message) {                     
        try {          
            return this.web3new.eth.accounts.recover(message, signature);
        } catch (err) {
            console.error(err);
        }

        return "";
    }

    generateRandomSecret(){ return '0x' + this.genRanHex(64); }

    genRanHex(size=64){ return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join(''); }


    //////////////////////////////////////////////////////////////////////////////
    // ETHEREUM HELPER

    async _callSolidity (funcName, funcParams, keys, ethValue, contr) {
        return new Promise((resolve, reject) => {
          let web3 = this.web3;
          let contract = contr || this.channelContract;

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
                  gasPrice: web3.toHex(gasPrice.mul(3).div(2)).split('.')[0],
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

                  function pollForReceipt () {
                    web3.eth.getTransactionReceipt(hash, function (err, receipt) {
                      if (err != null) {
                        console.log("ERROR", err);
                        reject(err)
                      } else if (receipt != null) {
                        resolve(receipt)
                      } else {
                        //console.log("RECEIPT:", receipt)
                        setTimeout(pollForReceipt, 10000)
                      }
                    })
                  }

                  console.log("POLLING FOR RECEIPT", hash);
                  pollForReceipt();
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

    getContractInfo(){    
        return {
            channelContractAddress: this.channelContractAddress,
            l1SwapsContractAddress: this.l1SwapContractAddress,
            l1SwapsAbi: require('./abi/abi_L1swap'),
        }
    }

    //////////////////////////////////////////////////////////////////////////////
    // RPC SERVER
    setupRpc(opts){
        const express = require('express');
        const app = express()
        const port = opts.port || 0;
    
        app.get('/', (req, res) => {
            res.sendFile(__dirname + '/payment.html')
        })

        app.get('/contract_info/json', (req,res) => {        
            res.send(this.getContractInfo())
        })
        app.get('/contract_info', (req,res) => {        
            res.send("CONTRACT_INFO = " + JSON.stringify(this.getContractInfo(), null, 2) )
        })
    
        app.get('/balance', (req, res) => {
            let token = req.query.token;
            let balance = this.getBalance(token);
            res.send({
                balance: balance
            })
        })

        app.get('/channel_balance', async (req, res) => {
            let id = req.query.id;            
            let channel = await this.getOrLoadChannelById(id);            

            let balance = this.getChannelBalance(channel);
            res.send({
                balance: balance
            })
        })

        app.get('/channel/open', async (req, res) => {
            let target = req.query.target;
            let capacity = req.query.capacity;                        
            let token = req.query.token;   

            let result = await this.openChannel(target, capacity, token);

            res.send({
                success: true, 
                receipt: result,
            });
        })


        app.get('/channel', async (req, res) => {
            let id = req.query.id;            
            let channel = await this.getOrLoadChannelById(id);            
            let balance = this.getChannelBalance(channel);
            res.send({
                channel: channel, 
                balance: balance,
            });
        })
    
        app.get('/reveal', (req, res) => {
            let secret = req.query.secret;
            let hashOfSecret = this.computeHashOfSecret(secret);
            console.log(this.name, "REVEALING SECRET", secret, "FOR", hashOfSecret);
            this.revealSecret(secret);
            res.send({success: true});
        })

        app.get('/state', (req, res) =>{
            res.send(this.state);
        });

        app.get('/transfer', async (req, res) => {
            let target = req.query.target;
            let amount = req.query.amount;
            let spent = req.query.spent;
            let signature = req.query.signature;   
            let token = req.query.token;   
            let reveal = req.query.reveal;  
            let submarine = req.query.submarine;
    
            //res.send("SENDING TRANSFER " + amount + " to " + target + " with sig " + signature);
    
            let transfer = await this.sendTransfer({
                tokenAddress:token, 
                amount:amount,
                spent: spent,
                targetAddress: target,
                signature: signature,
                submarineSwap: submarine ? true : false,
            });
    
            if(transfer){
                let secret = this.secrets[transfer.hashOfSecret];
        
                function done(){
                    res.send({
                        status: "success",
                        transfer: transfer,
                        secret: secret,
                    });
                }

                if(reveal){
                    setTimeout(() => {
                        console.log(this.name, "REVEALING SECRET", secret, "FOR", transfer.hashOfSecret);
                        this.revealSecret(secret);
                        done();
                    }, 1500) 
                }else{
                    done();
                }
            }else{
                res.send({status:"failed"});
            }
        })


    
        app.listen(port, () => {
            console.log(`REST RPC app listening on port ${port}`)
        })
    }
    
}

module.exports = ChannelClient;



