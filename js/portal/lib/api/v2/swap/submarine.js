
/**
 * @file HTTP handler used to manage atomic swaps
 */

const HTTP_METHODS = module.exports

/**
 * Opens a swap in progress
 * @param {HttpRequest} req The incoming HTTP request
 * @param {HttpResponse} res The outgoing HTTP response
 * @param {HttpContext} ctx The HTTP request context
 * @returns {Void}
 */
HTTP_METHODS.PUT = function swapOpen (req, res, ctx) {
  const swap = req.json.swap
  const party = req.json.party // {id: req.user}
  const opts = req.json.opts

  // console.log(`swapOpen - swap: ${JSON.stringify(swap)}\n\n party: ${JSON.stringify(party)}\n\n opts: ${JSON.stringify(opts)}`)

  ctx.swaps2.open(swap, party, opts)
    .then(swap => {
      // console.log('swap returning: ', swap)
      res.send(swap)
    })
    .catch(err => {
      console.log('swap err returning: ', err)
      res.send(err)
    })
}
/**
 * Cancels to a swap in progress
 * @param {HttpRequest} req The incoming HTTP request
 * @param {HttpResponse} res The outgoing HTTP response
 * @param {HttpContext} ctx The HTTP request context
 * @returns {Void}
 */
HTTP_METHODS.POST = function swapCancel (req, res, ctx) {
  const swap = req.json.swap
  const party = req.json.party // { id: req.user }
  const opts = req.json.opts

  console.log('swapCommit api v2')
  ctx.swaps2.commit(swap, party, opts)
    .then(swap => res.send(swap))
    .catch(err => res.send(err))
}

/**
 * Aborts a swap in progress
 * @param {HttpRequest} req The incoming HTTP request
 * @param {HttpResponse} res The outgoing HTTP response
 * @param {HttpContext} ctx The HTTP request context
 * @returns {Void}
 */
HTTP_METHODS.DELETE = function swapAbort (req, res, ctx) {
  const swap = req.json.swap
  const party = req.json.party // { id: req.user }
  const opts = req.json.opts

  console.log('swapAbort api v2')
  ctx.swaps2.abort(swap, party, opts)
    .then(swap => res.send(swap))
    .catch(err => res.send(err))
}
