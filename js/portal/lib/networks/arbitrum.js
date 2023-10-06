/**
 * @file The Ethereum blockchain network
 */

let req = require('@aeternity/aepp-sdk');
const { AeSdk, MemoryAccount, Node, CompilerHttp } = req;

const Network = require('../core/network')
const Web3 = require('web3melnx')
const Tx = require('ethereumjs-tx').Transaction
const Common = require('ethereumjs-common').default
const BigNumber = require('@ethersproject/bignumber')
const debug = require('debug')('network:aeternity')


const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

SWAP_CONTRACT_ADDRESS = 'ct_2d9gekEkGC1PSviUSnKEC5dVGmdA3esmPpHwKF7BmiQTnNqrcF';

CONTRACT_CODE = `
@compiler >= 6

include "List.aes"
include "Option.aes"
include "String.aes"

contract interface Versioner =
    entrypoint version : () => (string * list(string))

contract SWAP =
    entrypoint version() : (string * list(string)) =
        ("SWAP", ["0.1.0"])
    
    // Events
    datatype event
        = DepositedEvent(indexed address, indexed hash, int)
        | ClaimedEvent(indexed address, indexed hash, bytes(32))  
        | InvoicedEvent(indexed hash, indexed address, int)    
        | InvoicePaidEvent(indexed hash, indexed address, int)     

    /// Data structure and init.
    record state = {        
        amounts: map(hash, int),
        secrets: map(hash, bytes(32)),
        invoiceAmounts: map(hash, int),    
        invoiceHashes: map(hash, hash),  
        invoicers: map(hash, address)                        
        }

    /// init Initialize the contract    
    stateful entrypoint init() = {            
        amounts = {},
        secrets = {},
        invoiceAmounts = {} ,
        invoiceHashes = {}, 
        invoicers ={}
        }

    stateful payable entrypoint deposit(hashOfSecret:hash) : bool =
        let depositor = Call.caller
        let amount = Call.value
        put( state { amounts[hashOfSecret] = amount } )
        Chain.event(DepositedEvent(depositor, hashOfSecret, amount))
        true

    stateful entrypoint claim(secret: bytes(32)) : bool =
        let hashOfSecret = Crypto.sha256(secret)
        
        let claimer = Call.caller

        switch(Map.lookup(hashOfSecret, state.amounts))
            Some(amount) =>                
                put( state { secrets[hashOfSecret] = secret })
                Chain.spend(claimer, amount)
                Chain.event(ClaimedEvent(claimer, hashOfSecret, secret))
                true
        false
            
 
    entrypoint getSecret(hashOfSecret: hash) : option(bytes(32)) =
        switch(Map.lookup(hashOfSecret, state.secrets))
            None => None
            Some(secret) => Some(secret)

    stateful entrypoint createInvoice(id: hash, amount: int) : bool =
        let claimer = Call.caller
        put( state { invoiceAmounts[id] = amount, invoicers[id] = claimer } ) 
        Chain.event(InvoicedEvent(id, claimer, amount))
        true

    stateful payable entrypoint payInvoice(id: hash, hashOfSecret: hash) : bool =
        let payer = Call.caller
        let amount = Call.value
        switch(Map.lookup(id, state.invoiceAmounts))
            None => false            
            Some (invoiceAmount) =>
                if(amount == invoiceAmount)             
                    put( state { invoiceHashes[id] = hashOfSecret, amounts[hashOfSecret] = amount } ) 
                    Chain.event(InvoicePaidEvent(id, payer, amount))
                    true
                else
                    false
        true

`

/**
 * Exports a Web3 interface to the Ethereum blockchain network
 * @type {Ethereum}
 */
module.exports = class Aeternity extends Network {
  constructor (props) {
    super({ name: props.name, assets: props.assets })



    //this.sdk = this.getSdk(keypair);
   
    Object.seal(this)
  }

  getSdk(keypair){
      const node = new Node('https://testnet.aeternity.io') // ideally host your own node
      const account = new MemoryAccount(keypair.secretKey)
      
      const aeSdk = new AeSdk({
          nodes: [{ name: 'testnet', instance: node }],
          accounts: [account],
          onCompiler: new CompilerHttp('https://v7.compiler.stg.aepps.com'), // ideally host your own compiler
      })
  
      return aeSdk;
  }

  async getContractTemplate(aeSdk){
      const sourceCode = CONTRACT_CODE;//fs.readFileSync('./contracts/swap.aes', 'utf8') // source code of the contract
      const contract = await aeSdk.initializeContract({ sourceCode })

      return contract;
  }

  /**
   * Opens the swap on behalf of one of the parties
   * @param {Party} party The party that is opening the swap
   * @param {Object} opts Options for the operation
   * @param {String} opts.ethereum Credentials of the Ethereum account
   * @param {String} opts.ethereum.private The private key of the account
   * @param {String} opts.ethereum.public The public key of the account
   * @param {String} [opts.secret] The secret used by the SecretHolder
   * @returns {Promise<Party>}
   */


  //js/portal/test/unit/api/v1/swap/arbitrum-lightning.spec.js
  async open (party, opts) {
    if (party.isSecretSeeker) {
      throw Error('not implemented yet!')
    } else if (party.isSecretHolder) {
      debug(party.id, `(secretHolder) is creating an ${this.name} invoice`)
      const { counterparty } = party

      let keypair =   {
          publicKey: 'ak_2a9G8XAyaDbXT4qrrbkYUWwLtbnHWTxRrjiAZTUQJmZaEU9Ym5',
          secretKey: '882d79a1fc66cb56eb362ab4c843c6ac399d528e966bb180fe8c0a0d86f7867ccef33569ab6fe20d20a86b3c50a59672e707876526e841fc89a97469e03a8692'
      }
      debug(party.id, "aeSdk being made")
      let aeSdk = this.getSdk(keypair);

      debug(party.id, "aeSdk made")

      let contractTemplate = await this.getContractTemplate(aeSdk);
      debug(party.id, "swap contract template made")

      let aci = contractTemplate._aci;
      let swapContract = await aeSdk.initializeContract({ aci, address:SWAP_CONTRACT_ADDRESS })
     
      debug(party.id, "swap contract made")

      let invoiceId = genRanHex(64);

      debug(party.id, "invoice id " + invoiceId)

      /*const invoice = await this._createInvoice(
        counterparty.quantity,        
        opts.aeternity,
        swapContract, 
        invoiceId,
      )*/
      const invoice = await swapContract.createInvoice(invoiceId, counterparty.quantity);

      invoice.id = invoiceId;

      debug("invoice made", invoice)

      //invoice.id = this._parseInvoiceId(invoice)
      party.counterparty.state[this.name] = { invoice:{id:invoiceId} }
      debug(party.id, `(secretHolder) create an ${this.name} invoice`, invoice)

      // Subscribe to the Deposit event, and settle the invoice when the deposit
      // is made by the counterparty.
      //TODO: find a way to watch all events for contract
      //const subscription = swapContract.DepositEvent.watch((err, deposit) => {
        //subscription.stopWatching()

      setTimeout(() => {
        debug(party.id, '(secretHolder) got deposit event, and has stopped watching')

      
        debug(party.id, '(secretHolder) got the deposit')
        debug(party.id, `(secretHolder) is settling the ${this.name} invoice using secret "${opts.secret}"`)

        debug(party.id, "trying to claim ")
        debug(party.id, opts.secret);

        //this._settleInvoice(`${opts.secret}`, opts.aeternity, swapContract)
        swapContract.claim(opts.secret);

          //.then((...args) => debug(party.id, `(secretHolder) has settled the ${this.name} invoice`, ...args))
          //.catch(err => console.log(`\n${this.name}.onClaim`, party, err))
        
      }, 10000)
      debug(party.id, '(secretHolder) is now waiting for funds')
    } else {
      throw Error('multi-party swaps are not supported!')
    }

    return party
  }

  /**
   * Commits a swap on behalf of one of the parties
   * @param {Party} party The party that is committing the swap
   * @param {Object} opts Options for the operation
   * @param {String} opts.ethereum Credentials of the Ethereum account
   * @param {String} opts.ethereum.private The private key of the account
   * @param {String} opts.ethereum.public The public key of the account
   * @returns {Promise<Party>}
   */
  commit (party, opts) {
    return new Promise(async (resolve, reject) => {
      if (party.isSecretSeeker) {

        let keypair =   {
          publicKey: 'ak_VJbH1kMJQr9nE5jJJUGUZvdDxUUczDarBuso5kk6pqnCze3oP',
          secretKey: 'c93787c3fc2fcba89f4a857fc2b765156bb0b6ae9604e1b625c01d5b9488a1df40441e59f7b2e7a7a100125e283cf997fc179ea5d8200e463ed1eed0e14a3ad6'
        }
        let aeSdk = this.getSdk(keypair);
        let contractTemplate = await this.getContractTemplate(aeSdk);
        let aci = contractTemplate._aci;
        let swapContract = await aeSdk.initializeContract({ aci, address:SWAP_CONTRACT_ADDRESS })
      

        //TODO: find a way to watch all events for contract
        //const subscription = swapContract.ClaimEvent.watch((err, claim) => {
          //subscription.stopWatching()


        const secretHashHex = `0x${party.swap.secretHash}`

        setTimeout(async () => {
          debug(party.id, '(secretSeeker) got claim event, and has stopped watching')


            let claimSecret = await swapContract.getSecret(party.swap.secretHash);        
            //const claimSecret = claim.args.secret
            //const bnSecret = BigNumber.BigNumber.from(claimSecret)
            //const secret = bnSecret.toHexString()

            let secretFromChain = Buffer.from(claimSecret.decodedResult).toString('hex');
            debug(party.id, '(secretSeeker) got secret', secretFromChain)
            
            resolve(secretFromChain)         
        }, 15000)
        const invoiceId = party.state[this.name].invoice.id
        

        debug(party.id, `(secretSeeker) is paying the ${this.name} invoice bearing id ${invoiceId} with secret hash`, secretHashHex)
        /*this._payInvoice(invoiceId, secretHashHex, opts.aeternity, party.quantity, swapContract)
          .then(receipt => {
            debug(party.id, `(secretSeeker) has paid the ${this.name} invoice`, receipt)
            party.counterparty.state[this.name] = { receipt }
          })
          .catch(reject)*/
        let receipt = await swapContract.payInvoice(invoiceId, party.swap.secretHash, {amount: party.quantity} );

        debug(party.id, "PAYMENT RECEIPT", receipt);

        party.counterparty.state[this.name] = { receipt: {receipt:receipt.hash} }

        debug(party.id, '(secretSeeker) is now waiting for funds to be claimed')
      } else if (party.isSecretHolder) {
        // Alice needs to call .claim() to reveal the secret
        throw Error('not implemented yet!')
      } else {
        throw Error('multi-party swaps are not supported!')
      }

      return party
    })
  }

  _parseInvoiceId (invoice) {
    const hex = invoice.logs[0].data.substr(2, 64)
    const dec = parseInt(hex, 16)
    return dec.toString()
  }

  _createInvoice (amount, keys, swapContract, invoiceId) {    
    return swapContract.createInvoice(invoiceId, amount);
  }

  _payInvoice (invoiceId, secretHash, keys, amount, swapContract) {    
     swapContract.payInvoice(invoiceId, secretHash, amount);
  }

  _settleInvoice (secret, keys, swapContract) {        
    return swapContract.claim(secret);
  }

}
