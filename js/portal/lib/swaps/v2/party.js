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

    this.id = props.id
    this.asset = props.asset
    this.network = props.network
    this.quantity = props.quantity
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
      console.log('\nparty.open', this, opts)

      if (this.hasTemplate) {
        const party = await(this.template.open(this, opts))
        this.counterparty.state.shared = Object.assign(this.counterparty.state.shared, party.state.shared)
        return party
      }

      if ((this.swap.isCreated && this.isSecretSeeker) ||
          (this.swap.isOpening && this.isSecretHolder)) {
        // Create an invoice on the counterparty's network
        console.log('party.open', this.counterparty.network)
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
      asset: this.asset,
      network: this.network,
      quantity: this.quantity,
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
    const asset = order.isAsk ? order.baseAsset : order.quoteAsset
    const network = order.isAsk ? order.baseNetwork : order.quoteNetwork
    const quantity = order.isAsk ? order.baseQuantity : order.quoteQuantity

    if (ctx.networks[network] === undefined) {
      console.log(order, ctx.networks)
      process.exit(1)
    }

    return new Party({
      id: order.uid,
      asset: ctx.assets[asset],
      network: ctx.networks[network],
      quantity
    })
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
    const asset = secretHolderProps.asset
    const network = secretHolderProps.templateProps.nodes[swapType][0].network
    const quantity = secretHolderProps.quantity
    const fee = secretHolderProps.fee

    if (ctx.networks[network] === undefined) {
      console.log(secretHolderProps.hash, ctx.networks)
      process.exit(1)
    }


    const party = new Party({
      id: userid + '--' + uuid(),
      asset: ctx.assets[asset],
      network: ctx.networks[network],
      quantity,
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
    const asset = secretSeekerProps.asset
    const network = secretSeekerProps.templateProps.nodes[swapType][0].network
    const quantity = secretSeekerProps.quantity
    const fee = secretSeekerProps.fee

    if (ctx.networks[network] === undefined) {
      console.log(secretSeekerProps.hash, ctx.networks)
      process.exit(1)
    }



    const party = new Party({
      id: userid + '--' + uuid(),
      asset: ctx.assets[asset],
      network: ctx.networks[network],
      quantity,
      fee,
      template,
      swapHash
    })

    // console.log(`party IN FROM_SEEKERPROPS: ${JSON.stringify(party, null, 2)} `)


    // console.log(`secretSeeker party before return - party: ${JSON.stringify(party, null, 2)}`)

    return party
  }

}
