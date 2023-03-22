

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
    const party = {id: req.user}
    const opts = req.json.opts

    console.log(`swapOpen - swap: ${JSON.stringify(swap)}\n\n party: ${JSON.stringify(party)}\n\n opts: ${JSON.stringify(opts)}`)

    ctx.swaps.open(swap, party, opts)
        .then(swap => res.send(swap))
        .catch(err => res.send(err))
}
/**
 * Commits to a swap in progress
 * @param {HttpRequest} req The incoming HTTP request
 * @param {HttpResponse} res The outgoing HTTP response
 * @param {HttpContext} ctx The HTTP request context
 * @returns {Void}
 */
HTTP_METHODS.POST = function swapCommit (req, res, ctx) {
    const swap = req.json.swap
    const party = { id: req.user }
    const opts = req.json.opts

    ctx.swaps.commit(swap, party, opts)
        .then(swap => res.send(swap))
        .catch(err => res.send(err))
}