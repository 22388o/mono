/**
 * @file The Goerli blockchain network
 */

const Network = require('../core/network')
const Web3 = require('web3')
const Tx = require('ethereumjs-tx').Transaction
const Common = require('ethereumjs-common').default

/**
 * Exports a Web3 interface to the Goerli blockchain network
 * @type {Goerli}
 */
module.exports = class Goerli extends Network {
  constructor (props) {
    const assets = ['ETH']

    const client = new Web3(new Web3.providers.HttpProvider(props.url))
    client.chainId = props.chainId
    client.networkId = props.chainId
    client._keypair = props.keypair || {
      public: '0x67390a659D6CF99Ed2d58334CCA16a3f4857Bf63',
      private: 'f555a6db15824f6a6fc0b9dac93ad0e5bb38dee58256b026af73d94f0cfb9ff6'
    }

    super({ assets, client })

    this.contract = client.eth.contract(props.abi).at(props.address)
    this.contract._web3 = client

    Object.seal(this)
  }

  async open (party, opts) {
    if (party.isSecretSeeker) {
      throw Error('not implemented yet!')
    } else if (party.isSecretHolder) {
      // Save the invoice in the counterparty's state
      const invoice = party.counterparty.asset.symbol === 'ETH'
        ? await this._createInvoiceEth(party.counterparty.quantity)
        : await this._createInvoice(
          party.counterparty.asset.contractAddress,
          party.counterparty.quantity,
          party.counterparty.network.contract._web3.chainId
        )
      invoice.id = this._parseInvoiceId(invoice)
      party.counterparty.state.goerli = { invoice }

      return party
    } else {
      throw Error('multi-party swaps are not supported yet!')
    }
  }

  async commit (party, opts) {
    if (party.isSecretSeeker) {
      throw Error('not implemented yet!')
    } else if (party.isSecretHolder) {
      party.state.invoice = party.counterparty.asset.symbol === 'ETH'
        ? await this._payInvoiceEth(

        )
        : await this._payInvoice(

        )

      return party
    } else {
      throw Error('multi-party swaps are not supported yet!')
    }
  }

  _parseInvoiceId (invoice) {
    const hex = invoice.logs[0].data.substr(2, 64)
    const dec = parseInt(hex, 16)
    return dec.toString()
  }

  async _createInvoice (tokenAddress, tokenAmount) {
    return new Promise((resolve, reject) => {
      callSolidityFunctionByName(
        this.contract, 'createInvoice',
        [tokenAddress, tokenAmount, '0'],
        (err, res) => { if (err) { reject(err) } else { resolve(res) } }
      )
    })
  }

  async _createInvoiceEth (ethAmount) {
    return new Promise((resolve, reject) => {
      callSolidityFunctionByName(
        this.contract, 'createInvoice',
        ['0x0000000000000000000000000000000000000000', ethAmount, '0'],
        (err, res) => { if (err) { reject(err) } else { resolve(res) } }
      )
    })
  }

  async _payInvoice (invoiceId, hashOfSecret) {
    return new Promise((resolve, reject) => {
      callSolidityFunctionByName(
        this.contract, 'payInvoice',
        [invoiceId, hashOfSecret],
        (err, res) => { if (err) { reject(err) } else { resolve(res) } }
      )
    })
  }

  async _payInvoiceEth (invoiceId, hashOfSecret, ethAmount) {
    return new Promise((resolve, reject) => {
      callSolidityFunctionByName(
        this.contract, 'payInvoice',
        [invoiceId, hashOfSecret],
        (err, res) => { if (err) { reject(err) } else { resolve(res) } },
        ethAmount
      )
    })
  }
}

let prev_nonce = null

function callSolidityFunctionByName (web3Contract, funcName, funcParams, cb, ethValue, maxGasPayment) {
  const keys = web3Contract._web3._keypair
  const contract = web3Contract

  function contractTx (contract, data, cb, ethValue) {
    callSolidityFunction(
      contract._web3,
      contract.address,
      data,
      keys.public,
      keys.private,
      cb,
      ethValue
    )
  }

  const txMetadata = {
    from: keys.public,
    // gas: '500000',
    value: ethValue
  }

  const func = web3Contract[funcName]
  const getData = func.getData

  const paramsArray = funcParams
  paramsArray.push(txMetadata)

  console.log('FUNC NAME', funcName, 'FUNC PARAMS', paramsArray, 'FUNC', func)
  const calldata = getData.apply(func, paramsArray)

  // console.log("CALLDATA", calldata)
  console.log('ESTIMATING GAS AT ADDRESS', web3Contract.address)

  const web3 = web3Contract._web3

  web3.eth.estimateGas({
    from: keys.public,
    to: web3Contract.address,
    gas: '1000000',
    value: ethValue,
    data: calldata
  }, function (err, estimatedGas) {
    if (err) { console.log('GAS ESTIMATION ERROR', err); cb('GAS EST ERROR', null); return }

    console.log('ESTIMATED GAS', estimatedGas.toFixed())

    web3.eth.getGasPrice((err, price) => {
      if (err) { console.log(err) }

      const adjPrice = price.add(5000000000) // add 5gwei for safe measure
      // price = price.mul(2);
      console.log('NETWORK GAS PRICE', price)

      web3._gasPrice = adjPrice // new bn('3000000000')
      // web3.

      /* let gasPrice = web3Contract._web3._gasPrice;
        let gasPayment = gasPrice.mul(estimatedGas);
        console.log("GAS PAYMENT", gasPayment.div(1e18).toFixed(), "(MAX:", maxGasPayment ? maxGasPayment.div(1e18).toFixed() : '', ")");
        if( maxGasPayment && maxGasPayment.lt(gasPayment) ){ cb("GAS ESTIMATION ABOVE CUTOFF", null); return; } */

      callSolidityFunction(
        contract._web3,
        contract.address,
        calldata,
        keys.public,
        keys.private,
        cb,
        ethValue
      )
    })
  })
}

function callSolidityFunction (web3, address, data, public_key, private_key, cb, ethValue, wait_receipt = true, noop = false) {
  function send_tx (err, nonce) {
    if (err) { console.log(err) }

    prev_nonce = nonce

    console.log('TX COUNT', nonce)
    console.log('CHAIN ID', web3.chainId)
    console.log('NONCE', nonce)

    if (noop) {
      console.log('NOOP')
      prev_nonce = nonce - 1
      cb(nonce)
      return
    }

    const customCommon = Common.forCustomChain(
      'mainnet',
      {
        name: 'shyft',
        networkId: web3.networkId,
        chainId: web3.chainId
      },
      'petersburg'
    )

    const account = public_key
    const key = new Buffer(private_key, 'hex')

    // const gasPrice = web3.eth.gasPrice;
    // console.log("gas price", gasPrice)
    const gasPrice = web3._gasPrice

    console.log('using gas price', web3._gasPrice.toFixed())

    const gasPriceHex = web3.toHex(web3._gasPrice || 0) // gasPrice.mul(20);
    const gasLimitHex = web3.toHex(9500000)

    console.log('TO CONTRACT', address)

    const tra = {
      gasPrice: gasPriceHex,
      gasLimit: gasLimitHex,
      data,
      from: account,
      to: address,
      nonce,
      value: ethValue,
      chainId: web3.chainId // ropsten = 3, mainnet = 1
    }

    console.log('TRA', tra)

    // if(typeof data == "")
    console.log('TYPEOF DATA:', typeof data)
    console.log('DATA', data)
    if (typeof data === 'object') {
      tra.data = data.data ? data.data : null
      tra.value = data.value
      console.log('SENDING', data.value)
    }

    const tx = new Tx(tra, { common: customCommon })
    // console.log("signing using key", key)
    tx.sign(key)

    console.log('CHAINID', tx.getChainId())

    const stx = tx.serialize()
    web3.eth.sendRawTransaction('0x' + stx.toString('hex'), function (err, hash) {
      if (err) {
        if (cb) cb(err)
        console.log('[RAW TX ERROR]', err)
        return
      }
      console.log('tx: ' + hash)

      if (cb) {
        if (!wait_receipt) {
          cb(null, hash)
        } else {
          console.log('waiting for receipt ' + hash)
          function waitForReceipt () {
            // let hash = "0xb585bc5bb9b95c8b19a4bb62fbcbcfdbbf85045636ad2f07459bfd1401735965";
            web3.eth.getTransactionReceipt(hash, function (err, res) {
              console.log(hash + ' receipt', res)
              if (err) console.log(err)

              if (res) {
                if (cb) cb(err, res)
              } else {
                setTimeout(waitForReceipt, 10000)
              }
            })
          }

          waitForReceipt()
        }
      }
    })
  }

  if (prev_nonce === null) {
    console.log('getting nonce')
    web3.eth.getTransactionCount(public_key, send_tx)
  } else {
    console.log('known nonce', prev_nonce)
    send_tx(null, prev_nonce + 1)
  }
}
