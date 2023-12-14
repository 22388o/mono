/**
 * @file Responds to an incoming ping
 */

/**
* Responds to an incoming ping
* @param {HttpRequest} req The incoming HTTP request
* @param {HttpResponse} res The outgoing HTTP response
* @param {HttpContext} ctx The HTTP request context
* @returns {Void}
*/
module.exports.GET = function (req, res, ctx) {
  const now = Date.now()
  res.send({ '@type': 'Pong', now })
}

/**
 * Responds to an incoming ping
 * @param {HttpRequest} req The incoming HTTP request
 * @param {HttpResponse} res The outgoing HTTP response
 * @param {HttpContext} ctx The HTTP request context
 * @returns {Void}
 */
module.exports.POST = function (req, res, ctx) {
  const ping = req.json
  const now = Date.now()
  const skew = now - ping.now
  res.send({ '@type': 'Pong', now, skew: skew || undefined })
}
