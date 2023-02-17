/**
 * @file The Ethereum L2 network
 */

const Network = require('../core/network')
const Web3 = require('web3melnx')
const Tx = require('ethereumjs-tx').Transaction
const Common = require('ethereumjs-common').default
const BigNumber = require('@ethersproject/bignumber')
const ChannelClient = require('./EthL2/ChannelClient')// require('./EthL2/SwapClient')
const ChannelCoordinator = require('./EthL2/ChannelCoordinator')// require('./EthL2/SwapCoordinator')
const debug = require('debug')('network:eth-l2')

/**
 * Exports an interface to the Ethereum L2 network
 * @type {Ethereum}
 */
module.exports = class EthL2 extends Network {
  constructor (props) {
    super({ name: props.name, assets: props.assets })

    // TODO: uncomment this later for settlement

    // this.web3 = new Web3(new Web3.providers.HttpProvider(props.url))
    // this.web3.chainId = props.chainId

    // this.contract = this.web3.eth.contract(props.abi).at(props.address)

    // const blockNum = this.web3.eth.blockNumber
    // const watchArgs = { fromBlock: blockNum, toBlock: 'latest' }
    // this.eventDeposit = this.contract.Deposited({}, watchArgs)
    // this.eventClaim = this.contract.Claimed({}, watchArgs)

    this.rpc = props.url
    console.log('ETH_RPC_1', props.url)
    this.chanId = props.chanId

    let coord = new ChannelCoordinator()
    process.SwapCoordinator = coord
    coord.connect()

    Object.seal(this)
  }

  async makeClient (party, opts) {
    let keys = opts.ethl2

    let rpc = this.rpc
    let chanId = this.chainId

    return new Promise((resolve, reject) => {
      let client = new ChannelClient({
        keypair: {
          address: keys.public,
          private: keys.private
        },
        rpc: rpc,
        chainId: chanId
      })
      client.connect()

      setTimeout(() => {
        resolve(client)
      }, 5000)

      return party
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
    try {
      const client = await this.makeClient(party, opts)

      if (party.isSecretSeeker) {
        throw Error('not implemented yet!')
      } else if (party.isSecretHolder) {
        const { counterparty } = party

        const secret = `0x${opts.secret}`
        client.registerSecret(secret)
        const hashOfSecret = client.computeHash(secret)

        const invoice = client.createInvoice({
          amount: counterparty.quantity.toString(),
          tokenAddress: '0x00',
          hashOfSecret: hashOfSecret,
          payee: client.address
        })
        debug(party.id, `is created an ${this.name} invoice`, invoice)

        party.counterparty.state[this.name] = { invoice }

        client.once('invoicePaid', (payment) => {
          debug(party.id, 'saw the invoice paid via payment', payment)
          debug(party.id, 'revealing secret...', secret)
          client.revealSecret(secret)
        })
      } else {
        throw Error('multi-party swaps are not supported!')
      }

      return party
    } catch (err) {
      debug(party.id, 'got error while trying to .open()', err)
    }
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
    const client = await this.makeClient(party, opts)

    return new Promise((resolve, reject) => {
      try {
        if (party.isSecretSeeker) {
          client.once('secret', (secret) => {
            debug(party.id, '(secretSeeker) got secret', secret)
            resolve(secret.substr(2))
          })

          const invoice = party.state[this.name].invoice

          client.once('invoicePaidByMe', receipt => {
            debug(party.id, '(secretSeeker) got receipt for payment', receipt)
            party.counterparty.state[this.name] = { receipt }
          })

          debug(party.id, '(secretSeeker) paying the invoice', invoice)
          client.payInvoice(invoice)
        } else if (party.isSecretHolder) {
          // Alice needs to call .claim() to reveal the secret
          throw Error('not implemented yet!')
        } else {
          throw Error('multi-party swaps are not supported!')
        }

        return party
      } catch (err) {
        debug(party.id, 'got error while trying to .open()', err)
      }
    })
  }
}
