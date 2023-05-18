/**
 * @file Health check endpoints
 */

/**
 * A simple health check endpoint
 * @param {HttpRequest} req The incoming HTTP request
 * @param {HttpResponse} res The outgoing HTTP response
 * @returns {Void}
 */
module.exports = function (req, res) {
  res.send({ alive: true })
}
