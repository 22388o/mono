/**
 * @file Client implementation for node.js
 */

const BaseClass = require('../base_class')
const http = require('http')
const WebSocket = require('ws')

/**
 * Client implementation for node.js
 * @type {Client}
 */
module.exports = class Client extends BaseClass {
  constructor (props) {
    props = Object.assign({
      hostname: '127.0.0.1',
      port: 80,
      pathname: '/api/v1/updates'
    }, props)

    if (props.id == null || typeof props.id !== 'string') {
      throw Error('expected props.id to be a string!')
    }

    super({ id: props.id })

    this.hostname = props.hostname
    this.port = props.port
    this.pathname = props.pathname
    this.websocket = null

    Object.seal(this)
  }

  /**
   * Returns whether or not the SDK instance is connected to the server
   * @returns {Boolean}
   */
  get isConnected () {
    return this.websocket != null && this.websocket.readyState === 1
  }

  /**
   * Returns the JSON representation of this instance
   * @returns {Object}
   */
  toJSON () {
    return Object.assign(super.toJSON(), {
      hostname: this.hostname,
      port: this.port,
      pathname: this.pathname
    })
  }

  /**
   * Connects to the peer network.
   *
   * A websocket connection is established with the remote peer. The connection
   * is currently authenticated by an identifier of the user.
   * @returns {Promise<Void>}
   */
  connect () {
    return new Promise((resolve, reject) => {
      const { hostname, port, pathname } = this
      const url = `ws://${hostname}:${port}${pathname}/${this.id}`

      this.websocket = new WebSocket(url)
        .on('open', () => {
          this.info('connected', this)
          this.emit('connected', this)
          resolve(this)
        })
        .on('error', reject)
        .on('message', (...args) => this._onMessage(...args))
        .on('close', () => {
          this.websocket = null
          this.info('disconnected', this)
          this.emit('disconnected', this)
        })
    })
  }

  /**
   * Performs an HTTP request and returns the response
   * @param {Object} args Arguments for the operation
   * @param {Object} [data] Data to be sent as part of the request
   * @returns {Promise<Object>}
   */
  request (args, data) {
    return new Promise((resolve, reject) => {
      const creds = `${this.id}:${this.id}`
      const buf = (data && JSON.stringify(data)) || ''
      const opts = Object.assign(args, {
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
      })

      http.request(opts)
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
   * Send data to the server
   * @param {Object} obj The object to send
   * @returns {Promise<Void>}
   */
  send (obj) {
    return new Promise((resolve, reject) => {
      const buf = Buffer.from(JSON.stringify(obj))
      const opts = { binary: false }
      this.websocket.send(buf, opts, err => err ? reject(err) : resolve())
    })
  }

  /**
   * Closes the connection to the server
   * @returns {Promise<Void>}
   */
  disconnect () {
    return new Promise((resolve, reject) => this.websocket
      .once('error', reject)
      .once('close', () => {
        this.info('disconnected', this)
        this.emit('disconnected', this)
        resolve(this)
      })
      .close())
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

      if (arg['@type'] != null && arg.status != null) {
        event = `${arg['@type'].toLowerCase()}.${arg.status}`
        arg = [arg]
      } else if (arg['@event'] != null && arg['@data'] != null) {
        event = arg['@event']
        arg = arg['@data']
      } else {
        event = 'message'
        arg = [arg]
      }
    } catch (err) {
      event = 'error'
      arg = err
    } finally {
      this.emit(event, ...arg)
    }
  }
}
