const fs = require('fs')
const propertiesReader = require('properties-reader')

const Playnet = module.exports

Playnet.normalize = function (props) {
    let newProps = props
    switch(props.nodeType) {
        case 'lnd':
            if ('cert-file' in props) {
                const certFile = props['cert-file']
                delete newProps['cert-file']

                const certFileString = fs.readFileSync(certFile, 'utf8').toString()
                const cert = certFileString.replace('-----BEGIN CERTIFICATE-----', '')
                    .replace('-----END CERTIFICATE-----', '')
                    .replace(/\s*/g, '')
                newProps['cert'] = cert
            }
            if ('admin-binary' in props) {
                const adminBinary = props['admin-binary']
                delete newProps['admin-binary']

                const admin = fs.readFileSync(adminBinary,'base64').toString()
                newProps['admin'] = admin
            }
            if ('invoice-binary' in props) {
                const invoiceBinary = props['invoice-binary']
                delete newProps['invoice-binary']

                const invoice = fs.readFileSync(invoiceBinary,'base64').toString()
                newProps['invoice'] = invoice
            }
            if ('bitcoin-lnd-conf' in props) {
                const bitcoinLndConf = props['bitcoin-lnd-conf']
                delete newProps['bitcoin-lnd-conf']
                const properties = propertiesReader(bitcoinLndConf)

                const socket = properties.get('rpclisten')
                newProps['socket'] = socket.replace('127.0.0.1', 'localhost')
            }
            return newProps
            break
        case 'bitcoind':
            if ('bitcoin-conf' in props) {
                const bitcoinConf = props['bitcoin-conf']
                delete newProps['bitcoin-conf']
                const properties = propertiesReader(bitcoinConf)


                const mode = properties.get('chain')
                newProps['mode'] = mode

                const rpcportOrNull = properties.get(`${mode}.rpcport`)
                const rpcport = rpcportOrNull != null ? rpcportOrNull : 8332
                newProps['rpcport'] = rpcport

            }
            if ('bitcoin-lnd-conf' in props) {
                    const bitcoinLndConf = props['bitcoin-lnd-conf']
                    delete newProps['bitcoin-lnd-conf']
                    const properties = propertiesReader(bitcoinLndConf)

                    const rpcuser = properties.get('bitcoin.rpcuser')
                    newProps['rpcuser'] = rpcuser

                    const rpcpassword = properties.get('bitcoin.rpcpassword')
                    newProps['rpcpassword'] = rpcpassword

            }
            return newProps
            break
        default:
            return {}
    }
}