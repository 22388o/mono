/**
 * @file Client implementation for the browser
 */

const { BaseClass } = require('@portaldefi/core')

/**
 * Client implementation for the browser
 * @type {Client}
 */
module.exports = class Client extends BaseClass {
  constructor(props) {
    if (props == null) {
      throw Error('expected props to be provided!')
    } else if (props.id == null || typeof props.id !== 'string') {
      throw Error('expected props.id to be a valid identifier!')
    } else if (props.hostname != null && typeof props.hostname !== 'string') {
      throw Error('expected props.hostname to be a valid hostname/IP address!')
    } else if (props.port != null && typeof props.port !== 'number') {
      throw Error('expected props.port to be a number between 0 and 65535!')
    } else if (props.pathname == null || typeof props.pathname !== 'string') {
      throw Error('expected props.pathname to a valid API path!')
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
  get isConnected() {
    return (this.websocket != null) && (this.websocket.readyState === 1)
  }

  /**
   * Returns the JSON representation of this instance
   * @returns {Object}
   */
  toJSON() {
    return Object.assign(super.toJSON(), {
      hostname: this.hostname,
      port: this.port,
      pathname: this.pathname
    })
  }

  /**
   * Opens a connection to the remote end
   * @returns {Promise<Void>}
   */
  connect() {
    return new Promise((resolve, reject) => {
      const { hostname, port, pathname, uid } = this
      const url = `ws://${hostname}:${port}${pathname}`
      const ws = new WebSocket(url) /* eslint-disable-line no-undef */

      ws.onerror = reject

      ws.onopen = () => {
        this.websocket = ws
        this.info('connected', this)
        this.emit('connected', this)
        resolve(this)
      }

      ws.onclose = () => {
        this.websocket = null
        this.info('disconnected', this)
        this.emit('disconnected', this)
      }

      ws.onmessage = (...args) => this._onMessage(...args)
    })
  }

  /**
   * Performs an HTTP request and returns the response
   * @param {Object} args Arguments for the operation
   * @param {Object} [data] Data to be sent as part of the request
   * @returns {Promise<Object>}
   */
  request(args, data) {
    return new Promise((resolve, reject) => {
      const buf = (data && JSON.stringify(data)) || ''
      const opts = Object.assign(args, {
        headers: Object.assign(args.headers || {}, {
          /* eslint-disable quote-props */
          'accept': 'application/json',
          'accept-encoding': 'application/json',
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(buf),
          'content-encoding': 'identity'
          /* eslint-enable quote-props */
        }),
        body: buf
      })
      const req = fetch(args.path, opts) /* eslint-disable-line no-undef */

      req
        .then(res => {
          const { status } = res
          const contentType = res.headers.get('Content-Type')

          if (status !== 200 && status !== 400) {
            const err = new Error(`unexpected status code ${status}`)
            this.error('http.error', err, req, this)
            this.emit('error', err, req, this)
            return reject(err)
          } else if (!contentType.startsWith('application/json')) {
            const err = new Error(`unexpected content-type ${contentType}`)
            this.error('http.error', err, req, this)
            this.emit('error', err, req, this)
            return reject(err)
          } else {
            res.json()
              .then(obj => {
                if (status === 200) {
                  this.info('http.end', req, res, this)
                  resolve(res.json)
                } else {
                  const err = new Error(res.json.message)
                  this.error('http.error', err, req, res, this)
                  this.emit('error', err, req, res, this)
                  reject(err)
                }
              })
              .catch(err => {
                this.error('http.error', err, req, res, this)
                this.emit('error', err, req, res, this)
                reject(err)
              })
          }
        })
        .catch(reject)

      this.info('http.start', req, this)
    })
  }

  /**
   * Send data to the server
   * @param {Object} obj The object to send
   * @returns {Promise<Void>}
   */
  send(obj) {
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
  disconnect() {
    return new Promise((resolve, reject) => {
      const ws = this.websocket
      ws.onerror = reject
      ws.onclose = resolve
      ws.close()
    })
  }

  /**
   * Handles incoming websocket messages
   * @param {Buffer|Object} data The data received over the websocket
   * @returns {Void}
   */
  _onMessage(data) {
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
      this.info('message', event, ...arg)
      this.emit(event, ...arg)
    }
  }
}
