/**
 * @file P2P network implementation for node.js
 */

const http = require('http')
const { WebSocket } = require('ws')
const { BaseClass } = require('../base_class')

/**
 * P2P network implementation for node.js
 * @type {Network}
 */
class Network extends BaseClass {
  constructor (props) {
    if (props == null) {
      throw Error('expected props to be provided!')
    } else if (props.id == null || typeof props.id !== 'string') {
      throw Error('expected props.id to be a valid identifier!')
    } else if (props.uid == null || typeof props.uid !== 'string') {
      throw Error('expected props.uid to be a valid identifier!')
    } else if (props.hostname == null || typeof props.hostname !== 'string') {
      throw Error('expected props.hostname to be a valid hostname/IP address!')
    } else if (props.port == null || typeof props.port !== 'number') {
      throw Error('expected props.port to be a number between 0 and 65535!')
    } else if (props.pathname == null || typeof props.pathname !== 'string') {
      throw Error('expected props.pathname to a valid API path!')
    }

    super({ id: props.id })

    this.uid = props.uid
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
   * Opens a connection to the remote end
   * @returns {Promise<Void>}
   */
  connect () {
    return new Promise((resolve, reject) => {
      const { hostname, port, pathname, uid } = this
      const url = `ws://${hostname}:${port}${pathname}/${uid}`
      const ws = new WebSocket(url)

      ws.once('error', reject)

      ws.once('open', () => {
        this.websocket = ws
        this.info('connected', this)
        this.emit('connected', this)
        resolve(this)
      })

      ws.once('close', () => {
        this.websocket = null
        this.info('disconnected', this)
        this.emit('disconnected', this)
      })

      ws.on('message', (...args) => this._onMessage(...args))
    })
  }

  /**
   * Performs an HTTP request and returns the response
   * @param {Object} args Arguments for the operation
   * @param {Object} [json] Data to be sent as part of the request
   * @returns {Promise<Object>}
   */
  request (args, json) {
    return new Promise((resolve, reject) => {
      const creds = `${this.uid}:${this.uid}`
      const buf = (json && JSON.stringify(json)) || ''
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
      const req = this._request(opts, json)

      req
        .once('abort', () => {
          const err = new Error('aborted')
          this.error('http.error', err, req, this)
          this.emit('error', err, req, this)
          reject(err)
        })
        .once('error', err => {
          this.error('http.error', err, req, this)
          this.emit('error', err, req, this)
          reject(err)
        })
        .once('response', res => {
          const { statusCode } = res
          const contentType = res.headers['content-type']

          if (statusCode !== 200 && statusCode !== 400) {
            const err = new Error(`unexpected status code ${statusCode}`)
            this.error('http.error', err, req, this)
            this.emit('error', err, req, this)
            return reject(err)
          } else if (!contentType.startsWith('application/json')) {
            const err = new Error(`unexpected content-type ${contentType}`)
            this.error('http.error', err, req, this)
            this.emit('error', err, req, this)
            return reject(err)
          } else {
            const chunks = []
            res
              .on('data', chunk => chunks.push(chunk))
              .once('error', err => {
                this.error('http.error', err, req, res, this)
                this.emit('error', err, req, res, this)
                reject(err)
              })
              .once('end', () => {
                const str = Buffer.concat(chunks).toString('utf8')

                try {
                  res.json = JSON.parse(str)
                  if (statusCode === 200) {
                    this.info('http.end', req, res, this)
                    resolve(res.json)
                  } else {
                    const err = new Error(res.json.message)
                    this.error('http.error', err, req, res, this)
                    this.emit('error', err, req, res, this)
                    reject(err)
                  }
                } catch (err) {
                  this.error('http.error', str, req, res, this)
                  this.emit('error', err, str, req, res, this)
                  reject(new Error(`malformed JSON response "${str}"`))
                }
              })
          }
        })
        .end(buf)

      this.info('http.start', req, this)
    })
  }

  /**
   * Proxies HTTP requests to the remote end
   * @param {IncomingMessage} req The HTTP request to be proxied
   * @param {ServerResponse} res The HTTP response to be proxied
   * @returns {Promise<Void>}
   */
  proxy (req, res) {
    return new Promise((resolve, reject) => {
      req.once('error', err => {
        this.error('proxy.error', err, req, res, this)
        this.emit('error', err, req, res, this)
        reject(err)
      })
      res.once('error', err => {
        this.error('proxy.error', err, req, res, this)
        this.emit('error', err, req, res, this)
        reject(err)
      })

      res.once('finish', () => {
        this.info('proxy.end', req, res, this)
        resolve()
      })

      const creds = `${this.uid}:${this.uid}`
      const opts = {
        hostname: this.hostname,
        port: this.port,
        method: req.method,
        path: req.url,
        headers: Object.assign({}, req.headers, {
          authorization: `Basic ${Buffer.from(creds).toString('base64')}`
        })
      }
      const proxyReq = this._request(opts)
        .once('abort', () => res.destroy(Error('proxy aborted!')))
        .once('error', err => res.destroy(err))
        .once('response', proxyRes => {
          // proxy the incoming response
          res.statusCode = proxyRes.statusCode
          for (const header in proxyRes.headers) {
            res.setHeader(header, proxyRes.headers[header])
          }

          proxyRes
            .once('error', err => res.destroyed || res.destroy(err))
            .pipe(res)
            .once('error', err => proxyRes.destroyed || proxyRes.destroy(err))
        })

      // proxy the incoming request
      req
        .once('error', err => proxyReq.destroyed || proxyReq.destroy(err))
        .pipe(proxyReq)
        .once('error', err => req.destroyed || req.destroy(err))

      this.info('proxy.start', req, proxyReq, this)
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
      .once('error', err => reject(err))
      .once('close', () => resolve(this))
      .close())
  }

  /**
   * Returns a ClientRequest augmented for debugging/logging
   * @param {Object} args The arguments for the http request
   * @param {Object} [json] JSON to be sent as part of the request
   * @returns {ClientRequest}
   */
  _request (args, json) {
    const req = http.request(args)
      .once('response', res => {
        res.toJSON = function () {
          const { statusCode, headers, json } = res
          return { '@type': 'HttpResponse', statusCode, headers, json }
        }

        res[Symbol.for('nodejs.util.inspect.custom')] = function () {
          return this.toJSON()
        }
      })

    req.toJSON = function () {
      return { '@type': 'HttpRequest', ...args, json }
    }

    req[Symbol.for('nodejs.util.inspect.custom')] = function () {
      return this.toJSON()
    }

    return req
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

/**
 * Define the named exports of the module
 */
module.exports = { Network }
