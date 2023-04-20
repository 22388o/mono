/**
 * @file HTTP handler used to manage atomic swaps
 */
const HTTP_METHODS = module.exports
const { createHash, randomBytes } = require('crypto')
/**
 * Creates a submarine swap
 * @param {HttpRequest} req The incoming HTTP request
 * @param {HttpResponse} res The outgoing HTTP response
 * @param {HttpContext} ctx The HTTP request context
 * @returns {Object}
 */
HTTP_METHODS.POST = function swapCreate (req, res, ctx) {

  const randomSecret = () => randomBytes(32)
  const sha256 = buffer => createHash('sha256').update(buffer).digest('hex')
  const secret = randomSecret()
  const swapHash = sha256(secret)
  const swapSecret = secret.toString('hex')

  const holderSubmarineSwapProps = Object.assign(req.json.holderSubmarineSwapProps, {hash: swapHash})
  const seekerSubmarineSwapProps = Object.assign(req.json.seekerSubmarineSwapProps, {hash: swapHash})

  console.log(`holderSubmarineSwapProps: ${JSON.stringify(holderSubmarineSwapProps, null, 2)}`)
  console.log(`seekerSubmarineSwapProps: ${JSON.stringify(seekerSubmarineSwapProps, null, 2)}`)

  ctx.swaps2.fromProps("submarine", holderSubmarineSwapProps, seekerSubmarineSwapProps)
      .then(swap => res.send({swap: swap, swapSecret: swapSecret}))
      .catch(err => res.send(err))
}