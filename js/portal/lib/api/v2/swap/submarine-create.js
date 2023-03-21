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

  // {
  //   holderSubmarineSwapProps: {
  //     uid: 'uid1',
  //         hash: swapHash,
  //         party: 'secretHolder',
  //         quantity: 50000,
  //         asset: 'BTC'
  //   },
  //   seekerSubmarineSwapProps: {
  //     uid: 'uid0',
  //         hash: null,
  //         party: 'secretSeeker',
  //         quantity: 50000,
  //         asset: 'BTC'
  //   }
  // }

  const holderSubmarineSwapProps = Object.assign(req.json.holderSubmarineSwapProps, {hash: swapHash})
  const seekerSubmarineSwapProps = req.json.seekerSubmarineSwapProps

  console.log(`holderSubmarineSwapProps: ${JSON.stringify(holderSubmarineSwapProps)}`)
  console.log(`seekerSubmarineSwapProps: ${JSON.stringify(seekerSubmarineSwapProps)}`)

  // ctx.swaps.fromProps("submarine", holderSubmarineSwapProps, seekerSubmarineSwapProps)
  //     .then(swap => res.send({swap: swap, swapSecret: swapSecret}))
  //     .catch(err => res.send(err))

  const swap = {
    swap: {
      id: 'swap0',
      secretHolder: {
        id: holderSubmarineSwapProps.uid
      },
      secretSeeker: {
        id: seekerSubmarineSwapProps.uid
      },
      secretHash: holderSubmarineSwapProps.hash
    },
    swapSecret: swapSecret
  }
  return res.send(swap)
}