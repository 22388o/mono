/**
 * @file Responds to an incoming ping
 */

/**
* Responds to an incoming ping
* @param {HttpRequest} req The incoming HTTP request
* @param {HttpResponse} res The outgoing HTTP response
* @param {HttpServer} server The HTTP Server that received the request
* @returns {Void}
*/
module.exports.GET = function (req, res, server) {
  const now = Date.now()
  res.send({ '@type': 'Pong', now })
}

/**
 * Responds to an incoming ping
 * @param {HttpRequest} req The incoming HTTP request
 * @param {HttpResponse} res The outgoing HTTP response
 * @param {HttpServer} server The HTTP Server that received the request
 * @returns {Void}
 */
module.exports.POST = function (req, res, server) {
  const ping = req.json
  const now = Date.now()
  const skew = now - ping.now
  res.send({ '@type': 'Pong', now, skew: skew || undefined })
}
