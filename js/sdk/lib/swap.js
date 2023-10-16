/**
 * @file Defines a swap and other related classes
 */

const { BaseClass, Order, Util } = require('@portaldefi/core')

/**
 * An object mapping swap status strings to the expected order of transitions
 * @type {Object}
 */
const SWAP_STATUS = [
  'received',
  'created',
  'holder.invoice.created',
  'holder.invoice.sent',
  'seeker.invoice.created',
  'seeker.invoice.sent',
  'holder.invoice.paid',
  'seeker.invoice.paid',
  'holder.invoice.settled',
  'seeker.invoice.settled',
  'completed'
].reduce((obj, status, index) => {
  obj[status] = index
  return obj
}, {})

/**
 * Holds the private data of instances of classes
 * @type {WeakMap}
 */
const INSTANCES = new WeakMap()

/**
 * Export some functions that create Swaps
 */
module.exports = {
  /**
   * Creates a swap from a pair of orders that were matched
   * 
   * The protocol followed here is as follows:
   * - The ID of the swap is the hash of the IDs of the orders
   * - The maker becomes the secret holder
   * - The taker becomes the secret seeker
   * 
   * @param {Order} maker The maker of the order
   * @param {Order} taker The taker of the order
   * @param {Sdk} sdk The parent Sdk instance that is managing the swap
   * @returns {Swap}
   */
  fromOrders: function (maker, taker, sdk) {
    if (!(maker instanceof Order)) {
      throw Error('expected maker to be an Order!')
    } else if (!(taker instanceof Order)) {
      throw Error('expected taker to be an Order!')
    } else if (sdk == null) {
      throw Error('expected third argument!')
    }

    return new Swap({
      id: Util.hash(maker.id, taker.id),
      secretHolder: {
        id: maker.uid,
        asset: maker.isAsk ? maker.baseAsset : maker.quoteAsset,
        blockchain: maker.isAsk ? maker.baseNetwork : maker.quoteNetwork,
        quantity: maker.isAsk ? maker.baseQuantity : maker.quoteQuantity
      },
      secretSeeker: {
        id: taker.uid,
        asset: taker.isAsk ? taker.baseAsset : taker.quoteAsset,
        blockchain: taker.isAsk ? taker.baseNetwork : taker.quoteNetwork,
        quantity: taker.isAsk ? taker.baseQuantity : taker.quoteQuantity
      }
    }, sdk)
  },

  /**
   * Creates a Swap instance from a JSON object
   * @param {Object} obj The JSON representation of the swap
   * @param {Sdk} sdk The parent Sdk instance that is managing the swap
   * @returns {Swap}
   */
  fromJSON (obj, sdk) {
    if (obj['@type'] !== 'Swap') {
      throw Error(`expected type "Swap", but got "${obj['@type']}"!`)
    } else if (sdk == null) {
      throw Error('expected second argument!')
    }

    return new Swap(obj, sdk)
  }
}

/**
 * Defines a cross-chain swap between two parties
 * @type {Swap}
 */
class Swap extends BaseClass {
  /**
   * Creates a new instance of a swap
   * @param {Object} props Properties of the instance
   * @param {Sdk} sdk 
   */
  constructor(props, sdk) {
    if (props == null) {
      throw Error('no properties provided for swap!')
    } else if (props.id != null && typeof props.id !== 'string') {
      throw Error(`expected id to be a string; got ${typeof props.id}!`)
    } else if (props.secretHash != null) {
      if (props.secretHash != null && typeof props.id !== 'string') {
        throw Error(`expected secretHash to be a string; got ${typeof props.id}!`)
      } else if (props.secretHash.length != 64) {
        throw Error(`expected secretHash to be a sha256 hex-string; got ${props.secretHash}`)
      } else if (props.secretHash.startsWith('0x')) {
        throw Error(`expected secretHash to be a sha256 hex-string with the leading "0x"`)
      }
    } else if (props.secretHolder == null) {
      throw Error('no secretHolder provided!')
    } else if (props.secretSeeker == null) {
      throw Error('no secretSeeker provided!')
    }

    super({ id: props.id || Util.uuid() })

    this.sdk = sdk
    this.secretHolder = new Party(props.secretHolder, this)
    this.secretSeeker = new Party(props.secretSeeker, this)

    //  the fields that may be updated, but never by any code outside this class
    INSTANCES.set(this, Object.seal({
      status: props.status || 'received',
      secretHash: props.secretHash,
    }))

    Object.freeze(this)

    // Queue up the event to be emitted later so handlers can be attached
    setImmediate(() => this.emit(this.status, this))
  }

  /**
   * Returns the current status of the swap
   * @returns {String}
   */
  get status () {
    return INSTANCES.get(this).status
  }

  get isReceived () {
    return this.status === 'received'
  }

  get isCreated () {
    return this.status === 'created'
  }

  get isHolderInvoiceCreated () {
    return this.status === 'holder.invoice.created'
  }

  get isHolderInvoiceSent () {
    return this.status === 'holder.invoice.sent'
  }

  get isSeekerInvoiceCreated () {
    return this.status === 'seeker.invoice.created'
  }

  get isSeekerInvoiceSent () {
    return this.status === 'seeker.invoice.sent'
  }

  get isHolderPaid () {
    return this.status === 'holder.invoice.paid'
  }

  get isSeekerPaid () {
    return this.status === 'seeker.invoice.paid'
  }

  get isHolderSettled () {
    return this.status === 'holder.invoice.settled'
  }

  get isSeekerSettled () {
    return this.status === 'seeker.invoice.settled'
  }

  get isCompleted () {
    return this.status === 'completed'
  }

  /**
   * Returns the hash of the secret used by the swap
   * @returns {String}
   */
  get secretHash () {
    return INSTANCES.get(this).secretHash
  }

  /**
   * Sets the secret hash for the swap and transitions to the 'created' state
   */
  set secretHash (val) {
    const state = INSTANCES.get(this)

    // TODO: Ensure only secret holder can set the secret hash
    if (state.secretHash == null) {
      state.secretHash = val
      state.status = 'created'
    } else {
      throw Error('cannot set secret hash anymore!')
    }
  }

  /**
   * The owner of the SDK instance
   * @returns {Party}
   */
  get party () {
    return this.sdk.id === this.secretHolder.id
      ? this.secretHolder
      : this.secretSeeker
  }

  /**
   * Returns whether the party is the "holder" or "seeker"
   * @returns {String}
   */
  get partyType () {
    return this.party === this.secretHolder ? 'holder' : 'seeker'
  }

  /**
   * The party at the other end of the swap
   * @returns {Party}
   */
  get counterparty () {
    return this.sdk.id == this.secretSeeker.id
      ? this.secretHolder
      : this.secretSeeker
  }

  /**
   * Returns whether the counterparty is the "holder" or "seeker"
   * @returns {String}
   */
  get counterpartyType () {
    return this.party === this.secretSeeker ? 'holder' : 'seeker'
  }

  /**
   * Returns the current state of the instance
   * @type {String}
   */
  [Symbol.for('nodejs.util.inspect.custom')] () {
    return this.toJSON()
  }

  /**
   * Returns the JSON representation of the instance
   * @returns {Object}
   */
  toJSON () {
    const { id, status, secretHash, secretHolder, secretSeeker } = this
    return {
      '@type': this.constructor.name,
      id,
      status,
      secretHash,
      secretHolder,
      secretSeeker
    }
  }

  /**
   * Returns whether or not the specified user is a party to the swap
   * @param {Party|Object} party.id The unique identifier of the party
   * @returns {Boolean}
   */
  isParty (party) {
    const { secretHolder, secretSeeker } = this
    return secretHolder.id === party.id || secretSeeker.id === party.id
  }

  /**
   * Updates the swap instance
   * 
   * This method is used when a JSON version of a swap is received from the
   * counterparty to update local state.
   * 
   * @param {Object} swap The updated swap instance
   * @returns {Void}
   * @throws {Error}
   */
  update (swap) {
    // the unique identifier of the swap must not ever change!
    if (this.id !== swap.id) {
      throw Error('swap id mismatch!')
    }

    if (swap.secretHash == null) {
      throw Error('expected updated swap to have a secret-hash!')
    } else if (this.secretHash != null && this.secretHash !== swap.secretHash) {
      throw Error('secret-hash must not be changed once set!')
    }

    if (SWAP_STATUS[this.status] >= SWAP_STATUS[swap.status]) {
      throw Error(`cannot transition from ${this.status} to ${swap.status}!`)
    }

    this.secretHolder.update(swap.secretHolder)
    this.secretSeeker.update(swap.secretSeeker)

    const state = INSTANCES.get(this)
    state.status = swap.status
    state.secretHash = swap.secretHash
  }

  /**
   * Creates an invoice to send to the counterparty
   * @returns {Promise<Swap>}
   */
  async createInvoice () {
    const { blockchains, store } = this.sdk
    const blockchain = blockchains[this.counterparty.blockchain.split('.')[0]]

    blockchain.once('invoice.paid', invoice => {
      console.log(this.sdk.id, 'saw', blockchain.id, 'invoice paid', invoice)

      if (this.party.isSeeker) {
        INSTANCES.get(this).status = `holder.invoice.paid`
        console.log(this.sdk.id, 'is paying his/her invoice...')
        this.payInvoice()
      } else if (this.party.isHolder) {
        INSTANCES.get(this).status = `seeker.invoice.paid`
        console.log(this.sdk.id, 'is settling his/her invoice...')
        this.settleInvoice()
      } else {
        throw Error('unexpected code branch!')
      }
    })

    if (this.party.isSeeker) {
      const blockchain = blockchains[this.party.blockchain.split('.')[0]]
      console.log(this.sdk.id, 'is watching', blockchain.id, 'for invoice settlement...')
      blockchain
        .once('invoice.settled', async invoice => {
          console.log(this.sdk.id, 'saw', blockchain.id, 'invoice settled', invoice)
          console.log(this.sdk.id, 'saving secret', invoice.swap.secret, 'under secret hash', invoice.id.substr(2))
          await store.put('secrets', invoice.id.substr(2), {
            secret: invoice.swap.secret,
            swap: invoice.swap.id
          })
          console.log(this.sdk.id, 'is settling his/her invoice...')
          const receipt = await this.settleInvoice()
          console.log(this.sdk.id, 'settled his/her invoice', receipt)
        })
    }

    console.log(this.sdk.id, 'called createInvoice()')
    this.counterparty.invoice = await blockchain.createInvoice(this.counterparty)
    console.log(this.sdk.id, 'created invoice and saved it to counterparty', this.counterparty.invoice)

    INSTANCES.get(this).status = `${this.partyType}.invoice.created`
  }

  /**
   * Sends the invoice to the counterparty
   * @return {Promise<Void>}
   */
  async sendInvoice () {
    const { network } = this.sdk

    try {
      const args = { method: 'PATCH', path: '/api/v1/swap' }
      INSTANCES.get(this).status = `${this.partyType}.invoice.sent`
      await network.request(args, { swap: this })
    } catch (err) {
      INSTANCES.get(this).status = `${this.partyType}.invoice.created`
      throw err
    }
  }

  /**
   * Causes the party to pay the invoice
   * @return {Promise<Void>}
   */
  async payInvoice () {
    const { blockchains } = this.sdk
    const blockchain = blockchains[this.party.blockchain.split('.')[0]]
    console.log(this.sdk.id, 'paying', blockchain.id, 'invoice...')
    this.party.payment = await blockchain.payInvoice(this.party)
    console.log(this.sdk.id, 'paid', blockchain.id, 'invoice', this.party.payment)
    INSTANCES.get(this).status = `${this.partyType}.invoice.paid`
  }

  /**
   * Settles an invoice previously to send to the counterparty
   * @returns {Promise<Swap>}
   */
  async settleInvoice () {
    const { blockchains, store } = this.sdk
    const blockchain = blockchains[this.counterparty.blockchain.split('.')[0]]
    console.log(this.sdk.id, 'is reading the secret from the store using key', this.secretHash)
    const { secret } = await store.get('secrets', this.secretHash)
    console.log(this.sdk.id, 'settling', blockchain.id, 'invoice using secret', secret, 'retrieved using key', this.secretHash)
    const receipt = await blockchain.settleInvoice(this.counterparty, secret)
    console.log(this.sdk.id, 'settled', blockchain.id, 'invoice using secret', secret, receipt)
    INSTANCES.get(this).status = `${this.partyType}.invoice.settled`
  }
}

class Party {
  constructor(props, swap) {
    this.swap = swap

    this.id = props.id
    this.asset = props.asset
    this.quantity = props.quantity
    this.blockchain = props.blockchain

    INSTANCES.set(this, Object.seal({
      invoice: props.invoice || null,
      payment: props.payment || null
    }))

    Object.freeze(this)
  }

  /**
   * Returns whether or not the party is the secret holder
   * @returns {Boolean}
   */
  get isHolder () {
    return this.swap.secretHolder === this
  }

  /**
   * Returns whether or not the party is the secret seeker
   * @returns {Boolean}
   */
  get isSeeker () {
    return this.swap.secretSeeker === this
  }

  /**
   * Returns the invoice to be paid by the party
   */
  get invoice () {
    return INSTANCES.get(this).invoice
  }

  /**
   * Sets the invoice to be paid by the party
   * @returns {Void}
   */
  set invoice (val) {
    const state = INSTANCES.get(this)
    if (state.invoice != null) {
      throw Error('invoice already created!')
    }
    state.invoice = val
  }

  /**
   * Returns the details of the payment by the party
   */
  get payment () {
    return INSTANCES.get(this).payment
  }

  /**
   * Sets the details of the payment by the party
   * @returns {Void}
   */
  set payment (val) {
    const state = INSTANCES.get(this)
    if (state.payment != null) {
      throw Error('payment already created!')
    }
    state.payment = val
  }

  /**
   * Returns the current state of the instance
   * @type {String}
   */
  [Symbol.for('nodejs.util.inspect.custom')] () {
    return this.toJSON()
  }

  /**
   * Returns the JSON representation of the instance
   * @returns {Object}
   */
  toJSON () {
    return {
      id: this.id,
      asset: this.asset,
      quantity: this.quantity,
      blockchain: this.blockchain,
      invoice: this.invoice
    }
  }

  /**
   * Updates the party instance
   * @param {Party} party 
   */
  update (party) {
    if (this.id !== party.id) {
      throw Error('cannot modify party id anymore!')
    }

    if (this.asset !== party.asset) {
      throw Error('cannot modify party asset anymore!')
    }

    if (this.quantity !== party.quantity) {
      throw Error('cannot modify party quantity anymore!')
    }

    if (this.blockchain !== party.blockchain) {
      throw Error('cannot modify party blockchain anymore!')
    }

    // TODO: Fix this check to be more rigorous
    if (this.invoice == null && party.invoice != null) {
      this.invoice = party.invoice
    }

    if (this.payment == null && party.payment != null) {
      this.payment = party.payment
    }
  }
}

// class Invoice {
//   /**
//    * Creates a new instance of an invoice
//    * @param {Swap} swap The parent swap of the invoice
//    * @param {Object} invoice The invoice returned by the blockchain
//    */
//   constructor(swap, state) {
//     this.swap = swap
//     INSTANCES.set(this, { state })
//     Object.freeze(this)
//   }

//   get id () {
//     return this.swap.secretHash
//   }

//   get payer () {
//     return this.swap.counterparty
//   }

//   get payee () {
//     return this.swap.party
//   }

//   /**
//    * Returns the current state of the instance
//    * @type {String}
//    */
//   [Symbol.for('nodejs.util.inspect.custom')] () {
//     return this.toJSON()
//   }

//   /**
//    * Returns the JSON representation of the instance
//    * @returns {Object}
//    */
//   toJSON () {
//     return {
//       id: this.id,
//       payee: this.payee.id,
//       payer: this.payer.id,
//       asset: this.payer.asset,
//       quantity: this.payer.quantity,
//       blockchain: this.payer.blockchain,
//       state: INSTANCES.get(this).state
//     }
//   }

//   /**
//    * Creates an invoice by interfacing with the counterparty's blockchain
//    * @param {Swap} swap The swap for which the invoice is being created
//    * @returns 
//    */
//   static async create (swap) {
//     const blockchain = swap.sdk.blockchains[swap.counterparty.blockchain]
//     const invoice = await blockchain.createInvoice(swap.counterparty)
//     return new Invoice(swap, invoice)
//   }
// }
