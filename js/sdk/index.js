/**
 * @file The Portal SDK
 */

const { EventEmitter } = require('eventemitter3')
const Websocket = require('ws')

/* eslint-disable no-new-func */
const testFn = obj => `try {return this===${obj};}catch(e){ return false;}`
const isBrowser = new Function(testFn('window'))
const isNode = new Function(testFn('global'))
/* eslint-enable no-new-func */

/**
 * Exports a function that returns the Portal SDK
 * @type {Sdk}
 */
class Sdk extends EventEmitter {
  /**
   * Creates a new instance of SDK
   * @param {Object} props Properties of the SDK instance
   * @param {String} props.id The unique name of the SDK instance
   * @param {String} [props.hostname='localhost'] The hostname of the Portal server
   * @param {Number} [props.port=80] The port of the Portal server
   * @param {String} [props.pathname='/api/v1/updates'] The path to the updates channel
   * @param {Object} [props.credentials] Wallet Credentials maintained by the SDK instance
   */
  constructor (props) {
    if (props == null) {
      throw Error('no properties specified for the SDK instance!')
    } else if (props.id == null || typeof props.id !== 'string') {
      throw Error('An SDK instance must be provided a unique identifier!')
    }

    super()

    this.id = props.id
    this.hostname = props.hostname || 'localhost'
    this.port = props.port || 80
    this.pathname = props.pathname || '/api/v1/updates'
    this.credentials = props.credentials
    this.websocket = null
    this._request = isBrowser()
      ? httpFetch.bind(this) 
      : isNode()
        ? httpRequest.bind(this)
        : function () { throw Error('unknown environment!') }
  }

  /**
   * Returns whether or not the SDK instance is connected to the server
   * @returns {Boolean}
   */
  get isConnected () {
    return (this.websocket != null) && (this.websocket.readyState === 1)
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
   * Opens a websocket connection to the server
   * @returns {Promise<Void>}
   */
  connect () {
    return new Promise((resolve, reject) => {
      const url = `ws://${this.hostname}:${this.port}${this.pathname}/${this.id}`
      let ws;
      if(isBrowser()){
        ws = new WebSocket(url);
        ws.onerror = () => { reject }
        ws.onclose = () => { this.websocket = null }
        ws.onopen = () => {
          ws.onmessage = (...args) => { this._onMessage(...args) }
          this.emit('connected')
          resolve()
        }
      } else {
        ws = new Websocket(url);
        this.websocket = ws
        .on('message', (...args) => this._onMessage(...args))
        .once('open', () => { this.emit('connected'); resolve() })
        .once('close', () => { this.websocket = null })
        .once('error', reject)
      }
    })
  }

  /**
   * Closes the websocket connection to the server
   * @returns {Promise<Void>}
   */
  disconnect () {
    if(isBrowser()) {
      return new Promise((resolve, reject) => {
        this.websocket.onerror = (error) => { reject; } // TODO
        this.websocket.onclose = () => { this.emit('disconnected'); resolve() } // TODO
        this.websocket.close() // TODO
      })
    } else {
      return new Promise((resolve, reject) => this.websocket
        .once('error', reject)
        .once('close', () => { this.emit('disconnected'); resolve() })
        .close())
    }
  }

  /**
   * Creates a limit order on the orderbook
   * @param {Object} order The limit order to add the orderbook
   */
  submitLimitOrder (order) {
    return this._request({
      method: 'PUT',
      path: '/api/v1/orderbook/limit'
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
   * Removes a specified limit order from the orderbook
   * @param {Object} order The limit order to delete from the orderbook
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
      arg = JSON.parse(data)
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

/**
 * Performs an HTTP request using the `http(s)` module from node.js
 * @param {Object} args Arguments for the operation
 * @param {Object} [data] Data to be sent as part of the request
 * @returns {Promise<Object>}
 */
const http = isNode() && require('http')
function httpRequest (args, data) {
  return new Promise((resolve, reject) => {
    const creds = `${this.id}:${this.id}`
    const buf = (data && JSON.stringify(data)) || ''
    const req = http.request(Object.assign(args, {
      hostname: this.hostname,
      port: this.port,
      headers: Object.assign(args.headers || {}, {
        /* eslint-disable quote-props */
        'accept': 'application/json',
        'accept-encoding': 'application/json',
        'authorization': `Basic ${Buffer.from(creds).toString('base64')}`,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(buf),
        'content-encoding': 'identity'
        /* eslint-enable quote-props */
      })
    }))

    req
      .once('abort', () => reject(new Error('aborted')))
      .once('error', err => reject(err))
      .once('response', res => {
        const { statusCode } = res
        const contentType = res.headers['content-type']

        if (statusCode !== 200 && statusCode !== 400) {
          return reject(new Error(`unexpected status code ${statusCode}`))
        } else if (!contentType.startsWith('application/json')) {
          return reject(new Error(`unexpected content-type ${contentType}`))
        } else {
          const chunks = []
          res
            .on('data', chunk => chunks.push(chunk))
            .once('error', err => reject(err))
            .once('end', () => {
              const str = Buffer.concat(chunks).toString('utf8')
              let obj = null

              try {
                obj = JSON.parse(str)
              } catch (err) {
                return reject(new Error(`malformed JSON response "${str}"`))
              }

              statusCode === 200
                ? resolve(obj)
                : reject(new Error(obj.message))
            })
        }
      })
      .end(buf)
  })
}

/**
 * Performs an HTTP request using the Fetch API
 * @param {Object} args Arguments for the operation
 * @param {Object} [data] Data to be sent as part of the request
 * @returns {Promise<Object>}
 */
function httpFetch (args, data) {
  return new Promise((resolve, reject) => {
    const body = (data && JSON.stringify(data)) || ''
    const creds = `${this.id}:${this.id}`
    const headers = Object.assign(args.headers || {}, {
      accept: 'application/json',
      'accept-encoding': 'application/json',
      authorization: `Basic ${Buffer.from(`${creds}`).toString('base64')}`,
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(body),
      'content-encoding': 'identity'
    })

    args = Object.assign(args, { headers, body })

    /*debug(`\n\n    Args: ${JSON.stringify(newArgs)}`)
    debug(`\n\n    Data: ${JSON.stringify(data)}`)*/

    fetch(args.path, args)
      .then(res => {
        const { status } = res
        const contentType = res.headers.get('Content-Type')

        if (status !== 200 && status !== 400) {
          const err = Error(`unexpected status code ${status}`)
          reject(err)
        } else if (!contentType.startsWith('application/json')) {
          const err = Error(`unexpected content-type ${contentType}`)
          reject(err)
        } else {
          res.json()
            .then(obj => {
              if (status === 200) {
                resolve(obj)
              } else {
                reject(Error(obj.message))
              }
            })
            .catch(err => {
              reject(err)
            })
        }
      })
      .catch(err => {
        reject(err)
      })
  })
}

// Check if executed by node
if (typeof module !== 'undefined') {
  module.exports = Sdk

  /**
   * Returns the current state of the instance
   * @type {String}
   */
  Sdk.prototype[Symbol.for('nodejs.util.inspect.custom')] = function () {
    return this.toJSON()
  }
}