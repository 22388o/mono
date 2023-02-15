/**
 * @file An HTTP client implementation
 */

'use strict'

import { Buffer } from 'buffer'
import { EventEmitter } from 'events'

 /**
  * Exports an implementation of a client
  * @type {Client}
  */
export default class Client extends EventEmitter {
   /**
    * Creates a new instance of Client
    * @param {Object} props Properties of the client
    * @param {String} props.id The unique name of the client
    * @param {String} [props.hostname='localhost'] The hostname of the Portal server
    * @param {Number} [props.port=80] The port of the Portal server
    * @param {String} [props.pathname='/api/v1/updates'] The path to the updates channel
    * @param {Object} [props.credentials] Credentials maintained by the client
    */
  constructor (props) {
    if (props == null) {
      throw Error('no properties specified for the client!')
    } else if (props.id == null || typeof props.id !== 'string') {
      throw Error('A client must be provided a unique identifier!')
    }

    super()

    this.id = props.id
    this.hostname = props.hostname || 'localhost'
    this.port = props.port || 80
    this.pathname = props.pathname || '/api/v1/updates'
    this.credentials = props.credentials
    this.websocket = null
    this.log = (message, obj, debug = true) => {
      if (debug) {
        console.log(message)
        console.log(obj)
      }
    }

    Object.seal(this)
  }

   /**
    * Returns whether or not the client is connected to the server
    * @returns {Boolean}
    */
  get isConnected () {
    return (this.websocket != null) && (this.websocket.readyState === 1)
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
    return {
      '@type': this.constructor.name,
      id: this.id,
      hostname: this.hostname,
      port: this.port,
      pathname: this.pathname,
      credentials: this.credentials
    }
  }

   /**
    * Opens a connection to the server
    * @returns {Promise<Void>}
    */
  connect () {
    return new Promise((resolve, reject) => {
      const url = `ws://${this.hostname}:${this.port}${this.pathname}/${this.id}`
      const ws = new WebSocket(url)

      ws.onmessage = (...args) => { this._onMessage(...args) }
      ws.onopen = () => { this.emit('connected'); resolve() }
      ws.onclose = () => { this.websocket = null }
      ws.onerror = () => { reject }

      this.websocket = ws
    })
  }

   /**
    * Closes the connection to the server
    * @returns {Promise<Void>}
    */
  disconnect () {
    return new Promise((resolve, reject) => {
      // this.log("disconnect", this);
      // this.websocket.onerror = (error) => { reject; log("disconnect error", error) } // TODO
      // this.websocket.onclose = () => { this.emit('disconnected'); resolve() } // TODO
      // this.websocket.close() // TODO
    })
  }

   /**
    * Adds a limit order to the orderbook
    * @param {Object} order The limit order to add the orderbook
    */
  submitLimitOrder (order) {
    // this.log("client: submitLimitOrder", order)
    return this._request({
      method: 'PUT',
      url: '/api/v1/orderbook/limit'
    }, {
      uid: this.id,
      side: order.side,
      hash: order.hash,
      baseAsset: order.baseAsset,
      baseNetwork: order.baseNetwork,
      baseQuantity: order.baseQuantity,
      quoteAsset: order.quoteAsset,
      quoteNetwork: order.quoteNetwork,
      quoteQuantity: order.quoteQuantity
    })
  }

   /**
    * Adds a limit order to the orderbook
    * @param {Object} order The limit order to delete the orderbook
    */
  cancelLimitOrder (order) {
    return this._request({
      method: 'DELETE',
      path: '/api/v1/orderbook/limit'
    }, {
      id: order.id,
      baseAsset: order.baseAsset,
      quoteAsset: order.quoteAsset
    })
  }

   /**
    * Create the required state for an atomic swap
    * @param {Swap|Object} swap The swap to open
    * @param {Object} opts Options for the operation
    * @returns {Swap}
    */
  swapOpen (swap, opts) {
    return this._request({
      method: 'PUT',
      path: '/api/v1/swap'
    }, { swap, opts })
  }

   /**
    * Completes the atomic swap
    * @param {Swap|Object} swap The swap to commit
    * @param {Object} opts Options for the operation
    * @returns {Promise<Void>}
    */
  swapCommit (swap, opts) {
    return this._request({
      method: 'POST',
      path: '/api/v1/swap'
    }, { swap, opts })
  }

   /**
    * Abort the atomic swap optimistically and returns funds to owners
    * @param {Swap|Object} swap The swap to abort
    * @param {Object} opts Options for the operation
    * @returns {Promise<Void>}
    */
  swapAbort (swap, opts) {
    return this._request({
      method: 'DELETE',
      path: '/api/v1/swap'
    }, { swap, opts })
  }

   /**
    * Performs an HTTP request and returns the response
    * @param {Object} args Arguments for the operation
    * @param {Object} [data] Data to be sent as part of the request
    * @returns {Promise<Object>}
    */
  _request (args, data) {
    return new Promise((resolve, reject) => {
      const creds = `${this.id}:${this.id}`
      const buf = (data && JSON.stringify(data)) || ''
      const req = fetch(args.url, Object.assign(args, {
        headers: Object.assign(args.headers || {}, {
          accept: 'application/json',
          'accept-encoding': 'application/json',
          authorization: `Basic ${Buffer.from(`${creds}`).toString('base64')}`,
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(buf),
          'content-encoding': 'identity'
        }),
        body: buf
      }))

      req
        .then(res => {
          const { status } = res
          const contentType = res.headers.get('Content-Type')

            // this.log("_request, response: req ", req)
            // this.log("_request, response: res ", res)
            // this.log("contentType", contentType)

          if (status !== 200 && status !== 400) {
            reject(new Error(`unexpected status code ${status}`))
          } else if (!contentType.startsWith('application/json')) {
            reject(new Error(`unexpected content-type ${contentType}`))
          } else {
            res.json()
              .then(obj => status === 200
                ? resolve(obj)
                : reject(Error(obj.message)))
              .catch(reject)
          }
        })
        .catch(reject)
    })
  }

   /**
    * Send data to the server
    * @param {Object} obj The object to send
    * @returns {Promise<Void>}
    */
  _send (obj) {
    return new Promise((resolve, reject) => {
      const buf = Buffer.from(JSON.stringify(obj))
      const opts = { binary: false }
      this.websocket.send(buf, opts, err => err ? reject(err) : resolve())
    })
  }

   /**
    * Handles incoming websocket messages
    * @param {Buffer|Object} data The data received over the websocket
    * @returns {Void}
    */
  _onMessage (data) {
    let event, arg
    try {
      arg = data
      event = (arg['@type'] != null && arg.status != null)
         ? `${arg['@type'].toLowerCase()}.${arg.status}`
         : 'message'
    } catch (err) {
      event = 'error'
      arg = err
    } finally {
      this.emit(event, arg)
    }
  }
 }
