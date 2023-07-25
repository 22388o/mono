/**
 * @file The Portal SDK
 */

const { EventEmitter } = require('events')
const Websocket = require('ws')

/* eslint-disable no-new-func */
const testFn = obj => `try {return this===${obj};}catch(e){ return false;}`
const isBrowser = new Function(testFn('window'))
const isNode = new Function(testFn('global'))
/* eslint-enable no-new-func */

/**
 * Exports a function that returns the Portal SDK
 * @type {Function}
 */
module.exports = class Sdk extends EventEmitter {
  /**
   * Creates a new instance of SDK
   * @param {Object} props Properties of the SDK instance
   * @param {String} props.id The unique name of the SDK instance
   * @param {String} [props.hostname='localhost'] The hostname of the Portal server
   * @param {Number} [props.port=80] The port of the Portal server
   * @param {String} [props.pathname='/api/v1/updates'] The path to the updates channel
   * @param {Object} [props.credentials] Credentials maintained by the SDK instance
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
    this._request = isNode()
      ? httpRequest.bind(this)
      : isBrowser()
        ? httpFetch.bind(this)
        : function () { throw Error('unknown environment!') }

    Object.seal(this)
  }

  /**
   * Returns whether or not the SDK instance is connected to the server
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
      const ws = new Websocket(url)

      this.websocket = ws
        .on('message', (...args) => this._onMessage(...args))
        .once('open', () => { this.emit('connected'); resolve() })
        .once('close', () => { this.websocket = null })
        .once('error', reject)
    })
  }

  /**
   * Closes the connection to the server
   * @returns {Promise<Void>}
   */
  disconnect () {
    return new Promise((resolve, reject) => this.websocket
      .once('error', reject)
      .once('close', () => { this.emit('disconnected'); resolve() })
      .close())
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
        accept: 'application/json',
        'accept-encoding': 'application/json',
        authorization: `Basic ${Buffer.from(creds).toString('base64')}`,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(buf),
        'content-encoding': 'identity'
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
    const creds = `${this.id}:${this.id}`
    const buf = (data && JSON.stringify(data)) || ''
    const req = fetch(Object.assign(args, {
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
