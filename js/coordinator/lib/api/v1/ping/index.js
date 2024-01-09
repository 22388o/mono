/**
 * @file Responds to an incoming ping
 */

/**
 * Handles incoming ping requests
 * @type {Object}
 */
const Handlers = module.exports

/**
* Responds to an incoming ping
* @param {HttpRequest} req The incoming HTTP request
* @param {HttpResponse} res The outgoing HTTP response
* @param {HttpServer} server The HTTP Server that received the request
* @returns {Void}
*/
Handlers.GET = function (req, res, server) {
  const now = Date.now()
  res.send({ '@type': 'Pong', now })
}
Handlers.GET.opts = { isUnauthenticated: true }

/**
 * Responds to an incoming ping
 * @param {HttpRequest} req The incoming HTTP request
 * @param {HttpResponse} res The outgoing HTTP response
 * @param {HttpServer} server The HTTP Server that received the request
 * @returns {Void}
 */
Handlers.POST = function (req, res, server) {
  const ping = req.json
  const now = Date.now()
  const skew = now - ping.now
  res.send({ '@type': 'Pong', now, skew: isNaN(skew) ? undefined : skew })
}
Handlers.POST.opts = { isUnauthenticated: true }
