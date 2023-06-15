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

  let secretHolderProps = Object.assign(req.json.secretHolderProps, { hash: swapHash })
  let secretSeekerProps = Object.assign(req.json.secretSeekerProps, { hash: swapHash })

  const swapType = req.json.swapType

  const holder = secretHolderProps.uid
  const seeker = secretSeekerProps.uid

  const holderTemplateProps = require(`../../../../config/${holder}.json`)
  const seekerTemplateProps = require(`../../../../config/${seeker}.json`)

  console.log(`secretHolderProps: ${JSON.stringify(secretHolderProps, null, 2)}`)
  console.log(`secretSeekerProps: ${JSON.stringify(secretSeekerProps, null, 2)}`)

  console.log(`seekerTemplateProps: ${JSON.stringify(seekerTemplateProps)}`)
  console.log(`holderTemplateProps: ${JSON.stringify(holderTemplateProps)}`)

  secretHolderProps = { ...secretHolderProps, ...holderTemplateProps }
  secretSeekerProps = { ...secretSeekerProps, ...seekerTemplateProps }

  console.log(`secretHolderProps: ${JSON.stringify(secretHolderProps, null, 2)}`)
  console.log(`secretSeekerProps: ${JSON.stringify(secretSeekerProps, null, 2)}`)

  ctx.swaps2.fromProps(swapType, secretHolderProps, secretSeekerProps)
    .then(swap => res.send({ swap, swapSecret }))
    .catch(err => res.send(err))
}
