/**
 * @file The Ethereum blockchain network
 */

const Network = require('../core/network')
const Web3 = require('web3melnx')
const Tx = require('ethereumjs-tx').Transaction
const Common = require('ethereumjs-common').default
const BigNumber = require('@ethersproject/bignumber')

/**
 * Exports a Web3 interface to the Ethereum blockchain network
 * @type {Ethereum}
 */
module.exports = class Ethereum extends Network {
  constructor (props) {
    super({ name: props.name, assets: props.assets })

    this.web3 = new Web3(new Web3.providers.HttpProvider(props.url))
    this.web3.chainId = props.chainId

    this.contract = this.web3.eth.contract(props.abi).at(props.address)

    const blockNum = this.web3.eth.blockNumber
    const watchArgs = { fromBlock: blockNum, toBlock: 'latest' }
    this.eventDeposit = this.contract.Deposited({}, watchArgs)
    this.eventClaim = this.contract.Claimed({}, watchArgs)

    Object.seal(this)
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
    if (party.isSecretSeeker) {
      throw Error('not implemented yet!')
    } else if (party.isSecretHolder) {
      const { counterparty } = party
      const invoice = await this._createInvoice(
        counterparty.quantity,
        counterparty.asset.contractAddress,
        opts.ethereum
      )
      invoice.id = this._parseInvoiceId(invoice)
      party.counterparty.state[this.name] = { invoice }

      // Subscribe to the Deposit event, and settle the invoice when the deposit
      // is made by the counterparty.
      const subscription = this.eventDeposit.watch((err, deposit) => {
        subscription.stopWatching()

        if (err != null) {
          console.log(`\n${this.name}.onDeposit`, err)
          return this.emit('error', err)
        } else {
          console.log(`\n${this.name}.claim`, party, opts.secret)
          this._settleInvoice(`0x${opts.secret}`, opts.ethereum)
            .catch(err => console.log(`\n${this.name}.onClaim`, party, err))
        }
      })
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
    return new Promise((resolve, reject) => {
      if (party.isSecretSeeker) {
        const subscription = this.eventClaim.watch((err, claim) => {
          subscription.stopWatching()

          if (err != null) {
            console.log(`\n${this.name}.onClaim`, err)
            reject(err)
          } else {
            const claimSecret = claim.args.secret.toFixed()
            const bnSecret = BigNumber.BigNumber.from(claimSecret)
            const secret = bnSecret.toHexString()
            console.log(`\n${this.name}.BigNumber()`, party, claimSecret, bnSecret, secret)
            resolve(secret.substr(2))
          }
        })

        const invoiceId = party.state[this.name].invoice.id
        const secretHashHex = `0x${party.swap.secretHash}`
        const onPaid = receipt => {
          console.log(`\n${this.name}.onPaid`, party, receipt)
          party.counterparty.state[this.name] = { receipt }
        }

        this._payInvoice(invoiceId, secretHashHex, opts.ethereum, party.quantity)
          .then(onPaid)
          .catch(reject)
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
