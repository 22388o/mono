/**
 * @file HTTP handler used to manage L2 channels
 */

const HTTP_METHODS = module.exports



/**
 * Gets the channel balance
 *
 * In the case of lightning LND, this gets the balance across channels for the given node.
 * @param {HttpRequest} req The incoming HTTP request
 * @param {HttpResponse} res The outgoing HTTP response
 * @param {HttpContext} ctx The HTTP request context
 * @returns {Void}
 */
HTTP_METHODS.POST = function getBalance (req, res, ctx) {
    const networks = req.json.opts

    ctx.channels.getBalance(networks)
        .then(balance => res.send(balance))
        .catch(err => res.send(err))
}
