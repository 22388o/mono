/**
 * @file Handles a bidirectional websocket channel for each client
 */

/**
 * Handles a bidirectional websocket channel for each client
 * @param {Websocket} ws The underlying websocket
 * @param {HttpContext} ctx The HTTP request context
 * @returns {Void}
 */
module.exports.UPGRADE = function (ws, ctx) {
  const onError = err => err != null && ctx.log.error(err)
  const onOrder = order => order.uid === ws.user && ws.send(order, onError)
  const onSwap = swap => swap.isParty({ id: ws.user }) && ws.send(swap)

  ctx.orderbooks
    .on('error', onError)
    .on('created', onOrder)
    .on('opened', onOrder)
    .on('closed', onOrder)

  ctx.swaps
    .on('error', onError)
    .on('received', onSwap)
    .on('holder.invoice.sent', onSwap)
    .on('seeker.invoice.sent', onSwap)

  ws
    .on('message', msg => {
      let obj = null

      try {
        obj = JSON.parse(msg)
      } catch (err) {
        ctx.log.error(err)
      }

      switch (obj['@type']) {
        case 'ping':
          return onPing(obj, ws, ctx)

        default:
          ctx.log.debug(obj)
      }
    })
    .on('close', () => {
      ctx.orderbooks
        .off('error', onError)
        .off('created', onOrder)
        .off('opened', onOrder)
        .off('closed', onOrder)

      ctx.swaps
        .off('error', onError)
        .off('received', onSwap)
        .off('holder.invoice.sent', onSwap)
        .off('seeker.invoice.sent', onSwap)
    })
}

/**
 * Responds to a ping
 * @param {Object} ping The ping sent by the clie nt
 * @param {Websocket} ws The underlying websocket
 * @param {HttpContext} ctx The HTTP request context
 * @returns {Void}
 */
function onPing (ping, ws, ctx) {
  const now = Date.now()
  const skew = now - ping.now
  ws.send({ '@type': 'pong', now, skew }, err => ctx.log.error(err))
}
