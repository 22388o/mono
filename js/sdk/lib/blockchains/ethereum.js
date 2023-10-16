/**
 * @file Interface to the Ethereum network
 */

const { BaseClass } = require('@portaldefi/core')
const { Web3, WebSocketProvider } = require('web3')

/**
 * Holds private fields for instances of the class
 * @type {WeakMap}
 */
const INSTANCES = new WeakMap()

/**
 * Interface to the Ethereum network
 * @type {Ethereum}
 */
module.exports = class Ethereum extends BaseClass {
  constructor (sdk, props) {
    super({ id: 'ethereum' })

    // web3-provider
    const provider = new WebSocketProvider(props.url)
    // provider.on('message', (...args) => this.debug('provider.message', ...args))

    // web3
    const web3 = new Web3(provider)

    // account/wallet
    const wallet = web3.eth.accounts.wallet.add(`0x${props.private}`)

    // default configuration
    web3.eth.defaultAccount = wallet[0].address
    web3.eth.Contract.handleRevert = true

    // swap contract
    const { abi, address } = props.contracts.Swap
    const { address: from } = wallet[0]
    const contract = new web3.eth.Contract(abi, address, { from })
    contract.handleRevert = true
    contract.defaultAccount = wallet[0].address
    contract.defaultChain = 'mainnet'
    contract.defaultHardfork = 'petersburg'
    contract.defaultNetworkId = props.chainId
    contract.defaultCommon = {
      name: 'playnet',
      chainId: props.chainId,
      networkId: props.chainId
    }

    // swap contract events
    const events = contract.events.allEvents()
    events.on('connected', id => this.debug('contract.events', { id }))
    events.on('data', data => {
      const { event, address, returnValues } = data

      if (contract._address !== address) {
        const err = Error(`got event from ${address} instead of ${contract._address}`)
        this.emit('error', err)
      }

      switch (event) {
        case 'InvoiceCreated': {
          const { id, swap, payee, asset, quantity } = returnValues
          this.info('invoice.created', { id, swap: { id: swap }, payee, asset, quantity })
          this.emit('invoice.created', { id, swap: { id: swap }, payee, asset, quantity })
          break
        }

        case 'InvoicePaid': {
          const { id, swap, payer, asset, quantity } = returnValues
          this.info('invoice.paid', { id, swap: { id: swap }, payer, asset, quantity })
          this.emit('invoice.paid', { id, swap: { id: swap }, payer, asset, quantity })
          break
        }

        case 'InvoiceSettled': {
          const { id, swap, payer, payee, asset, quantity, secret } = returnValues
          this.info('invoice.settled', { id, swap: { id: swap, secret: secret.substr(2) }, payer, payee, asset, quantity })
          this.emit('invoice.settled', { id, swap: { id: swap, secret: secret.substr(2) }, payer, payee, asset, quantity })
          break
        }

        default:
          this.debug('event', data)
      }
    })
    events.on('changed', data => this.warn('subscription.changed', data))
    events.on('error', (err, receipt) => this.error('subscription.error', err, receipt))

    // json
    const json = {
      wallet: wallet[0].address,
      contract: { address: contract._address }
    }

    INSTANCES.set(this, Object.seal({ web3, wallet, contract, json }))

    Object.freeze(this)
  }

  /**
   * Returns the JSON representation of the swap
   * @returns {Object}
   */
  toJSON () {
    return Object.assign(super.toJSON(), INSTANCES.get(this).json)
  }

  /**
   * Initializes the connection to the geth daemon
   * @returns {Promise<Ethereum>}
   */
  async connect () {
    try {
      this.emit('connect', this)
      return this
    } catch (err) {
      this.error('connect', err, this)
      throw err
    }
  }

  /**
   * Creates an invoice
   * @param {Party} party The party that will pay the invoice
   * @param {Number} party.quantity The number of tokens to be invoiced
   * @param {Swap} party.swap The parent swap of the party
   * @param {String} party.swap.id The unique identifier of the swap
   * @param {String} party.swap.secretHash The hash of the secret of the swap
   * @returns {Promise<Invoice>} The invoice generated by the Swap contract
   */
  async createInvoice(party) {
    try {
      const { web3, contract } = INSTANCES.get(this)
      const { methods: { createInvoice } } = contract
      const { toHex } = web3.utils

      const subscriptionArgs = {
        filter: { swap: toHex(party.swap.id) },
        fromBlock: 'latest'
      }
      // const subscription = contract.events.allEvents(subscriptionArgs)
      // subscription.on('data', data => {
      //   const { event, returnValues } = data

      //   switch (event) {
      //     case 'InvoiceCreated': break // Ignore

      //     case 'InvoicePaid': {
      //       this.info('invoice.paid', data, party, this)
      //       this.emit('invoice.paid', returnValues, party, this)
      //       break
      //     }

      //     case 'InvoiceSettled': {
      //       this.info('invoice.settled', data, party, this)
      //       this.emit('invoice.settled', returnValues, party, this)
      //       subscription.unsubscribe()
      //       break
      //     }

      //     case 'InvoiceCancelled': {
      //       this.info('invoice.cancelled', data, party, this)
      //       this.emit('invoice.cancelled', returnValues, party, this)
      //       subscription.unsubscribe()
      //       break
      //     }

      //     default:
      //       this.warn('event', data)
      //   }
      // })

      const id = toHex(party.swap.secretHash)
      const swap = toHex(party.swap.id)
      const asset = '0x0000000000000000000000000000000000000000'
      const value = toHex(party.quantity)

      const tx = createInvoice(id, swap, asset, value)
      const gas = await tx.estimateGas()
      const receipt = await tx.send({ gas })
      this.info('createInvoice', receipt, party, this)

      const { blockHash, from, to, transactionHash } = receipt
      return { blockHash, from, to, transactionHash }
    } catch (err) {
      this.error('createInvoice', err, party, this)
      throw err
    }
  }

  /**
   * Pays an invoice
   * @param {Party} party The party that is paying the invoice
   * @param {Number} party.invoice The invoice to be paid
   * @param {Number} party.quantity The number of tokens to be invoiced
   * @param {Swap} party.swap The parent swap of the party
   * @param {String} party.swap.id The unique identifier of the swap
   * @param {String} party.swap.secretHash The hash of the secret of the swap
   * @returns {Promise<Void>}
   */
  async payInvoice (party) {
    try {
      const { web3, contract } = INSTANCES.get(this)
      const { methods: { payInvoice } } = contract
      const { toHex } = web3.utils

      const id = toHex(party.swap.secretHash)
      const swap = toHex(party.swap.id)
      const asset = '0x0000000000000000000000000000000000000000'
      const value = toHex(party.quantity)

      const tx = payInvoice(id, swap, asset, value)
      // TODO: fix value to only be used for ETH transactions
      const gas = await tx.estimateGas({ value })
      const receipt = await tx.send({ gas, value })

      this.info('payInvoice', receipt, party, this)
      // TODO: This should be an Invoice object
      return null
    } catch (err) {
      this.error('payInvoice', err, party, this)
      throw err
    }
  }

  /**
   * Settles an invoice
   * @param {Party} party The party that is settling the invoice
   * @param {Number} party.invoice The invoice to be settled
   * @param {String} secret The secret to be revealed
   * @returns {Promise<Void>}
   */
  async settleInvoice (party, secret) {
    try {
      const { web3, contract } = INSTANCES.get(this)
      const { methods: { settleInvoice } } = contract
      const { toHex } = web3.utils

      const swap = toHex(party.swap.id)
      const tx = settleInvoice(secret, swap)
      const gas = await tx.estimateGas()
      const receipt = await tx.send({ gas })

      this.info('settleInvoice', receipt, party, this)
      // TODO: This should be an Invoice object
      return null
    } catch (err) {
      this.error('settleInvoice', err, party, this)
      throw err
    }
  }

  /**
   * Gracefully disconnects from the geth daemon
   * @returns {Promise<Ethereum>}
   */
  async disconnect () {
    try {
      const { web3, subscriptions } = INSTANCES.get(this)

      for (const name in subscriptions) {
        const subscription = subscriptions[name]
        if (subscription != null) {
          await subscription.unsubscribe()
          subscriptions[name] = null
        }
      }

      this.emit('disconnect', this)
      return this
    } catch (err) {
      this.error('disconnect', err, this)
      throw err
    }
  }
}
