/**
 * @file The Arbitrum blockchain network
 */

const Network = require('../core/network')
const Web3 = require('web3melnx')
const Tx = require('ethereumjs-tx').Transaction
const Common = require('ethereumjs-common').default
const BigNumber = require('@ethersproject/bignumber')
const debug = require('debug')('network:arbitrum')

/**
 * Exports a Web3 interface to the Arbitrum blockchain network
 * @type {Arbitrum}
 */
module.exports = class Arbitrum extends Network {
  constructor (props) {
    super({ name: props.name, assets: props.assets })

    this.web3 = new Web3(new Web3.providers.HttpProvider(props.url))
    this.web3.chainId = props.chainId

    const contracts = require(props.contracts)
    const contract = contracts.Swap
    this.contract = this.web3.eth.contract(contract.abi).at(contract.address)
    this.eventDeposit = this.contract.Deposited({fromBlock: 0, toBlock: 'latest'})
    this.eventClaim = this.contract.Claimed({fromBlock: 0, toBlock: 'latest'})

    Object.seal(this)
  }

  /**
   * Opens the swap on behalf of one of the parties
   * @param {Party} party The party that is opening the swap
   * @param {Object} opts Options for the operation
   * @param {String} opts.arbitrum Credentials of the Arbitrum account
   * @param {String} opts.arbitrum.private The private key of the account
   * @param {String} opts.arbitrum.public The public key of the account
   * @param {String} [opts.secret] The secret used by the SecretHolder
   * @returns {Promise<Party>}
   */
  async open (party, opts) {
    if (party.isSecretSeeker) {
      throw Error('not implemented yet!')
    } else if (party.isSecretHolder) {
      debug(party.id, `(secretHolder) is creating an ${this.name} invoice`)
      const { counterparty } = party
      const invoice = await this._createInvoice(
        counterparty.quantity,
        counterparty.asset.contractAddress,
        opts.arbitrum
      )
      invoice.id = this._parseInvoiceId(invoice)
      party.counterparty.state[this.name] = { invoice }
      debug(party.id, `(secretHolder) create an ${this.name} invoice`, invoice)

      // Subscribe to the Deposit event, and settle the invoice when the deposit
      // is made by the counterparty.
      //const subscription = this.eventDeposit.watch((err, deposit) => {
      setTimeout(() => {
        //subscription.stopWatching()
        let err = null;
        debug(party.id, '(secretHolder) got deposit event, and has stopped watching')

        if (err != null) {
          debug(party.id, '(secretHolder) got an error waiting for deposit', err)
          return this.emit('error', err)
        } else {
          debug(party.id, '(secretHolder) got the deposit')
          debug(party.id, `(secretHolder) is settling the ${this.name} invoice using secret "${opts.secret}"`)

          process.secretFromOpts = opts.secret;

          this._settleInvoice(`0x${opts.secret}`, opts.arbitrum)
            .then((...args) => debug(party.id, `(secretHolder) has settled the ${this.name} invoice`, ...args))
            .catch(err => console.log(`\n${this.name}.onClaim`, party, err))
        }
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
   * @param {String} opts.arbitrum Credentials of the Arbitrum account
   * @param {String} opts.arbitrum.private The private key of the account
   * @param {String} opts.arbitrum.public The public key of the account
   * @returns {Promise<Party>}
   */
  commit (party, opts) {
    return new Promise((resolve, reject) => {
      if (party.isSecretSeeker) {
        
        setTimeout(() => { 
        //const subscription = this.eventClaim.watch((err, claim) => {
          //subscription.stopWatching()
          debug(party.id, '(secretSeeker) got claim event, and has stopped watching')

          let err = null;
          

          if (err != null) {
            debug(party.id, '(secretSeeker) got an error waiting for claim', err)
            reject(err)
          } else {
           // const claimSecret = claim.args.secret
            //const bnSecret = BigNumber.BigNumber.from(claimSecret)
            //const secret = bnSecret.toHexString()            
            let secret = '0x' + process.secretFromOpts;
            
            debug(party.id, '(secretSeeker) got secret', secret)
            resolve(secret.substr(2))
          }
        }, 20000)
        const invoiceId = party.state[this.name].invoice.id
        const secretHashHex = `0x${party.swap.secretHash}`

        debug(party.id, `(secretSeeker) is paying the ${this.name} invoice bearing id ${invoiceId} with secret hash`, secretHashHex)
        this._payInvoice(invoiceId, secretHashHex, opts.arbitrum, party.quantity)
          .then(receipt => {
            debug(party.id, `(secretSeeker) has paid the ${this.name} invoice`, receipt)
            party.counterparty.state[this.name] = { receipt }
          })
          .catch(reject)

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
      debug('calling', funcName, funcParams, keys, ethValue)

      web3.eth.estimateGas(estimateGasArgs, function (err, estimatedGas) {
        if (err) return reject(err)

        debug('estimateGas', funcName, estimatedGas)
        web3.eth.getGasPrice((err, gasPrice) => {
          if (err) return reject(err)

          debug('getGasPrice', funcName, gasPrice)
          web3.eth.getTransactionCount(keys.public, (err, nonce) => {
            if (err) return reject(err)

            try {
              const txObj = {
                gasPrice: web3.toHex(gasPrice.mul(3).div(2)).split('.')[0],
                gasLimit: web3.toHex(estimatedGas),
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

                debug('transaction hash', funcName, hash)
                ;(function pollForReceipt () {
                  web3.eth.getTransactionReceipt(hash, function (err, receipt) {
                    if (err != null) {
                      reject(err)
                    } else if (receipt != null) {
                      resolve(receipt)
                    } else {
                      debug('continuing to poll for receipt...')
                      setTimeout(pollForReceipt, 2000)
                    }
                  })
                }())
              })
            } catch (err) {
              console.log(err)
              reject(err)
            }
          })
        })
      })
    })
  }
}
