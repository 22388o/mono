const fs = require('fs')
const { join } = require('path')
const propertiesReader = require('properties-reader')
const basename = join(__dirname, '../../../../../../')

const Playnet = module.exports

Playnet.normalize = function (props) {
    let newProps = props

    console.log('props.nodetype', props.nodetype)

    switch(props.nodetype) {
        case 'lnd':
            console.log('adaptor for playnet lnd')
            if ('cert-file' in props) {
                const certFile = props['cert-file']
                delete newProps['cert-file']

                const cert = fs.readFileSync(join(basename, certFile),'base64').toString()
                newProps['cert'] = cert
            }
            if ('admin-binary' in props) {
                const adminBinary = props['admin-binary']
                delete newProps['admin-binary']

                const admin = fs.readFileSync(join(basename, adminBinary),'base64').toString()
                console.log('admin: ', admin)
                newProps['admin'] = admin
            }
            if ('invoice-binary' in props) {
                const invoiceBinary = props['invoice-binary']
                delete newProps['invoice-binary']

                const invoice = fs.readFileSync(join(basename, invoiceBinary),'base64').toString()
                console.log('invoice: ', invoice)
                newProps['invoice'] = invoice
            }
            if ('bitcoin-lnd-conf' in props) {
                const bitcoinLndConf = props['bitcoin-lnd-conf']
                delete newProps['bitcoin-lnd-conf']
                const properties = propertiesReader(join(basename, bitcoinLndConf))

                const socket = properties.get('rpclisten')
                console.log('socket: ', socket)
                newProps['socket'] = socket.replace('127.0.0.1', 'localhost')
            }
            return newProps
            break
        case 'bitcoind':
            console.log('adaptor for playnet bitcoind')
            if ('bitcoin-conf' in props) {
                const bitcoinConf = props['bitcoin-conf']
                delete newProps['bitcoin-conf']
                const properties = propertiesReader(join(basename, bitcoinConf))


                const mode = properties.get('chain')
                console.log('mode: ', mode)
                newProps['mode'] = mode

                const rpcportOrNull = properties.get(`${mode}.rpcport`)
                const rpcport = rpcportOrNull != null ? rpcportOrNull : 8332
                console.log('rpcport: ', rpcport)
                newProps['rpcport'] = rpcport

            }
            if ('bitcoin-lnd-conf' in props) {
                    const bitcoinLndConf = props['bitcoin-lnd-conf']
                    delete newProps['bitcoin-lnd-conf']
                    const properties = propertiesReader(join(basename, bitcoinLndConf))

                    const rpcuser = properties.get('bitcoind.rpcuser')
                    console.log('rpcuser: ', rpcuser)
                    newProps['rpcuser'] = rpcuser

                    const rpcpassword = properties.get('bitcoind.rpcpass')
                    console.log('rpcpassword: ', rpcpassword)
                    newProps['rpcpassword'] = rpcpassword

            }
            return newProps
            break
        default:
            console.log('adaptor for playnet -- default case')
            return {}
    }
}