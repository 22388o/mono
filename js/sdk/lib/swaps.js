/**
 * @file An interface to all swaps
 */

const { BaseClass, Swap, Util } = require('@portaldefi/core')

/**
 * Expose the interface to all swaps
 * @type {Swaps}
 */
module.exports = class Swaps extends BaseClass {
  constructor (sdk, props) {
    super()

    this.sdk = sdk

    // Wire up swap events
    this.sdk.network
      .on('swap.created', (...args) => this._onEvent('created', ...args))
      .on('swap.opening', (...args) => this._onEvent('opening', ...args))
      .on('swap.opened', (...args) => this._onEvent('opened', ...args))
      .on('swap.committing', (...args) => this._onEvent('committing', ...args))
      .on('swap.committed', (...args) => this._onEvent('committed', ...args))
      .on('swap.aborting', (...args) => this._onEvent('aborting', ...args))
      .on('swap.aborted', (...args) => this._onEvent('aborted', ...args))

    Object.seal(this)
  }

  /**
   * Synchronizes the swaps with the store
   * @returns {Promise<Swaps>}
   */
  sync () {
    // TODO: Fix this to load from the store on startup
    // TODO: Fix this to write to the store on shutdown
    return Promise.resolve(this)
  }

  /**
   * Handles incoming swap events
   * @param {String} event The name of the event
   * @param {Object} obj The JSON object representing the swap
   * @returns {Void}
   */
  _onEvent (event, obj) {
    let swap = null

    // Ensure the swap is valid and relevant to this peer
    try {
      swap = Swap.fromJSON(obj)
      if (!swap.isParty(this.sdk)) return
    } catch (err) {
      this.error('swap.error', err, obj)
      this.emit('error', err, obj)
      return
    }

    // Handle the swap event
    try {
      const handler = `_on${event[0].toUpperCase()}${event.slice(1)}`
      if (typeof this[handler] !== 'function') {
        throw Error(`unknown event "${event}"!`)
      }
      this.debug(`swap.${event}`, swap)
      this[handler](swap)
    } catch (err) {
      this.error('swap.error', err, swap)
      this.emit('error', err, swap)
    }
  }

  /**
   * Handles the creation of a new swap
   * 
   * Upon creation, the exchange-designated secret-holder generates the secret
   * and its hash, creates an invoice for the counter-party, and sends the
   * details to the counterparty.
   * 
   * The exchange-designated secret-seeker, simply stores the swap in the store
   * and waits for the secret-holder to send the secret-hash and invoice.
   * 
   * @param {Swap} swap The newly created swap
   * @returns 
   */
  async _onCreated(swap) {
    const { blockchains, store } = this.sdk
    const { secretHolder, secretSeeker } = swap

    // Secret-seeker saves the swap and waits for the secret-holder
    if (secretSeeker.id === this.sdk.id) {
      this.info('swap.created', swap)
      return store.put('swaps', swap.id, swap)
    }

    // For the secret-holder, start by generating a secret for the swap
    const secret = Util.random()
    swap.secretHash = Util.hash(secret) // NOTE: SWAP STATE MUTATION!
    await store.put('secrets', swap.secretHash, secret)

    // generate an invoice to send to the secret seeker
    const blockchain = blockchains[secretSeeker.blockchain.split('.')[0]]
    secretSeeker.invoice = await blockchain.createInvoice(secretSeeker)

    // watch for when the invoice is paid
    console.log(this.sdk.id, 'setup listener for', blockchain.id, 'invoice being paid')
    blockchain.once('invoice.paid', async invoice => {
      console.log(this.sdk.id, 'saw', blockchain.id, 'invoice was paid')
      console.log(this.sdk.id, 'settling', blockchain.id, 'invoice...')
      await blockchain.settleInvoice(secretHolder, secret)
      console.log(this.sdk.id, 'settled', blockchain.id, 'invoice')
    })

    // save the swap in the local store
    this.info('swap.created', swap)
    await store.put('swaps', swap.id, swap)

    // IIFE implementing infinite retries until success
    // TODO: fix this to be more reasonable through state persistance
    const notifyCounterParty = async args => {
      try {
        this.info('swap.notifyCounterParty', args, swap)
        await this.sdk.network.request(args, { swap })
      } catch (err) {
        this.error('swap.notifyCounterParty', err, args, swap)
        setTimeout(notifyCounterParty, 1000, args) // FIXME: Hardcoded value
      }
    }

    notifyCounterParty({ method: 'PUT', path: '/api/v1/swap' })
  }

  /**
   * Handles the opening of a swap
   * 
   * Once a secret-holder notifies the secret-seeker of the secret-hash, the
   * secret-seeker creates an invoice and sends it over to the secret holder.
   * 
   * @param {Swap} swap The swap that is opening
   * @returns {Void}
   */
  async _onOpening (swap) {
    const { blockchains, store } = this.sdk
    const { secretHolder, secretSeeker } = swap

    // Secret-holder saves the swap and waits for the secret-seeker
    if (secretHolder.id === this.sdk.id) {
      this.info('swap.opening', swap)
      return store.put('swaps', swap.id, swap)
    }

    // generate an invoice to send to the secret seeker
    const blockchain = blockchains[secretHolder.blockchain.split('.')[0]]
    secretHolder.invoice = await blockchain.createInvoice(secretHolder)

    // watch for when the invoice is paid
    console.log(this.sdk.id, 'setup listener for', blockchain.id, 'invoice being paid')
    blockchain
      .once('invoice.paid', async invoice => {
        const blockchain = blockchains[secretSeeker.blockchain.split('.')[0]]
        console.log(this.sdk.id, 'is paying', blockchain.id, 'invoice...')
        await blockchain.payInvoice(secretSeeker)
        console.log(this.sdk.id, 'just paid', blockchain.id, 'invoice')
      })
      .once('invoice.settled', async invoice => {
        const blockchain = blockchains[secretHolder.blockchain.split('.')[0]]
        console.log(this.sdk.id, 'settling', blockchain.id, 'invoice...')
        await blockchain.settleInvoice(secretHolder, secret)
        console.log(this.sdk.id, 'just settled', blockchain.id, 'invoice')
      })

    // save the swap in the local store
    this.info('swap.opening', swap)
    await store.put('swaps', swap.id, swap)


    // IIFE implementing infinite retries until success
    // TODO: fix this to be more reasonable through state persistance
    const notifyCounterParty = async args => {
      try {
        this.info('swap.notifyCounterParty', args, swap)
        await this.sdk.network.request(args, { swap })
      } catch (err) {
        this.error('swap.notifyCounterParty', err, args, swap)
        setTimeout(notifyCounterParty, 1000, args) // FIXME: Hardcoded value
      }
    }

    notifyCounterParty({ method: 'PUT', path: '/api/v1/swap' })
  }

  /**
   * Handles a swap once it is opened from both sides
   * 
   * At this step, the secret-holder must pay the secret-seeker's invoice and
   * lock funds in the network.
   * 
   * @param {Swap} swap 
   * @returns 
   */
  async _onOpened(swap) {
    const { store } = this.sdk
    const { secretHolder, secretSeeker } = swap

    // Secret-seeker saves the swap and waits for the secret-holder
    if (secretSeeker.id === this.sdk.id) {
      this.info('swap.opened', swap)
      return store.put('swaps', swap.id, swap)
    }

    // handle the payment of the invoice sent previously
    const { blockchain: blockchainName } = secretHolder
    const blockchain = this.sdk.blockchains[blockchainName.split('.')[0]]
    await blockchain.payInvoice(secretHolder)
  }

  // /**
  //  * Handles a swap that was opened
  //  * @param {Swap} swap The swap that was opened
  //  * @returns {Void}
  //  */
  // async _onOpened(swap) {
  //   try {
  //     // Secret seeker goes next
  //     if (swap.secretSeeker.id !== this.sdk.id) return

  //     // handle the payment of the invoice sent previously
  //     const { secretHolder } = swap
  //     const { id, asset, blockchain: blockchainName, quantity } = secretHolder
  //     const blockchain = this.sdk.blockchains[blockchainName.split('.')[0]]

  //     blockchain
  //       .once('invoice.paid', async (invoice, party, blockchain) => {
  //         try {
  //           // when the seeker's invoice is paid, settle the holder's invoice
  //           const { secretSeeker } = swap
  //           const { blockchain: blockchainName } = secretSeeker
  //           const blockchain = this.sdk.blockchains[blockchainName.split('.')[0]]

  //           await blockchain
  //             .once('invoice.settled', (invoice, party, blockchain) => {
  //               console.log('invoice.settled here', invoice, party, blockchain)
  //             })
  //             .payInvoice(secretSeeker)
  //         } catch (err) {
  //           this.error('swap.error', err, swap)
  //           this.emit('error', err, swap)
  //         }
  //       })

  //     // IIFE implementing infinite retries until success
  //     // TODO: fix this to be more reasonable through state persistance
  //     const notifyCounterParty = async args => {
  //       try {
  //         this.info('swap.notifyCounterParty', args, swap)
  //         await this.sdk.network.request(args, { swap })
  //       } catch (err) {
  //         this.error('swap.notifyCounterParty', err, args, swap)
  //         setTimeout(notifyCounterParty, 1000, args) // FIXME: Hardcoded value
  //       }
  //     }

  //     notifyCounterParty({ method: 'POST', path: '/api/v1/swap' })
  //   } catch (err) {
  //     this.error('swap.error', err, swap)
  //     this.emit('error', err, swap)
  //   }
  // }

  /**
   * Handles a swap that is committing
   * @param {Swap} swap The swap that is committing
   * @returns {Void}
   */
  async _onCommitting(swap) {
    try {
      // Secret holder goes next
      if (swap.secretHolder.id !== this.sdk.id) return

      // handle the payment of the invoice sent previously
      const { secretHolder } = swap
      const { blockchain: blockchainName } = secretHolder
      const blockchain = this.sdk.blockchains[blockchainName.split('.')[0]]

      await blockchain.payInvoice(secretHolder)
    } catch (err) {
      this.error('swap.error', err, swap)
      this.emit('error', err, swap)
    }
  }

  /**
   * Handles a swap that was committed
   * @param {Swap} swap The swap that was committed
   * @returns {Void}
   */
  _onCommitted (swap) {
    console.log('committed', swap)
  }

  /**
   * Handles a swap that is aborting
   * @param {Swap} swap The swap that is aborting
   * @returns {Void}
   */
  _onAborting (obj) {
    throw Error('not implemented')
  }

  /**
   * Handles a swap that was aborted
   * @param {Swap} swap The swap that was aborted
   * @returns {Void}
   */
  _onAborted (obj) {
    throw Error('not implemented')
  }
}
