/**
 * @file Catch-all proxy endpoint
 */

/**
 * A catch-all proxy endpoint used to proxy requests over to the network
 * @param {HttpRequest} req The incoming HTTP request
 * @param {HttpResponse} res The outgoing HTTP response
 * @param {HttpServer} server The HTTP Server that received the request
 * @returns {Void}
 */
const Handlers = module.exports = function (req, res, server) {
  server.network.proxy(req, res)
}
Handlers.opts = { autoParse: false }

/**
 * Handles a bidirectional websocket channel for each client
 * @param {Websocket} ws The underlying websocket
 * @param {HttpServer} server The HTTP Server handling the websocket
 * @returns {Void}
 */
Handlers.UPGRADE = function (ws, server) {
  const forward = event => [event, obj => ws.send(obj)]

  server.network
    // DEX events
    .on(...forward('order.created'))
    .on(...forward('order.opened'))
    .on(...forward('order.closed'))
    // Swap events
    .on(...forward('swap.received'))
    .on(...forward('swap.created'))
    .on(...forward('swap.holder.invoice.created'))
    .on(...forward('swap.holder.invoice.sent'))
    .on(...forward('swap.seeker.invoice.created'))
    .on(...forward('swap.seeker.invoice.sent'))
    .on(...forward('swap.holder.invoice.paid'))
    .on(...forward('swap.seeker.invoice.paid'))
    .on(...forward('swap.holder.invoice.settled'))
    .on(...forward('swap.seeker.invoice.settled'))
    // Misc. events
    .on(...forward('message'))
}
