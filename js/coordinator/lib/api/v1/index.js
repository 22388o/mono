/**
 * @file Handles a bidirectional websocket channel for each client
 */

/**
 * Handles a bidirectional websocket channel for each client
 * @param {WebSocket} ws The underlying websocket
 * @param {HttpServer} server The HTTP Server that received the request
 * @returns {Void}
 */
module.exports.UPGRADE = function (ws, server) {
  const onError = err => err != null && server.error(err)
  const onOrder = order => ws.send(order, onError)
  const onSwap = swap => swap.isParty({ id: ws.user }) && ws.send(swap)

  server.dex
    .on('error', onError)
    .on('created', onOrder)
    .on('opened', onOrder)
    .on('match', onOrder)
    .on('closed', onOrder)

  server.swaps
    .on('error', onError)
    .on('received', onSwap)
    .on('holder.invoice.sent', onSwap)
    .on('seeker.invoice.sent', onSwap)

  // unregister all event handlers when the websocket closes
  ws.once('close', () => {
    server.dex
      .off('error', onError)
      .off('created', onOrder)
      .off('opened', onOrder)
      .off('match', onOrder)
      .off('closed', onOrder)

    server.swaps
      .off('error', onError)
      .off('received', onSwap)
      .off('holder.invoice.sent', onSwap)
      .off('seeker.invoice.sent', onSwap)
  })
}
