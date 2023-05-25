/**
 * @file Proxies requests over to bitcoind
 */

const http = require('http')
const { URL } = require('url')

const URL_BITCOIN = new URL(process.env.PORTAL_BITCOIN_URL)
const OPTS = {
  hostname: URL_BITCOIN.hostname,
  port: URL_BITCOIN.port,
  protocol: URL_BITCOIN.protocol
}

/**
 * Proxies bitcoind RPC requests to the Portal bitcoind daemon
 * @param {HttpRequest} req The incoming HTTP request
 * @param {HttpResponse} res The outgoing HTTP response
 * @returns {Void}
 */
module.exports = function (req, res, ctx) {
  const opts = Object.assign({
    method: req.method,
    headers: {
      /* eslint-disable quote-props,dot-notation */
      'Authorization': req.headers['authorization'],
      'Content-Type': req.headers['content-type']
      /* eslint-enable */
    }
  }, OPTS)

  http.request(opts)
    .once('error', err => res.destroyed || res.destroy(err))
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
    .end(JSON.stringify(req.json))
}
