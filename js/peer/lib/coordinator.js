/**
 * @file A network client used to communicate with the coordinator
 */

const { BaseClass } = require('@portaldefi/core')
const http = require('http')
const WebSocket = require('ws')

/**
 * A network client used to communicate with the coordinator
 * @extends {BaseClass}
 */
module.exports = class Coordinator extends BaseClass {
  constructor (props, peer) {
    if (props == null) {
      throw Error('expected props to be provided!')
    } else if (props.id == null || typeof props.id !== 'string') {
      throw Error('expected props.id to be a string!')
    } else if (props.hostname != null && typeof props.hostname !== 'string') {
      throw Error('expected props.hostname to be a valid hostname/IP address!')
    } else if (props.port != null && typeof props.port !== 'number') {
      throw Error('expected props.port to be a number between 0 and 65535!')
    } else if (props.pathname == null || typeof props.pathname !== 'string') {
      throw Error('expected props.pathname to a valid path!')
    }

    super({ id: 'coordinator' })

    this.hostname = props.hostname
    this.port = props.port
    this.pathname = props.pathname

    this.peer = peer
    this.websockets = new Set()

    Object.freeze(this)
  }

  connect () {

  }

  proxyHttp (req, res) {
    return new Promise((resolve, reject) => {
      req.once('error', reject)
      res.once('error', reject)
      res.once('end', () => {
        this.info('proxyHttp.end', req, res, this)
        resolve()
      })

      try {
        const proxyReqOpts = {
          hostname: this.hostname,
          port: this.port,
          method: req.method,
          path: req.url,
          headers: req.headers
        }

        this.info('proxyHttp.start', req, proxyReqOpts, this)

        const proxyReq = http.request(proxyReqOpts)
          .once('abort', () => res.abort())
          .once('error', err => res.destroy(err))
          .once('response', proxyRes => {
            res.statusCode = proxyRes.statusCode
            for (const header in proxyRes.headers) {
              res.setHeader(header, proxyRes.headers[header])
            }

            proxyRes
              .once('error', err => res.destroyed || res.destroy(err))
              .pipe(res)
              .once('error', err => proxyRes.destroyed || proxyRes.destroy(err))
          })

        req
          .once('error', err => proxyReq.destroyed || proxyReq.destroy(err))
          .pipe(proxyReq)
          .once('error', err => req.destroyed || req.destroy(err))
      } catch (err) {
        this.error('proxyHttp', err, req, res, this)
        this.emit('error', err, req, res, this)
        reject(err)
      }
    })
  }

  proxyWebSocket (ws) {
    const { hostname, port, pathname } = this
    const url = `ws://${hostname}:${port}${pathname}/${ws.user}`
    const websocket = new WebSocket(url)

    return new Promise((resolve, reject) => websocket
      .once('error', reject)
      .once('open', () => {
        this.websockets.add(websocket)
        resolve()
      })
      .once('close', () => this.websockets.delete(websocket))
      .on('message', data => {
        let arg
        try {
          arg = JSON.parse(data)
        } catch (err) {
          arg = Object.assign(arg, err, { '@type': 'Error' })
        } finally {
          ws.send(arg)
        }
      }))
  }

  async disconnect () {
    const promises = []
    for (const websocket of this.websockets) {
      promises.push(websocket.close())
    }
    await Promise.all(promises)
    this.emit('disconnected')
  }
}
