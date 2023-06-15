/**
 * @file Exposes all in-progress atomic swaps (version 2)
 */

const { EventEmitter } = require('events')
const Swap = require('./swap')
const zmq = require('zeromq')
const bitcoin = require('bitcoinjs-lib')
const ctx = require('../../core/context')

/**
 * Forwards events to the specified EventEmitter instance
 * @param {EventEmitter} self The EventEmitter instance that will fire the event
 * @param {String} event The event being fired/handled
 * @returns {[Void}
 */
function forwardEvent (self, event) {
  return function (...args) {
    // console.log('forwardEvent args: ', args)
    // console.log('forwardEvent event: ', event)
    self.emit('log', 'info', `swap.${event}`, ...args)
    self.emit(event, ...args)
  }
}

function addPending (self, event) {
  return function (...args) {
    self.emit('log', 'info', `swap.${event}`, ...args)
    const swap = args[0]
    const swapid = swap.id
    const userid = args[1]
    const descriptor = args[2]
    console.log('adding pending swap id: ', swapid)
    console.log('   with descriptor: ', descriptor)
    self.addPending(swapid, userid, descriptor)
    self.emit(event, swap)
  }
}

/**
 * Exposes all in-progress atomic swaps (version 2)
 * @type {Swaps}
 */
module.exports = class Swaps extends EventEmitter {
  constructor (props, ctx) {
    super()

    this.ctx = ctx
    this.swaps = new Map()
    this.pendingSwaps = new Map()
    this.pendingPaymentTxns = new Map()

    this.listenForPendingTransactions(this)

    Object.seal(this)
  }

  /**
     * Creates a new swap for a given maker/taker/client combination
     * @param {Order|Object} maker The maker side of the order
     * @param {Order|Object} taker The taker side of the order
     * @returns {Promise<Swap>}
     */
  fromOrders (maker, taker) {
    console.log('swaps2.fromOrders')
    return new Promise((resolve, reject) => {
      let swap

      try {
        swap = Swap.fromOrders(maker, taker, this.ctx)
          .once('created', forwardEvent(this, 'created'))
          .once('opening', forwardEvent(this, 'opening'))
          .once('opened', forwardEvent(this, 'opened'))
          .once('committing', forwardEvent(this, 'committing'))
          .once('committed', forwardEvent(this, 'committed'))
          .once('aborted', forwardEvent(this, 'aborted'))
          .once('holderPaymentPending', addPending(this, 'holderPaymentPending'))

        this.swaps.has(swap.id) || this.swaps.set(swap.id, swap)
      } catch (err) {
        return reject(err)
      }

      resolve(swap)
    })
  }

  /**
     * Creates a new swap using swap type and template
     * @param {String} swapType
     * @param {Object} secretHolderProps Props for the swap secret holder
     * @param {Object} secretSeekerProps Props for the swap secret seeker
     * @returns {Promise<Swap>}
     */
  fromProps (swapType, secretHolderProps, secretSeekerProps) {
    // console.log(`inside swaps.fromProps`)

    return new Promise((resolve, reject) => {
      let swap

      try {
        // console.log(`about to call Swap.fromProps`)
        swap = Swap.fromProps(swapType, secretHolderProps, secretSeekerProps, this.ctx)
          .once('created', forwardEvent(this, 'created'))
          .once('opening', forwardEvent(this, 'opening'))
          .once('opened', forwardEvent(this, 'opened'))
          .once('committing', forwardEvent(this, 'committing'))
          .once('committed', forwardEvent(this, 'committed'))
          .once('aborted', forwardEvent(this, 'aborted'))
          .once('pending', addPending(this, 'pending'))

        // console.log(`after call to Swap.fromProps`)
        this.swaps.has(swap.id) || this.swaps.set(swap.id, swap)
      } catch (err) {
        return reject(err)
      }

      resolve(swap)
    })
  }

  /**
     * Handles the opening of a swap by a user that is a party to the swap
     * @param {Swap} swap The swap to open
     * @param {String} swap.id The unique identifier of the swap to be opened
     * @param {Party|Object} party The party that is opening the swap
     * @param {String} party.id The unique identifier of the party
     * @param {Object} opts Configuration options for the operation
     * @returns {Promise<Swap>}
     */
  open (swap, party, opts) {
    console.log('\nSwaps.open', swap, party, opts)

    if (swap == null || swap.id == null) {
      return Promise.reject(Error('unknown swap!'))
    } else if (!this.swaps.has(swap.id)) {
      return Promise.reject(Error(`unknown swap "${swap.id}"!`))
    } else {
      return this.swaps.get(swap.id).open(party, opts)
    }
  }

  /**
     * Handles commiting to a swap by a user that is a party to id
     * @param {Swap} swap The swap being committed
     * @param {String} swap.id The unique identifier of the swap to be committed
     * @param {Party} party The party that is committing the swap
     * @param {String} party.id The unique identifier of the party
     * @param {Object} opts Configuration options for the operation
     * @returns {Promise<Swap>}
     */
  commit (swap, party, opts) {
    console.log('\nSwaps.commit', swap, party, opts)

    if (swap == null || swap.id == null) {
      throw new Error('unknown swap!')
    } else if (!this.swaps.has(swap.id)) {
      throw new Error(`unknown swap "${swap.id}"!`)
    } else {
      return this.swaps.get(swap.id).commit(party, opts)
    }
  }

  /**
     * Aborts a swap gracefully
     * @param {Swap} swap The swap to be aborted
     * @param {String} swap.id The unique identifier of the swap to be aborted
     * @param {Party} party The party that is aborting the swap
     * @param {String} party.id The unique identifier of the party
     * @param {Object} opts Configuration options for the operation
     * @returns {Promise<Void>}
     */
  abort (swap, party, opts) {
    console.log('\nSwaps.abort', swap, party, opts)
    if (swap == null || swap.id == null) {
      throw new Error('unknown swap!')
    } else if (!this.swaps.has(swap.id)) {
      throw new Error(`unknown swap "${swap.id}"!`)
    } else {
      return this.swaps.get(swap.id).abort(party, opts)
    }
  }

  addPending (swapid, username, descriptor) {
    if (!descriptor.startsWith('addr(')) {
      throw new Error('swap descriptors currently must be addr only: ', descriptor)
    }
    const address = descriptor.substring(5, 69)
    // this.swaps.has(swap.id) || this.swaps.set(swap.id, swap)
    this.pendingSwaps.has(address) || this.pendingSwaps.set(address, swapid)
  }

  addPendingPayment (rawtx, swapid) {
    this.pendingPaymentTxns.has(rawtx) || this.pendingPaymentTxns.set(rawtx, swapid)
  }

  removePending (address) {
    this.pendingSwaps.delete(address)
  }

  isPending (address) {
    return this.pendingSwaps.has(address)
  }

  getPending (address) {
    return this.swaps.get(this.pendingSwaps.get(address))
  }

  getPendingPayment (rawtx) {
    return this.swaps.get(this.pendingPaymentTxns.get(rawtx))
  }

  getPendingSize () {
    return this.pendingSwaps.size
  }

  listenForPendingTransactions = (self) => {
    console.log('about to run pendingTxnListener')
    async function run () {
      console.log('starting to run pendingTxnListener')
      const sock = new zmq.Subscriber()

      sock.connect('tcp://127.0.0.1:29000')
      sock.subscribe('rawtx')
      sock.subscribe('rawblock')

      console.log('Subscriber connected to port 29000')

      for await (const [topic, msg] of sock) {
        // console.log("received a message related to:", topic.toString(), "containing message:", msg.toString('hex'))
        if (topic.toString() === 'rawtx') {
          try {
            const rawtx = msg.toString('hex')

            const tx = bitcoin.Transaction.fromHex(rawtx)
            const network = bitcoin.networks.regtest
            const output0 = tx.outs[0]
            const out0 = output0.script
            const outputValue0 = output0.value
            const input0 = tx.ins[0]
            const inputTxn0 = input0.hash.reverse()

            const addr0 = bitcoin.address.fromOutputScript(out0, network)

            // console.log('checking txn seen for address: ', addr0)
            // console.log('pending size: ', self.getPendingSize())
            // console.log('isPending: ', self.isPending(addr0))
            if (self.isPending(addr0)) {
              console.log('pending txn seen for address: ', addr0)
              console.log('pending size: ', self.getPendingSize())
              const swap = self.getPending(addr0)
              const inputTxn = inputTxn0.toString('hex')
              const ordinalTxn = swap.secretSeeker.ordinalLocation.split(':')[0]
              console.log('***** inputTxn', inputTxn)
              console.log('***** ordinalTxn', ordinalTxn)

              if (inputTxn !== ordinalTxn) {
                console.log('extraneous payment made to address')
                // TODO: add extraneous payments to swap object
                // self.emit('extraneousPayment', swap)
                return
              }

              const ordinalQuantity = swap.secretHolder.baseQuantity

              console.log('***** ordinalQuantity', ordinalQuantity)
              console.log('***** outputValue0', outputValue0)

              if (outputValue0 < ordinalQuantity) {
                console.log('insufficientOrdinalQuantityPaid')
                // self.emit('insufficientOrdinalQuantityPaid', swap)
                return
              }

              self.removePending(addr0)
              // swap.setStatusToHolderPaid()
              // self.emit('holderPaid', swap)
              const swapid = swap.id
              console.log('swapid: ', swapid)
              self.addPendingPayment(rawtx, swapid)
              // self.pendingPaymentTxns.set(rawtx, swap.id)
              console.log('address derived rawtx: ', rawtx)
            }
            // console.log('First address of first output for new transaction: ', addr0)
            // console.log('\n')
          } catch (e) {
            console.log('issue running pendingTxnListener', e)
          }
        } else if (topic.toString() === 'rawblock') {
          try {
            const rawblock = msg.toString('hex')
            console.log('rawblock: ', rawblock)

            const block = bitcoin.Block.fromHex(rawblock)
            const network = bitcoin.networks.regtest
            const txs = block.transactions
            txs.forEach(tx => {
              // const rawtx = tx.toString('hex')
              // console.log('tx in block: ', tx)
              // console.log('tx.getHash: ', tx.getHash())
              // console.log('tx.toHex: ', tx.toHex())
              // console.log('tx.getid: ', tx.getId())
              const rawtx = tx.toHex()
              // console.log('tx.raw...', tx.raw.toString('hex'))
              if (self.pendingPaymentTxns.has(rawtx)) {
                console.log('block txn: ', rawtx)

                // const swapid = self.pendingPaymentTxns.get(rawtx)
                const swap = self.getPendingPayment(rawtx)
                self.pendingPaymentTxns.delete(rawtx)
                // console.log('swapid retrieved: ', swapid)
                // const swap = self.swaps.get(swapid)
                console.log('swap retrieved: ', swap)
                swap.setStatusToHolderPaid()
                self.emit('holderPaid', swap)
              }
            })
          } catch (e) {
            console.log('issue running pendingTxnListener', e)
          }
        }
      }
    }
    run()
  }
}
