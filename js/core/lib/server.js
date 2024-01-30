/**
 * @file An HTTP server implementation
 */

const BaseClass = require('./base_class')
const { constants, createReadStream, lstat } = require('fs')
const { readdirSync, statSync } = require('fs')
const http = require('http')
const mime = require('mime')
const { basename, dirname, extname, join, normalize } = require('path')
const { URL } = require('url')
const { WebSocketServer } = require('ws')

/**
 * A weak-map storing private data for each instance of the class
 * @type {WeakMap}
 */
const INSTANCES = new WeakMap()

/**
 * The default options for API handlers; these can be overridden by the endpoint
 * @type {Object}
 */
const DEFAULT_HANDLER_OPTS = {
  autoParse: true,
  isUnauthenticated: false
}

/**
 * Exports an implementation of a server
 * @type {Server}
 */
module.exports = class Server extends BaseClass {
  constructor (props = {}) {
    if (props == null) {
      throw Error('expected props to be provided!')
    } else if (props.id == null || typeof props.id !== 'string') {
      throw Error('expected props.id to be a string!')
    } else if (props.hostname != null && typeof props.hostname !== 'string') {
      throw Error('expected props.hostname to be a valid hostname/IP address!')
    } else if (props.port != null && typeof props.port !== 'number') {
      throw Error('expected props.port to be a number between 0 and 65535!')
    } else if (props.api == null || typeof props.api !== 'string') {
      throw Error('expected props.api to a valid path!')
    }

    super({ id: props.id })

    const hostname = props.hostname || '127.0.0.1'
    const port = props.port || 0
    const api = buildApi(props.api)
    const root = props.root

    const server = http.createServer({ IncomingMessage, ServerResponse })
    const websocket = new WebSocketServer({ noServer: true })

    INSTANCES.set(this, { hostname, port, api, root, server, websocket })
  }

  /**
   * Returns the hostname/IP address of the interface the server is listening on
   * @returns {String}
   */
  get hostname () {
    return INSTANCES.get(this).hostname
  }

  /**
   * Returns the port the server is listening on
   * @returns {Number}
   */
  get port () {
    return INSTANCES.get(this).port
  }

  /**
   * Returns the root directory holding static content to be served
   * @returns {String}
   */
  get root () {
    return INSTANCES.get(this).root
  }

  /**
   * Returns the port the server is listening on
   * @returns {Number}
   */
  get endpoints () {
    return Object.keys(INSTANCES.get(this).api)
  }

  /**
   * Returns whether or not the server is listening for connections
   * @returns {Boolean}
   */
  get isListening () {
    return INSTANCES.get(this).server.listening
  }

  /**
   * Returns the URL of the server
   * @returns {String}
   */
  get url () {
    return `http://${this.hostname}:${this.port}`
  }

  /**
   * Returns the JSON representation of the instance
   * @returns {Object}
   */
  toJSON () {
    const { hostname, port, root } = INSTANCES.get(this)
    return {
      '@type': this.constructor.name,
      hostname,
      port,
      root,
      url: this.url
    }
  }

  /**
   * Starts the server
   * @returns {Promise<Server>}
   */
  start () {
    const instance = INSTANCES.get(this)

    return new Promise((resolve, reject) => instance.server
      .once('error', reject)
      .once('listening', () => {
        instance.port = instance.server.address().port
        instance.server
          .removeListener('error', reject)
          .on('error', (...args) => this._onError(...args))
          .on('request', (...args) => this._onRequest(...args))
          .on('upgrade', (...args) => this._onUpgrade(...args))

        this.info('start', this)
        this.emit('start', this)
        resolve(this)
      })
      .listen(instance.port, instance.hostname))
  }

  /**
   * Stops the server
   * @returns {Promise<Void>}
   */
  stop () {
    const instance = INSTANCES.get(this)

    return new Promise((resolve, reject) => instance.server
      .once('error', reject)
      .once('close', () => {
        this.info('stop', this)
        this.emit('stop', this)
        resolve(this)
      })
      .close())
  }

  /**
   * Handles any errors on the server
   * @param {Error} err The error that occurred
   * @returns {Void}
   */
  _onError (err) {
    this.error('error', err, this)
    this.emit('error', err, this)
  }

  /**
   * Handles an incoming HTTP request
   * @param {IncomingMessage} req The incoming HTTP request
   * @param {ServerResponse} res The outgoing HTTP response
   * @returns {Void}
   */
  _onRequest (req, res) {
    // If the request errors, then handle the response to the client
    req.once('error', () => {
      if (!res.destroyed && !res.headersSent) {
        res.statusCode = 500
        res.end()
      }
    })

    // Emit all request/response errors as logs
    req.on('error', err => this.error('request.error', err, req, res))
    res.on('error', err => this.error('response.error', err, req, res))

    // Parse the URL and stash it for later use
    req.parsedUrl = new URL(req.url, `http://${req.headers.host}`)

    // Route the request
    const { api } = INSTANCES.get(this)

    // Parse the path components in reverse order until a match is obtained
    let route = req.parsedUrl.pathname
    let routed = !!api[route]
    while (!routed && route.length > 0) {
      route = route.slice(0, route.lastIndexOf('/'))
      routed = !!api[route]
    }

    if (routed) {
      const handler = api[route]
      if (typeof handler[req.method] === 'function') {
        req.handler = handler[req.method]
      } else if (typeof handler === 'function') {
        req.handler = handler
      } else {
        res.statusCode = (typeof handler.UPGRADE === 'function') ? 404 : 405
        res.end()
        return
      }

      this._handleApi(req, res, req.handler.opts)
    } else {
      this._handleStatic(req, res)
    }
  }

  /**
   * Handles incoming HTTP upgrade requests
   * @param {HttpRequest} req The client HTTP GET request
   * @param {Socket} socket The network socket between the server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @returns {Void}
   */
  _onUpgrade (req, socket, head) {
    // Parse the URL and stash it for later use
    req.parsedUrl = new URL(req.url, `http://${req.headers.host}`)
    const { pathname } = req.parsedUrl

    // Parse the client identifier and stash it for later use
    // The authorization header is "Basic <base-64 encoded username:password>"
    // We split out the username and stash it on req.user
    // const auth = req.headers.authorization
    // const [algorithm, base64] = auth.split(' ')
    // const [user, pass] = Buffer.from(base64, 'base64').toString().split(':')
    // req.user = user
    // TODO: Fix this once authentication is figured out
    req.user = pathname.substr(pathname.lastIndexOf('/') + 1)

    // Route the request
    const { api, websocket } = INSTANCES.get(this)

    // Parse the path components in reverse order until a match is obtained
    let route = req.parsedUrl.pathname
    let routed = !!api[route]
    while (!routed && route.length > 0) {
      route = route.slice(0, route.lastIndexOf('/'))
      routed = !!api[route]
    }

    // If no route exists, then return 404 Not Found
    if (!routed) {
      socket.destroy(Error(`route "${req.parsedUrl.pathname}" not found!`))
      return
    }

    // Execute the request handler or return an appropriate error
    const handler = api[route]
    if (typeof handler.UPGRADE === 'function') {
      websocket.handleUpgrade(req, socket, head, ws => {
        ws.on('close', (code, reason) => {
          reason = reason.toString()
          this.info('ws.close', ws, { code, reason })
        })

        ws.user = req.user

        // Override send to handle serialization and websocket nuances
        ws._send = ws.send
        ws.send = obj => {
          return new Promise((resolve, reject) => {
            const buf = Buffer.from(JSON.stringify(obj))
            const opts = { binary: false }
            ws._send(buf, opts, err => {
              if (err != null) {
                this.error('ws.send', err, obj, ws)
                reject(err)
              } else {
                this.info('ws.send', obj, ws)
                resolve()
              }
            })
          })
        }

        ws.toJSON = function () {
          return { '@type': 'WebSocket', user: ws.user, route }
        }
        ws[Symbol.for('nodejs.util.inspect.custom')] = function () {
          return this.toJSON()
        }

        this.info('ws.open', ws)
        handler.UPGRADE(ws, this)
      })
    } else {
      socket.destroy(Error(`route ${route} does not support UPGRADE!`))
    }
  }

  /**
   * Handles serving API requests
   * @param {IncomingMessage} req The incoming HTTP request
   * @param {ServerResponse} res The outgoing HTTP response
   * @returns {Void}
   */
  _handleApi (req, res) {
    const opts = Object.assign({}, DEFAULT_HANDLER_OPTS, req.handler.opts)

    if (!opts.isUnauthenticated) {
      // Parse the client identifier and stash it for later use
      // The authorization header is "Basic <base-64 encoded username:password>"
      // We split out the username and stash it on req.user
      const auth = req.headers.authorization
      if (auth != null) {
        /* eslint-disable-next-line no-unused-vars */
        const [algorithm, base64] = auth.split(' ')
        /* eslint-disable-next-line no-unused-vars */
        const [user, pass] = Buffer.from(base64, 'base64').toString().split(':')
        req.user = user
      }
    }

    if (!opts.autoParse) {
      this.info('http.api', req)
      req.handler(req, res, this)
      return
    }

    // Collect the incoming HTTP body
    const chunks = []
    req
      .on('data', chunk => chunks.push(chunk))
      .once('end', () => {
        // Parse any incoming JSON object and stash it at req.json for later use
        const str = Buffer.concat(chunks).toString('utf8')

        if (str === '') {
          req.json = {}
        } else {
          try {
            req.json = JSON.parse(str)
          } catch (e) {
            const err = new Error(`unexpected non-JSON response ${str}`)
            res.send(err)
            this.error('http.api', err, req, res)
            return
          }
        }

        this.info('http.api', req)
        req.handler(req, res, this)
      })
  }

  /**
   * Handles serving static content
   * @param {IncomingMessage} req The incoming HTTP request
   * @param {ServerResponse} res The outgoing HTTP response
   * @returns {Void}
   */
  _handleStatic (req, res) {
    // ensure the asset to tbe served exists under the HTTP path
    const { root } = INSTANCES.get(this)
    if (root == null) {
      // 403 Forbidden
      res.statusCode = 403
      res.end()

      const err = Error('forbidden')
      this.error('http.static', err, req, res)

      return
    }

    const pathToAsset = normalize(join(root, req.parsedUrl.pathname))
    if (!pathToAsset.startsWith(root)) {
      // 403 Forbidden
      res.statusCode = 403
      res.end()

      const err = Error('forbidden')
      this.error('http.static', err, req, res)

      return
    }

    // recursive IIFE to serve the actual asset
    const that = this
    ;(function serveAsset (asset) {
      lstat(asset, (err, stat) => {
        if (err != null) {
          switch (err.code) {
            case 'EACCES':
            case 'EPERM': {
              // 401 Unauthorized
              res.statusCode = 401
              res.end()

              const err = Error('unauthorized')
              that.error('http.static', err, req, res)

              return
            }

            case 'EMFILE': {
              // 500 Internal Server Error
              // warning: reached max. fd limit!
              // please run "ulimit -n <limit>" to allow opening more files.
              res.statusCode = 500
              res.end()

              const err = Error('internal server error')
              that.error('http.static', err, req, res)

              return
            }

            case 'ENOENT':
            default: {
              // 404 Not Found
              res.statusCode = 404
              res.end()

              const err = Error('not found')
              that.error('http.static', err, req, res)

              return
            }
          }
        }

        // for directories, recursively serve up index.html
        if (stat.isDirectory()) {
          return serveAsset(join(asset, 'index.html'))
        }

        // symbolic links don't count as they can lead to paths outside of the
        // HTTP path
        if (!stat.isFile()) {
          // 404 Not Found
          res.statusCode = 404
          res.end()

          const err = Error('not found')
          that.error('http.static', err, req, res)

          return
        }

        // 200 OK
        res.statusCode = 200
        res.setHeader('content-type', mime.getType(asset))
        res.setHeader('content-length', stat.size)
        res.setHeader('content-encoding', 'identity')
        // This line fires too often during regular operation, adding noise to
        // logs. So we drop it to debug level.
        that.debug('http.static', req, res)

        const fsStream = createReadStream(asset, { flags: constants.O_NOFOLLOW })
          .once('error', err => res.destroyed || res.destroy(err))
          .pipe(res)
          .once('error', err => fsStream.destroyed || fsStream.destroy(err))
      })
    }(pathToAsset))
  }
}

/**
 * A wrapper to improve debugging
 * @extends {IncomingMessage}
 */
class IncomingMessage extends http.IncomingMessage {
  /**
   * Returns the current state of the instance
   * @type {String}
   */
  [Symbol.for('nodejs.util.inspect.custom')] () {
    return this.toJSON()
  }

  /**
   * The unique identifier of the client; returns the HTTP url of the client
   * @returns {String}
   */
  get clientId () {
    const address = this.socket.address()
    return `${address.address}:${address.port}`
  }

  /**
  * Returns the current state of the instance
  * @returns {Object}
  */
  toJSON () {
    const { method, url, headers, json, user } = this
    const obj = { '@type': 'HttpRequest', method, url, headers }
    if (json != null) obj.json = json
    if (user != null) obj.user = user
    return obj
  }
}

/**
 * A wrapper to improve debugging
 * @extends {ServerResponse}
 */
class ServerResponse extends http.ServerResponse {
  /**
   * Returns the current state of the instance
   * @type {String}
   */
  [Symbol.for('nodejs.util.inspect.custom')] () {
    return this.toJSON()
  }

  /**
  * Returns the current state of the instance
  * @returns {Object}
  */
  toJSON () {
    const { statusCode, json } = this
    const headers = Object.assign({}, this.getHeaders())
    const obj = { '@type': 'HttpResponse', statusCode, headers }
    if (json != null) obj.json = json
    return obj
  }

  /**
   * Sends the specified data to the socket and ends the response
   * @param {Error|Object} data The data to be sent
   * @returns {Void}
   */
  send (data) {
    if (this.headersSent) {
      const level = data instanceof Error ? 'error' : 'info'
      this[level]('http.api', data, this.req, this)
      return
    }

    this.json = data instanceof Error
      ? { message: data.message }
      : data
    this.statusCode = data instanceof Error ? 400 : 200

    const buf = JSON.stringify(this.json)
    this.setHeader('content-type', 'application/json')
    this.setHeader('content-length', Buffer.byteLength(buf))
    this.setHeader('content-encoding', 'identity')
    this.end(buf)
    this.socket.server.emit('log', 'info', 'http.api', this.req, this)
  }
}

/**
 * Builds a map of API endpoints
 *
 * Each endpoint maps to an object that holds one or more handlers. A handler is
 * a function or an object mapping HTTP methods to functions.
 * @example
 * {
 *   '/api/v1/orderbook': {
 *     PUT: function (req, res, server) { ... },
 *     GET: function (req, res, server) { ... },
 *     DELETE: function (req, res, server) { ... }
 *   },
 *   '/api/v1/marketdata': function (req, res, server) { ... }
 *   '/api/v1/btc': function (req, res, server) { ... }
 * }
 *
 * @param {String} path Path to the API directory
 * @returns {Object}
 */
function buildApi (path) {
  /**
   * Recursively reads and returns all files in the specified directory
   * @param {String} dir The directory to traverse
   * @returns {String[]}
   */
  function getEndpointPaths (dir) {
    const dirs = []
    const files = []
    const paths = readdirSync(dir).map(file => join(dir, file))

    for (const path of paths) {
      const stat = statSync(path)
      if (stat.isDirectory()) {
        dirs.push(path)
      } else if (stat.isFile() && extname(path) === '.js') {
        files.push(path)
      }
    }

    for (const dir of dirs) {
      files.push(...getEndpointPaths(dir))
    }

    return files
  }

  // Recursively read the specified path, generating an array of file paths:
  //
  // [
  //   ...
  //   '/fabriclabs/mono/js/portal/api/v1/bitcoin/index.js',
  //   '/fabriclabs/mono/js/portal/api/v1/ethereum/index.js',
  //   '/fabriclabs/mono/js/portal/api/v1/lightning/index.js',
  //   '/fabriclabs/mono/js/portal/api/v1/marketdata/index.js',
  //   '/fabriclabs/mono/js/portal/api/v1/orderbook/index.js',
  //   ...
  // ]
  //
  const paths = getEndpointPaths(path)
  const startIndex = dirname(path).length
  const endpoints = {}

  // `require` each of the paths, and map the imported function or map of HTTP
  // functions, to the endpoint, which would be rooted at the parent of the
  // specified path.
  for (const path of paths) {
    const handler = require(path)
    const subpath = path.substring(startIndex)
    const endpoint = basename(path) === 'index.js'
      ? dirname(subpath)
      : `${dirname(subpath)}/${basename(subpath, extname(subpath))}`

    endpoints[endpoint] = handler
  }

  return endpoints
}
