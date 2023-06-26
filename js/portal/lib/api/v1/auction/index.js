/**
 * @file HTTP handler used to manage auctions
 */

const HTTP_METHODS = module.exports

/**
 * Creates a new auction
 * @param {HttpRequest} req The incoming HTTP request
 * @param {HttpResponse} res The outgoing HTTP response
 * @param {HttpContext} ctx The HTTP request context
 * @returns {Void}
 */
HTTP_METHODS.PUT = async function (req, res, ctx) {
  const obj = Object.assign({}, req.json, {
    ts: Date.now(),
    uid: req.user
  })

  ctx.auctions.create(obj)
    .then(auction => res.send(auction))
    .catch(err => res.send(err))
}

/**
 * Retrieves the details of an auction
 * @param {HttpRequest} req The incoming HTTP request
 * @param {HttpResponse} res The outgoing HTTP response
 * @param {HttpContext} ctx The HTTP request context
 * @returns {Void}
 */
HTTP_METHODS.GET = function (req, res, ctx) {
  const obj = Object.assign({}, req.json, {
    uid: req.user
  })

  ctx.auctions.retrieve(obj)
    .then(auction => res.send(auction))
    .catch(err => res.send(err))
}

/**
 * Cancels an ongoing auction
 * @param {IncomingMessage} req The incoming HTTP request
 * @param {ServerResponse} res The outgoing HTTP response
 * @param {HttpContext} ctx The HTTP request context
 * @returns {Void}
 */
HTTP_METHODS.DELETE = function (req, res, ctx) {
  const obj = Object.assign({}, req.json, {
    uid: req.user
  })

  ctx.auctions.cancel(obj)
    .then(auction => res.send(auction))
    .catch(err => res.send(err))
}

/**
 * Posts a new bid to an ongoing auction
 * @param {HttpRequest} req The incoming HTTP request
 * @param {HttpResponse} res The outgoing HTTP response
 * @param {HttpContext} ctx The HTTP request context
 * @returns {Void}
 */
HTTP_METHODS.POST = function (req, res, ctx) {
  const bid = Object.assign({}, req.json, {
    ts: Date.now(),
    uid: req.user
  })

  ctx.auctions.bid(bid)
    .then(auction => res.send(auction))
    .catch(err => res.send(err))
}
