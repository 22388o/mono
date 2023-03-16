/**
 * @file HTTP handler used to create invoices
 */

const HTTP_METHODS = module.exports



/**
 * Creates an invoice
 *
 * In the case of lightning LND, this creates an invoice for the given node.
 * @param {HttpRequest} req The incoming HTTP request
 * @param {HttpResponse} res The outgoing HTTP response
 * @param {HttpContext} ctx The HTTP request context
 * @returns {Void}
 */
HTTP_METHODS.POST = function createInvoice (req, res, ctx) {
    // debug(`\nHTTP_METHODS.POST = function createInvoice req:  ${JSON.stringify(req)}`)
    const networks = req.json

    // ctx.invoice.createInvoice(networks)
    //     .then(invoice => res.send(invoice))
    //     .catch(err => res.send(err))

    const lndCreds = req.json.opts
    const paymentAmount = req.json.opts

    ctx.invoice.createInvoice(networks, lndCreds, paymentAmount)
        .then(invoice => res.send(invoice))
        .catch(err => res.send(err))
}
