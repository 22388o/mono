/**
 * @file Defines a party to an atomic swap
 */
const { uuid } = require('../../helpers')
const HolderTemplate = require('./holdertemplate/holdertemplate')
const SeekerTemplate = require('./seekertemplate/seekertemplate')
/**
 * Defines a party to a swap
 * @type {Party}
 */
module.exports = class Party {
  /**
   * Creates a new instance of a party to a swap
   * @param {Object} props Properties of the instance
   * @param {String} props.id The unique identifier of the party
   * @param {Asset} props.asset The asset which the party wants to trade
   * @param {Network} props.network The network on which the party holds assets
   * @param {Number} props.quantity The quantity of the asset being traded
   */
  constructor (props) {
    if (props == null) {
      throw Error('no properties specified for the party!')
    } else if (props.id == null) {
      throw Error('unique identifier of the user was not specified!')
    }

    console.log('in party constructor props: ', JSON.stringify(props, null, 2))

    this.id = props.id
    // this.asset = props.asset
    this.baseAsset = props.baseAsset
    this.quoteAsset = props.quoteAsset
    this.network = props.network
    // this.quantity = props.quantity
    this.baseQuantity = props.baseQuantity
    this.quoteQuantity = props.quoteQuantity
    this.orderId = props.orderId
    this.fee = props.fee
    this.template = props.template
    this.swapHash = props.swapHash


    this.swap = null // assigned by the swap constructor
    this.state = {
      shared: {}
    } // populated by the user/client over http/rpc
  }

  /**
   * Returns the counterparty to the swap
   * @returns {Party}
   */
  get counterparty () {
    if (this.isSecretHolder) {
      return this.swap.secretSeeker
    } else if (this.isSecretSeeker) {
      return this.swap.secretHolder
    } else {
      throw Error('cannot use .counterparty in multi-party swap!')
    }
  }

  /**
   * Returns whether or not the party is the secret holder
   * @returns {Boolean}
   */
  get isSecretHolder () {
    return this.swap && this.swap.secretHolder === this
  }

  /**
   * Returns whether or not the party is the secret seeker
   * @returns {Boolean}
   */
  get isSecretSeeker () {
    return this.swap && this.swap.secretSeeker === this
  }

  get hasTemplate () {
    return this.template != null
  }


  /**
   * Opens a swap for a single party
   *
   * Opening a swap essentially means creating an invoice on the counterparty's
   * network. It should not matter which party goes first, as there is no money
   * changing hands yet, but for now, we expect the SecretSeeker to move first,
   * followed by the SecretHolder.
   *
   * @param {Object} opts Configuration options for the operation
   * @returns {Promise<Party>}
   */
  async open (opts) {
    try {
      // console.log('\nparty.open', this, opts)

      if (this.hasTemplate) {
        const party = await(this.template.open(this, opts))
        this.counterparty.state.shared = Object.assign(this.counterparty.state.shared, party.state.shared)
        return party
      }

      if ((this.swap.isCreated && this.isSecretSeeker) ||
          (this.swap.isOpening && this.isSecretHolder)) {
        // Create an invoice on the counterparty's network
        // console.log('party.open', this.counterparty.network)
        return this.counterparty.network.open(this, opts)
      }

      if ((this.swap.isCreated && this.isSecretHolder)) {
        return Promise.reject(Error('waiting for secret seeker to open!'))
      } else if ((this.swap.isOpening && this.isSecretSeeker)) {
        return Promise.reject(Error('swap already opened!'))
      } else {
        return Promise.reject(Error('undefined behavior!'))
      }
    } catch (err) {
      return Promise.reject(err)
    }
  }

  /**
   * Commits to a swap for a single party
   * @param {Object} opts Configuration options for the operation
   * @returns {Promise<Party>}
   */
  async commit (opts) {
    try {
      console.log('\nparty.commit', this, opts)

      if (this.hasTemplate) {
        const party = await(this.template.commit(this, opts))
        this.counterparty.state.shared = Object.assign(this.counterparty.state.shared, party.state.shared)
        return party
      }

      if (this.isSecretSeeker && this.swap.isOpened) {
        return this.counterparty.network.commit(this, opts)
      } else if (this.isSecretHolder && this.swap.isCommitting) {
        return this.network.commit(this, opts)
      }

      if ((this.swap.isOpened && this.isSecretHolder)) {
        return Promise.reject(Error('waiting for secret seeker to commit!'))
      } else if ((this.swap.isCommitting && this.isSecretHolder)) {
        return Promise.reject(Error('swap already committed!'))
      } else {
        return Promise.reject(Error('undefined behavior!'))
      }
    } catch (err) {
      return Promise.reject(err)
    }
  }

  /**
   * Gracefully aborts a swap for a single party
   * @returns {Promise<Party>}
   */
  async abort (opts) {
    try {
      console.log('\nparty.abort', this, opts)

      if (this.hasTemplate) {
        const party = await(this.template.abort(this, opts))
        this.counterparty.state.shared = Object.assign(this.counterparty.state.shared, party.state.shared)
        return party
      }
    } catch (err) {
      return Promise.reject(err)
    }

    return Promise.reject(Error('not implemented yet!'))
  }

  /**
   * Returns the current state of the instance
   * @type {String}
   */
  [Symbol.for('nodejs.util.inspect.custom')] () {
    return this.toJSON()
  }

  /**
   * Returns the JSON representation of this instance
   * @returns {Object}
   */
  toJSON () {
    const obj = {
      '@type': this.constructor.name,
      id: this.id,
      swap: this.swap && { id: this.swap.id },
      swapHash: this.swapHash,
      baseAsset: this.baseAsset,
      quoteAsset: this.quoteAsset,
      network: this.network,
      baseQuantity: this.baseQuantity,
      quoteQuantity: this.quoteQuantity,
      orderId: this.orderId,
      fee: this.fee,
      state: this.state,
      isSecretSeeker: this.isSecretSeeker,
      isSecretHolder: this.isSecretHolder
    }

    return obj
  }

  /**
   * Creates a party from the an order from the matching engine
   * @param {Order} order An order (maker or taker) returned by order matching
   * @returns {Party}
   */
  static fromOrder (order, ctx) {
    // const asset = order.isAsk ? order.baseAsset : order.quoteAsset
    const network = order.isAsk ? order.baseNetwork : order.quoteNetwork
    // const quantity = order.isAsk ? order.baseQuantity : order.quoteQuantity

    if (ctx.networks[network] === undefined) {
      console.log(order, ctx.networks)
      process.exit(1)
    }

    return new Party({
      id: order.uid,
      baseAsset: ctx.assets[order.baseAsset],
      quoteAsset: ctx.assets[order.quoteAsset],
      network: ctx.networks[network],
      baseQuantity: order.baseQuantity,
      quoteQuantity: order.quoteQuantity,
      orderId: order.id,
    })
  }

  static fromHolderOrder (swapType, swapHash, order, ctx) {
    console.log('party.fromHolderOrder 0')
    console.log('swapType: ', swapType)
    console.log('order: ', order)

    let secretHolderProps = {
      uid: order.uid,
      hash: swapHash,
      party: 'secretHolder',
      // quantity: order.quoteQuantity,
      baseQuantity: order.baseQuantity,
      quoteQuantity: order.quoteQuantity,
      // asset: order.quoteAsset,
      baseAsset: order.baseAsset,
      quoteAsset: order.quoteAsset,
      baseNetwork: order.baseNetwork,
      quoteNetwork: order.quoteNetwork,
      orderId: order.id,

      fee: 1000 // TODO: connect to client entry
    }

    const holder = secretHolderProps.uid
    const holderTemplateProps = require(`../../../config/${holder}.json`)
    secretHolderProps = { ...secretHolderProps, ...holderTemplateProps}

    return this.fromHolderProps(swapType, swapHash, secretHolderProps, ctx )
  }

  static fromSeekerOrder (swapType, swapHash, order, ctx) {

    console.log('party.fromSeekerOrder 0')
    console.log('swapType: ', swapType)
    console.log('order: ', order)

    let secretSeekerProps = {
      uid: order.uid,
      hash: swapHash,
      party: 'secretHolder',
      // quantity: order.quoteQuantity,
      baseQuantity: order.baseQuantity,
      quoteQuantity: order.quoteQuantity,
      // asset: order.quoteAsset,
      baseAsset: order.baseAsset,
      quoteAsset: order.quoteAsset,
      baseNetwork: order.baseNetwork,
      quoteNetwork: order.quoteNetwork,
      orderId: order.id,
      fee: 0 // Connect to client entry
    }

    const seeker = secretSeekerProps.uid
    const seekerTemplateProps = require(`../../../config/${seeker}.json`)
    secretSeekerProps = { ...secretSeekerProps, ...seekerTemplateProps}

    return this.fromSeekerProps(swapType, swapHash, secretSeekerProps, ctx )
  }

  /**
   * Creates a party from props for a secret holder
   * @param {Order} order An order (maker or taker) returned by order matching
   * @returns {Party}
   */
  static fromHolderProps(swapType, swapHash, secretHolderProps, ctx) {
    // console.log(`secretHolderProps in fromHolderProps: ${JSON.stringify(secretHolderProps, null, 2)}`)

    // console.log(`swapHash IN FROM_HOLDERPROPS: ${swapHash}`)

    const template = HolderTemplate.fromProps(this, swapType, secretHolderProps)
    const userid = secretHolderProps.uid
    // const asset = secretHolderProps.asset
    const network = secretHolderProps.templateProps.nodes[swapType][0].network
    // const quantity = secretHolderProps.quantity
    const fee = secretHolderProps.fee
    const baseQuantity = secretHolderProps.baseQuantity
    const quoteQuantity = secretHolderProps.quoteQuantity
    const baseAsset = secretHolderProps.baseAsset
    const quoteAsset = secretHolderProps.quoteAsset
    const baseNetwork = secretHolderProps.baseNetwork
    const quoteNetwork = secretHolderProps.quoteNetwork
    const orderId = secretHolderProps.orderId

    if (ctx.networks[network] === undefined) {
      console.log(secretHolderProps.hash, ctx.networks)
      process.exit(1)
    }


    const party = new Party({
      id: userid + '--' + uuid(),
      baseQuantity,
      quoteQuantity,
      baseAsset: ctx.assets[baseAsset],
      quoteAsset: ctx.assets[quoteAsset],
      network: ctx.networks[network],
      orderId,

      // asset: ctx.assets[asset],
      // quantity,
      fee,
      template,
      swapHash
    })

    // console.log(`party IN FROM_HOLDERPROPS: ${JSON.stringify(party, null, 2)} `)

    // console.log(`secretHolder party before return - party: ${JSON.stringify(party, null, 2)}`)
    return party
  }

  /**
   * Creates a party from props for a secret seeker
   * @param {Order} order An order (maker or taker) returned by order matching
   * @returns {Party}
   */
  static fromSeekerProps(swapType, swapHash, secretSeekerProps, ctx) {
    // console.log(`secretSeekerProps in fromSeekerProps: ${JSON.stringify(secretSeekerProps, null, 2)}`)

    // console.log(`swapHash IN FROM_SEEKERPROPS: ${swapHash}`)

    const template = SeekerTemplate.fromProps(this, swapType, secretSeekerProps)
    const userid = secretSeekerProps.uid
    // const asset = secretSeekerProps.asset
    const network = secretSeekerProps.templateProps.nodes[swapType][0].network
    // const quantity = secretSeekerProps.quantity
    const fee = secretSeekerProps.fee

    const baseQuantity = secretSeekerProps.baseQuantity
    const quoteQuantity = secretSeekerProps.quoteQuantity
    const baseAsset = secretSeekerProps.baseAsset
    const quoteAsset = secretSeekerProps.quoteAsset
    const baseNetwork = secretSeekerProps.baseNetwork
    const quoteNetwork = secretSeekerProps.quoteNetwork
    const orderId = secretSeekerProps.orderId

    if (ctx.networks[network] === undefined) {
      console.log(secretSeekerProps.hash, ctx.networks)
      process.exit(1)
    }



    const party = new Party({
      id: userid + '--' + uuid(),
      baseQuantity,
      quoteQuantity,
      baseAsset: ctx.assets[baseAsset],
      quoteAsset: ctx.assets[quoteAsset],
      network: ctx.networks[network],
      orderId,
      // quantity,
      // asset: ctx.assets[asset],
      fee,
      template,
      swapHash
    })

    console.log('seekerParty: ', JSON.stringify(party, null, 2))

    // console.log(`party IN FROM_SEEKERPROPS: ${JSON.stringify(party, null, 2)} `)


    // console.log(`secretSeeker party before return - party: ${JSON.stringify(party, null, 2)}`)

    return party
  }

}
