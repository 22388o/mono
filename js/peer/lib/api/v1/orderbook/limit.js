/**
 * @file HTTP handler used to manage limit orders
 */

const { Order } = require('@portaldefi/core')

/**
 * Expose all supported HTTP methods for this endpoint
 * @type {Object}
 */
const HTTP_METHODS = module.exports

/**
 * Submits a new limit order
 * @param {HttpRequest} req The incoming HTTP request
 * @param {HttpResponse} res The outgoing HTTP response
 * @param {HttpContext} ctx The HTTP request context
 * @returns {Void}
 */
HTTP_METHODS.PUT = async function (req, res, ctx) {
  try {
    const order = Order.fromJSON(Object.assign({}, req.json, { type: 'limit' }))
    await ctx.store.put('orders', order.id, order)
    await ctx.network.submitLimitOrder(order)
  } catch (err) {
    return res.send(err)
  }
}

/**
 * Cancels a previously submitted limit order
 * @param {IncomingMessage} req The incoming HTTP request
 * @param {ServerResponse} res The outgoing HTTP response
 * @param {HttpContext} ctx The HTTP request context
 * @returns {Void}
 */
HTTP_METHODS.DELETE = async function (req, res, ctx) {
  try {
    const order = Order.fromJSON(Object.assign({}, req.json, { type: 'limit' }))
    await ctx.store.put('orders', order.id, order)
    await ctx.network.submitLimitOrder(order)
  } catch (err) {
    return res.send(err)
  }
}
