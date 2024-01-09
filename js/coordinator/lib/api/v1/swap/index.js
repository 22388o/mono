/**
 * @file HTTP handler used to manage atomic swaps
 */

const HTTP_METHODS = module.exports

/**
 * Handles swap updates from the parties
 * @param {HttpRequest} req The incoming HTTP request
 * @param {HttpResponse} res The outgoing HTTP response
 * @param {HttpServer} server The HTTP Server that received the request
 * @returns {Void}
 */
HTTP_METHODS.PATCH = function onSwap (req, res, server) {
  const { swap, opts } = req.json
  const party = { id: req.user }

  server.swaps.onSwap(swap, party, opts)
    .then(swap => res.send(swap))
    .catch(err => res.send(err))
}
