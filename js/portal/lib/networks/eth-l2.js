/**
 * @file The Ethereum L2 network
 */

const Network = require('../core/network')
const Web3 = require('web3melnx')
const Tx = require('ethereumjs-tx').Transaction
const Common = require('ethereumjs-common').default
const BigNumber = require('@ethersproject/bignumber')
const ChannelClient = require('./EthL2/ChannelClient')//require('./EthL2/SwapClient')
const ChannelCoordinator = require('./EthL2/ChannelCoordinator')//require('./EthL2/SwapCoordinator')

/**
 * Exports an interface to the Ethereum L2 network
 * @type {Ethereum}
 */
module.exports = class EthL2 extends Network {
  constructor (props) {
    super({ name: props.name, assets: props.assets })    

    //TODO: uncomment this later for settlement

    //this.web3 = new Web3(new Web3.providers.HttpProvider(props.url))
    //this.web3.chainId = props.chainId

    //this.contract = this.web3.eth.contract(props.abi).at(props.address)

    //const blockNum = this.web3.eth.blockNumber
    //const watchArgs = { fromBlock: blockNum, toBlock: 'latest' }
    //this.eventDeposit = this.contract.Deposited({}, watchArgs)
    //this.eventClaim = this.contract.Claimed({}, watchArgs)

    this.rpc = props.url;
    console.log("ETH_RPC_1", props.url)
    this.chanId = props.chanId;

    let coord = new ChannelCoordinator();
    process.SwapCoordinator = coord;    
    coord.connect();

    Object.seal(this)
  }

  async makeClient(party, opts){  
    let rpc = this.rpc;    
    let chanId = this.chainId;  
    return new Promise((resolve, reject) => {      
      let client = new ChannelClient({
        keypair: {
          address: opts.ethereum.public,
          private: opts.ethereum.private,       
        },
        rpc: rpc,
        chainId: chanId,
      });
      client.connect();
      
      setTimeout(() => {
        resolve(client);
      }, 5000)
    
      return party;
    })
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
  async open (party, opts) {        
    let client = await this.makeClient(party, opts)

    if (party.isSecretSeeker) {
      throw Error('not implemented yet!')
    } else if (party.isSecretHolder) {
      const { counterparty } = party

      let secret = '0x'+opts.secret
      client.registerSecret(secret)
      let hashOfSecret = client.computeHash(secret)
        
      let invoice = client.createInvoice({
        amount: counterparty.quantity.toString(),
        tokenAddress: '0x00',
        hashOfSecret: hashOfSecret,
        payee: client.address,
      })
              
      party.counterparty.state[this.name] = { invoice }

      client.once('invoicePaid', (payment) => {            
        client.revealSecret(secret) //TODO: check if amount is correct 1st
      })
    }else {
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
  async commit (party, opts) {
    let client = await this.makeClient(party, opts)

    return new Promise((resolve, reject) => {
      if (party.isSecretSeeker) {
        client.once('secret', (secret) => {                
          resolve(secret.substr(2))
        })
        
        let invoice = party.state[this.name].invoice
        
        client.once( 'invoicePaidByMe', receipt => {                
          console.log(`\n${this.name}.onPaid`, party, receipt)
          party.counterparty.state[this.name] = { receipt }
        })
        
        client.payInvoice(invoice)
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

  _createInvoice (amount, address, keys) {
    const method = 'createInvoice'
    const params = [address, `0x${amount.toString(16)}`, '0']
    return this._callSolidity(method, params, keys)
  }

  _payInvoice (invoiceId, secretHash, keys, amount) {
    const method = 'payInvoice'
    const params = [invoiceId, secretHash]
    return this._callSolidity(method, params, keys, `0x${amount.toString(16)}`)
  }

  _settleInvoice (secret, keys) {
    const method = 'claim'
    const params = [secret]
    return this._callSolidity(method, params, keys)
  }

  _callSolidity (funcName, funcParams, keys, ethValue) {
    return new Promise((resolve, reject) => {
      const { web3, contract } = this
      const txMetadata = { from: keys.public, value: ethValue }
      const func = contract[funcName]
      const paramsArray = [...funcParams, txMetadata]
      const getData = func.getData
      const calldata = getData.apply(func, paramsArray)
      const estimateGasArgs = {
        from: keys.public,
        to: contract.address,
        gas: '1000000',
        value: ethValue,
        data: calldata
      }

      web3.eth.estimateGas(estimateGasArgs, function (err, estimatedGas) {
        if (err) return reject(err)

        web3.eth.getGasPrice((err, gasPrice) => {
          if (err) return reject(err)

          web3.eth.getTransactionCount(keys.public, (err, nonce) => {
            if (err) return reject(err)

            const txObj = {
              gasPrice: web3.toHex(gasPrice),
              gasLimit: web3.toHex(9500000),
              data: calldata,
              from: keys.public,
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
}
