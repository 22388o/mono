/**
 * @file Catch-all proxy endpoint
 */

/**
 * A catch-all proxy endpoint used to proxy requests over to the coordinator
 * @param {HttpRequest} req The incoming HTTP request
 * @param {HttpResponse} res The outgoing HTTP response
 * @param {HttpContext} ctx The HTTP request context
 * @returns {Void}
 */
const Handlers = module.exports = function (req, res, ctx) {
  ctx.coordinator.proxyHttp(req, res)
}
Handlers.opts = { autoParse: false }

/**
 * Handles a bidirectional websocket channel for each client
 * @param {Websocket} ws The underlying websocket
 * @param {HttpContext} ctx The HTTP request context
 * @returns {Void}
 */
Handlers.UPGRADE = function (ws, ctx) {
  ctx.coordinator.proxyWebSocket(ws)
}
Handlers.opts.UPGRADE = { autoParse: false }
