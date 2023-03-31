/**
 * @file Credentials for Bob
 */

const { readFileSync } = require('fs')
const { basename, extname, join } = require('path')

const NAME = basename(__filename, extname(__filename))
const PATH_ROOT = process.env.PORTAL_ROOT
const PATH_LND = join(PATH_ROOT, 'playnet', 'state', NAME, 'lnd')
const PATH_LND_CONF = join(PATH_ROOT, 'playnet', `lnd.${NAME}.conf`)
const PATH_LND_MACAROONS = join(PATH_LND, 'data', 'chain', 'bitcoin', 'regtest')
const LND_ADMIN = readFileSync(join(PATH_LND_MACAROONS, 'admin.macaroon'))
const LND_INVOICE = readFileSync(join(PATH_LND_MACAROONS, 'invoice.macaroon'))
const LND_CONF = readFileSync(PATH_LND_CONF).toString('utf8')
  .split('\n')
  .filter(line => !!line)
  .map(line => line.split('='))
  .reduce((conf, [k, v]) => {
    if (v === 'true' || v === 'false') {
      conf[k] = Boolean(v)
    } else if (!isNaN(+v)) {
      conf[k] = +v
    } else {
      conf[k] = v
    }

    return conf
  }, {})

/**
 * Export the credentials for Bob
 * @type {Object}
 */
module.exports = {
  lightning: {
    socket: LND_CONF.rpclisten,
    cert: readFileSync(join(PATH_LND, 'tls.cert')).toString('base64'),
    admin: LND_ADMIN.toString('base64'),
    invoice: LND_INVOICE.toString('base64')
  },
  ethl2: {
    public: '0xD38099E977f17E39EC84b6d7807A6E0e81885144',
    private: 'c69bcf276bd8b53497150b793cf2661a078eb8ee3925ea534e943da27148f74f'
  }
}
