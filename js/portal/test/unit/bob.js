/**
 * @file Credentials for Bob
 */

const { readFileSync } = require('fs')
const { basename, extname, join } = require('path')
const keythereum = require('keythereum')

const NAME = basename(__filename, extname(__filename))
const PATH_ROOT = process.env.PORTAL_ROOT

const PATH_GETH = join(PATH_ROOT, 'playnet', 'state', NAME, 'geth')
const GETH_KEYSTORE = JSON.parse(readFileSync(join(PATH_GETH, 'keystore.json')))

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
  arbitrum: {
    public: '0xfdc85236513f142E10FE350DdefD27D7d718100e',
    private: '753822b69430b2a372d8f9d8fc788e188a5bf3f04f3650f3d28384ae6a569e02'
  },
  ethereum: {
    public: `0x${GETH_KEYSTORE.address}`,
    private: keythereum.recover(NAME, GETH_KEYSTORE).toString('hex')
  },
  lightning: {
    socket: LND_CONF.rpclisten,
    cert: readFileSync(join(PATH_LND, 'tls.cert')).toString('base64'),
    admin: LND_ADMIN.toString('base64'),
    invoice: LND_INVOICE.toString('base64')
  }
}
