/**
 * @file Defines an instance of an atomic swap
 */

const Party = require('./party')
const { hash, uuid } = require('../../helpers')
const { EventEmitter } = require('events')

/**
 * An enum of swap states
 * @type {Array}
 */
const SWAP_STATUS = [
  'created',
  'opening',
  'opened',
  'committing',
  'committed',
  'aborted',
  'holderPaymentPending',
  'holderPaid'
]

/**
 * Stores the state of each swap, keyed by the unique identifier of the swap
 * @type {WeakMap}
 */
const SWAP_INSTANCES = new WeakMap()

/**
 * An instance of an Atomic Swap
 * @type {Swap}
 */
module.exports = class Swap extends EventEmitter {
  /**
   * Creates a new Swap instance
   * @param {Object} props Properties of the atomic swap
   * @param {String} props.id The unique identifier of the atomic swap
   * @param {String} props.secretHash The hash of the secret of the atomic swap
   * @param {Party} props.secretHolder The party that holds the secret
   * @param {Party} props.secretSeeker The party that seeks the secret
   */
  constructor (props, ctx) {
    if (!(props.secretHolder instanceof Party)) {
      throw Error('secretHolder is not an instance of Party!')
    } else if (!(props.secretSeeker instanceof Party)) {
      throw Error('secretSeeker is not an instance of Party!')
    } else if (props.secretHolder.id === props.secretSeeker.id) {
      throw Error('cannot self-swap between secretHolder and secretSeeker!')
    }
    // console.log('v2/swap constructor 0')
    // console.log(`swap constructor - secretHolder: ${JSON.stringify(props.secretHolder, null, 2)}\n\n`)
    // console.log(`swap constructor - secretSeeker: ${JSON.stringify(props.secretSeeker, null, 2)}\n\n`)

    super()

    SWAP_INSTANCES.set(this, {
      id: props.id || uuid(),
      secretHash: props.secretHash, // hexString
      secretHolder: props.secretHolder,
      secretSeeker: props.secretSeeker,
      status: SWAP_STATUS[0],
      sharedState: {}
    })

    // console.log('v2/swap constructor 1')

    SWAP_INSTANCES.get(this).secretHolder.swap = this
    SWAP_INSTANCES.get(this).secretSeeker.swap = this

    // console.log('v2/swap constructor 2')

    // TODO: freeze here?
    Object.seal(this)

    // console.log('v2/swap constructor 3')

    // Fire the event after allowing time for handlers to be registerd
    setImmediate(() => this.emit(this.status, this))

    // console.log('v2/swap constructor 4')
    // console.log('this.status: ', this.status)
    // console.log('this: ', this)
  }

  /**
   * Returns the unique identifier of the swap
   * @returns {String}
   */
  get id () {
    return SWAP_INSTANCES.get(this).id
  }

  /**
   * The hash of the secret
   * @returns {String}
   */
  get secretHash () {
    return SWAP_INSTANCES.get(this).secretHash
  }

  /**
   * The holder of the secret to the atomic swap
   * @returns {Party}
   */
  get secretHolder () {
    return SWAP_INSTANCES.get(this).secretHolder
  }

  /**
   * The seeker of the secret to the atomic swap
   * @returns {Party}
   */
  get secretSeeker () {
    return SWAP_INSTANCES.get(this).secretSeeker
  }

  /**
   * Returns whether or not the swap is in the `created` state
   * @returns {Boolean}
   */
  get isCreated () {
    return this.status === SWAP_STATUS[0]
  }

  /**
   * Returns whether or not the swap is in the `opening` state
   * @returns {Boolean}
   */
  get isOpening () {
    return this.status === SWAP_STATUS[1]
  }

  /**
   * Returns whether or not the swap is in the `opened` state
   * @returns {Boolean}
   */
  get isOpened () {
    return this.status === SWAP_STATUS[2]
  }

  /**
   * Returns whether or not the swap is in the `committing` state
   * @returns {Boolean}
   */
  get isCommitting () {
    return this.status === SWAP_STATUS[3]
  }

  /**
   * Returns whether or not the swap is in the `committed` state
   * @returns {Boolean}
   */
  get isCommitted () {
    return this.status === SWAP_STATUS[4]
  }

  /**
   * Returns whether or not the swap is in the `committed` state
   * @returns {Boolean}
   */
  get isAborted () {
    return this.status === SWAP_STATUS[5]
  }

  get isHolderPaymentPending () {
    return this.status === SWAP_STATUS[6]
  }

  get isHolderPaid () {
    return this.status === SWAP_STATUS[7]
  }

  /**
   * The current status of the atomic swap
   * @returns {String}
   */
  get status () {
    return SWAP_INSTANCES.get(this).status
  }

  /**
   * Returns the current state of the server as a JSON string
   * @type {String}
   */
  [Symbol.for('nodejs.util.inspect.custom')] () {
    return this.toJSON()
  }

  /**
   * Returns the JSON representation of the swap
   * @returns {Object}
   */
  toJSON () {
    return Object.assign({
      '@type': this.constructor.name
    }, SWAP_INSTANCES.get(this))
  }

  /**
   * Returns whether or not the specified user is a party to the swap
   * @param {Party|Object} party.id The unique identifier of the party
   * @returns {Boolean}
   */
  isParty (user) {
    return this.getUserIdFromPartyId(this.secretHolder.id) === user.id ||
      this.getUserIdFromPartyId(this.secretSeeker.id) === user.id
  }

  getUserIdFromPartyId = (partyId) => {
    return partyId.substring(0, partyId.indexOf('--'))
  }

  /**
   * Handles opening of the swap by one of its parties
   * @param {Object} party The party that is opening the swap
   * @param {String} party.id The unique identifier of the party
   * @param {Object} opts Configuration options for the operation
   * @returns {Promise<Swap>}
   */
  async open (party, opts) {


    const { secretHolder, secretSeeker, status } = this
    console.log('\nswap.open', this, party, opts)
    console.log('\nentering swap.open')
    console.log('this.status: ', this.status)
    console.log('status: ', status)

    const isHolder = party.id === secretHolder.id
    const isSeeker = party.id === secretSeeker.id
    const isBoth = isHolder && isSeeker
    const isNeither = !isHolder && !isSeeker

    if (status !== SWAP_STATUS[0] && status !== SWAP_STATUS[1]) {
      throw Error(`cannot open swap "${this.id}" when ${status}!`)
    } else if (isBoth) {
      throw Error('self-swapping is not allowed!')
    } else if (isNeither) {
      throw Error(`"${party.id}" not a party to swap "${this.id}"!`)
    }

    // NOTE: Mutation!!
    const { state } = party
    party = isHolder ? secretHolder : secretSeeker

    // console.log(`party.state: ${JSON.stringify(party.state, null, 2)}`)
    // console.log(`party: ${JSON.stringify(party, null, 2)}`)
    party.state = Object.assign({}, party.state, state)

    party = await party.open(opts)
    console.log('isOpening', this.isOpening)

    function getNewStatus (swap) {
      if (swap.isCreated) {
        return SWAP_STATUS[1]
      }
      else if (swap.isOpening) {
        return SWAP_STATUS[2]
      }
      else if (swap.isHolderPaymentPending) {
        return SWAP_STATUS[6] // stays the same; change made elsewhere
      }
      else {
        throw new Error(`swap status incorrect upon leaving call to open() ${swap.status}`)
      }
    }


    const newStatus = getNewStatus(this)
    console.log('newStatus', newStatus)
    SWAP_INSTANCES.get(this).status = newStatus
    this.emit(this.status, this)

    console.log('\nleaving swap.open')
    console.log('status: ', this.status)
    return this
  }

  /**
   * Handles committing to the swap by one of its parties
   * @param {Object} party The party that is opening the swap
   * @param {String} party.id The unique identifier of the party
   * @param {Object} opts Configuration options for the operation
   * @returns {Promise<Swap>}
   */
  async commit (party, opts) {


    const { secretHolder, secretSeeker, status } = this
    console.log('\nswap.commit', this, party, opts)
    console.log('\nentering swap.commit')
    console.log('this.status: ', this.status)
    console.log('status: ', status)

    const isHolder = party.id === secretHolder.id
    const isSeeker = party.id === secretSeeker.id
    const isBoth = isHolder && isSeeker
    const isNeither = !isHolder && !isSeeker

    if ((isSeeker && (status !== SWAP_STATUS[7] && status !== SWAP_STATUS[3])) || (isHolder && status !== SWAP_STATUS[6])) {
      throw Error(`cannot commit swap "${this.id}" when ${status}!`)
    } else if (isBoth) {
      throw Error('self-swapping is not allowed!')
    } else if (isNeither) {
      throw Error(`"${party.id}" not a party to swap "${this.id}"!`)
    }

    party = isHolder ? secretHolder : secretSeeker

    // console.log(`party.state: ${JSON.stringify(party.state, null, 2)}`)
    // console.log(`party: ${JSON.stringify(party, null, 2)}`)
    // party.state = Object.assign({}, party.state, state)

    party = await party.commit(opts)
    SWAP_INSTANCES.get(this).status = this.isCommitting
      ? SWAP_STATUS[4]
      : SWAP_STATUS[3]
    this.emit(this.status, this)


    console.log('\nleaving swap.commit')
    console.log('this.status: ', this.status)
    return this
  }

  /**
   * Handles aborting the swap by one of its parties
   * @param {Object} party The party that is opening the swap
   * @param {String} party.id The unique identifier of the party
   * @param {Object} opts Configuration options for the operation
   * @returns {Promise<Swap>}
   */
  async abort (party, opts) {
    console.log('\nswap.abort', this, party, opts)

    const { secretHolder, secretSeeker, status } = this
    const isHolder = party.id === secretHolder.id
    const isSeeker = party.id === secretSeeker.id
    const isBoth = isHolder && isSeeker
    const isNeither = !isHolder && !isSeeker

    if (status !== SWAP_STATUS[7]) {
      throw Error(`cannot abort swap "${this.id}" when ${status}!`)
    } else if (isBoth) {
      throw Error('self-swapping is not allowed!')
    } else if (isNeither) {
      throw Error(`"${party.id}" not a party to swap "${this.id}"!`)
    }
    const { state } = party
    party = isHolder ? secretHolder : secretSeeker

    // console.log(`party.state: ${JSON.stringify(party.state, null, 2)}`)
    // console.log(`party: ${JSON.stringify(party, null, 2)}`)
    party.state = Object.assign({}, party.state, state)

    party = await party.abort(opts)
    SWAP_INSTANCES.get(this).status = SWAP_STATUS[5]

    this.emit(this.status, this)

    return this
  }

  /**
   * Creates an atomic swap for settling a pair of orders
   * @param {Order} makerOrder The maker of the order
   * @param {Order} takerOrder The taker of the order
   * @param {HttpContext} ctx The http context object
   * @returns {Swap}
   */
  static fromOrders (makerOrder, takerOrder, ctx) {
    console.log('swap2.fromOrders')
    const swapType = 'ordinal'
    // TODO: remove 'ordinal' hardcoding of swapType
    const id = hash(makerOrder.id, takerOrder.id)
    const secretHash = makerOrder.hash
    const secretHolder = Party.fromHolderOrder(swapType, secretHash, makerOrder, ctx)
    console.log('after secretHolder party creation')

    const secretSeeker = Party.fromSeekerOrder(swapType, secretHash, takerOrder, ctx)
    console.log('after secretSeeker party creation')

    return new Swap({ id, swapType, secretHash, secretHolder, secretSeeker })
  }

  /**
   * Creates a new swap using swap type and template
   * @param {Order|Object} secretHolder The swap secret holder
   * @param {Order|Object} secretSeeker The swap secret seeker
   * @returns {Promise<Swap>}
   */

  static fromProps (swapType, secretHolderProps, secretSeekerProps, ctx) {
    // console.log(`inside Swap.fromProps`)

    const id = uuid()

    console.log(`secretHolderProps IN FROM_PROPS: ${JSON.stringify(secretHolderProps, null, 2)}`)
    const secretHash = secretHolderProps.hash
    console.log(`secretHash: ${secretHash}`)

    let secretHolder, secretSeeker
    try {
    // console.log(`about to call Party.fromHolderProps`)
      secretHolder = Party.fromHolderProps(swapType, secretHash, secretHolderProps, ctx)
      // console.log(`about to call Party.fromSeekerProps`)
      secretSeeker = Party.fromSeekerProps(swapType, secretHash, secretSeekerProps, ctx)
    } catch (err) {
      console.log(`Error: ${err}`)
      return reject(err)
    }
    // console.log(`both Parties created`)
    // console.log(`before swap constructor call - secretHolder: ${JSON.stringify(secretHolder, null, 2)}\n\n`)
    // console.log(`before swap constructor call - secretSeeker: ${JSON.stringify(secretSeeker, null, 2)}\n\n`)
    const swap = new Swap({ id, swapType, secretHash, secretHolder, secretSeeker })

    // console.log(`swap created`)
    return swap
  }

  setStatusToHolderPaymentPending () {
    SWAP_INSTANCES.get(this).status = SWAP_STATUS[6]
  }

  setStatusToHolderPaid () {
    SWAP_INSTANCES.get(this).status = SWAP_STATUS[7]
  }
}
