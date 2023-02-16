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
  const uid = ws.user
  const onError = err => err != null && ctx.log.error(err)
  const onOrder = event => order => {
    if (order.uid === uid) {
      ws.send(order, onError)
    }
  }

  ctx.orderbooks
    .on('error', onError)
    .on('created', onOrder('created'))
    .on('opened', onOrder('opened'))
    .on('closed', onOrder('closed'))
    .on('match', (makerOrder, takerOrder) => {
      if (makerOrder.uid !== uid && takerOrder.uid !== uid) return

      ctx.swaps.fromOrders(makerOrder, takerOrder)
        .then(swap => ws.send(swap))
        .catch(err => ws.send(Error(`swap creation failed: ${err.message}!`)))
    })

  ctx.swaps
    .on('error', onError)
    .on('opening', swap => swap.isParty({ id: uid }) && ws.send(swap))
    .on('opened', swap => swap.isParty({ id: uid }) && ws.send(swap))
    .on('committing', swap => swap.isParty({ id: uid }) && ws.send(swap))
    .on('committed', swap => swap.isParty({ id: uid }) && ws.send(swap))
}
