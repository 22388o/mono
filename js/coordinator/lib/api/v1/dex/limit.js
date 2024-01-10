/**
 * @file HTTP handler used to manage limit orders
 */

const HTTP_METHODS = module.exports

/**
 * Submits a new limit order for addition into the Orderbook
 * @param {HttpRequest} req The incoming HTTP request
 * @param {HttpResponse} res The outgoing HTTP response
 * @param {HttpServer} server The HTTP Server that received the request
 * @returns {Void}
 */
HTTP_METHODS.PUT = function (req, res, server) {
  const order = Object.assign({}, req.json, { type: 'limit', uid: req.user })
  server.dex.add(order)
    .then(order => res.send(order))
    .catch(err => res.send(err))
}

/**
 * Deletes an existing limit order from the Orderbook
 * @param {HttpRequest} req The incoming HTTP request
 * @param {HttpResponse} res The outgoing HTTP response
 * @param {HttpServer} server The HTTP Server that received the request
 * @returns {Void}
 */
HTTP_METHODS.DELETE = function (req, res, server) {
  const order = Object.assign({}, req.json, { type: 'limit', uid: req.user })
  server.dex.cancel(order)
    .then(order => res.send(order))
    .catch(err => res.send(err))
}
