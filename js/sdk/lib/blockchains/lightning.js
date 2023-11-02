/**
 * @file Interface to the Lightning network
 */

const { BaseClass } = require('@portaldefi/core')
const https = require('https')
const { URL } = require('url')
const WebSocket = require('ws')

/**
 * Holds private fields for instances of the class
 * @type {WeakMap}
 */
const INSTANCES = new WeakMap()

/**
 * Interface to the Lightning network
 * @type {Lightning}
 */
module.exports = class Lightning extends BaseClass {
  constructor (sdk, props) {
    super({ id: 'lightning' })

    INSTANCES.set(this, Object.seal({
      hostname: props.hostname,
      port: props.port,
      cert: props.cert,
      macaroons: {
        admin: props.admin,
        invoice: props.invoice
      },
      sockets: new Set(),
      wallet: null,
      json: {
        hostname: props.hostname,
        port: props.port,
        publicKey: null,
        cert: `${props.cert.substr(0, 6)}******`,
        admin: `${props.admin.substr(0, 6)}******`,
        invoice: `${props.invoice.substr(0, 6)}******`
      }
    }))

    Object.freeze(this)
  }

  /**
   * Returns the JSON representation of the swap
   * @returns {Object}
   */
  toJSON () {
    return Object.assign(super.toJSON(), INSTANCES.get(this).json)
  }

  /**
   * Initializes the network connections
   * @returns {Promise<Lightning>}
   */
  connect () {
    return new Promise((resolve, reject) => {
      this.info('connect', this)
      this.emit('connect', this)
      resolve(this)
    })
  }

  /**
   * Creates a HODL Invoice
   * @param {Party} party The party that will pay the invoice
   * @param {Number} party.quantity The number of tokens to be invoiced
   * @param {Swap} party.swap The parent swap of the party
   * @param {String} party.swap.secretHash The hash of the secret of the swap
   * @returns {Promise<String>} The BOLT-11 Payment Request
   */
  async createInvoice (party) {
    try {
      const invoice = await this._createHodlInvoice(party)
      this.info('createInvoice', invoice, this)
      return invoice
    } catch (err) {
      this.error('createInvoice', err, party, this)
      throw err
    }
  }

  /**
   * Pays a HODL Invoice
   * @param {Party} party The party that is paying the invoice
   * @param {Number} party.invoice The invoice to be paid
   * @returns {Promise<Void>}
   */
  async payInvoice (party) {
    try {
      // decode and validate the payment request
      const paymentRequest = await this._decodePaymentRequest(party)
      if (paymentRequest.id !== party.swap.secretHash) {
        const expected = party.swap.secretHash
        const actual = paymentRequest.id
        throw Error(`expected swap hash "${expected}"; got "${actual}"`)
      } else if (paymentRequest.swap.id !== party.swap.id) {
        const expected = party.swap.id
        const actual = paymentRequest.swap.id
        throw Error(`expected swap identifier "${expected}"; got "${actual}"`)
      } else if (paymentRequest.amount !== party.quantity) {
        const expected = party.quantity
        const actual = paymentRequest.amount
        throw Error(`expected swap quantity "${expected}"; got "${actual}"`)
      }

      // pay the invoice
      const receipt = await this._payViaPaymentRequest(party)
      this.info('payInvoice', receipt, party, this)
      return receipt
    } catch (err) {
      this.error('payInvoice', err, party, this)
      throw err
    }
  }

  /**
   * Settles the HODL invoice
   * @param {Party} party The party that is settling the invoice
   * @param {Number} party.invoice The invoice to be settled
   * @param {String} secret The secret to be revealed during settlement
   * @returns {Promise<Void>}
   */
  async settleInvoice (party, secret) {
    try {
      const receipt = await this._settleHodlInvoice(secret)
      this.info('settleInvoice', receipt, party, this)
      return receipt
    } catch (err) {
      this.error('settleInvoice', err, party, this)
      throw err
    }
  }

  /**
   * Gracefully disconnects from the network
   * @returns {Promise<Lightning>}
   */
  async disconnect () {
    const state = INSTANCES.get(this)

    for (const socket of state.sockets) {
      await socket.close()
    }

    this.info('disconnect', this)
    this.emit('disconnect', this)
    return this
  }

  /**
   * Creates a HODL invoice through the LND node
   * @param {Party} party The party that will pay the invoice
   * @returns {Promise<Invoice>}
   */
  async _createHodlInvoice (party) {
    const { swap, quantity } = party
    const { id, secretHash } = swap
    const args = {
      path: '/v2/invoices/hodl',
      method: 'POST',
      headers: {
        'Grpc-Metadata-macaroon': INSTANCES.get(this).macaroons.invoice
      }
    }
    const data = {
      memo: id,
      hash: Buffer.from(secretHash, 'hex').toString('base64'),
      value: quantity
    }
    const invoice = await this._request(args, data)

    const state = INSTANCES.get(this)
    const { hostname, port, sockets } = state
    const url = new URL(`wss://${hostname}:${port}/v2/invoices/subscribe/${data.hash}?method=GET`)
    const opts = {
      // TODO: Fix this for production use
      rejectUnauthorized: false,
      headers: { 'Grpc-Metadata-macaroon': INSTANCES.get(this).macaroons.invoice }
    }

    const ws = new WebSocket(url.toString(), opts)
      .on('open', () => sockets.add(ws))
      .on('close', (...args) => sockets.delete(ws))
      .on('error', err => {
        sockets.delete(ws)
        this.emit('error', err, this)
      })
      .on('message', buf => {
        let obj = null

        // parse the message
        try {
          obj = JSON.parse(buf)
        } catch (err) {
          this.error('invoice.error', err, this)
          return
        }

        this.debug('invoice', obj, this)
        if (obj.result == null) {
          this.error('invoice.error', obj, this)
          return
        }

        // generate an invoice from the update
        const invoice = {
          id: Buffer.from(obj.result.r_hash, 'base64').toString('hex'),
          ts: obj.result.creation_date * 1000,
          swap: { id: obj.result.memo },
          request: obj.result.payment_request,
          amount: Number(obj.result.value)
        }

        // process the invoice event
        switch (obj.result.state) {
          case 'OPEN':
            this.info('invoice.created', invoice, this)
            this.emit('invoice.created', invoice, this)
            break

          case 'ACCEPTED':
            this.info('invoice.paid', invoice, this)
            this.emit('invoice.paid', invoice, this)
            break

          case 'SETTLED':
            this.info('invoice.settled', invoice, this)
            this.emit('invoice.settled', invoice, this)
            break

          case 'CANCELLED':
            this.info('invoice.cancelled', invoice, this)
            this.emit('invoice.cancelled', invoice, this)
            break

          default:
            this.warn('invoice.unknown', obj.result, this)
        }
      })

    return {
      id: secretHash,
      swap: { id },
      request: invoice.payment_request,
      amount: quantity
    }
  }

  /**
   * Decodes the specified BOLT-11 payment request
   * @param {Party} party The party that is paying the invoice
   * @returns {Promise<Receipt>}
   */
  async _decodePaymentRequest (party) {
    const args = {
      path: `/v1/payreq/${party.invoice.request}`,
      method: 'GET',
      headers: {
        'Grpc-Metadata-macaroon': INSTANCES.get(this).macaroons.admin
      }
    }
    const result = await this._request(args)

    return {
      id: result.payment_hash,
      swap: { id: result.description },
      request: party.invoice.request,
      amount: Number(result.num_satoshis)
    }
  }

  /**
   * Pays a HODL invoice using the corresponding BOLT-11 payment request
   * @param {Party} party The party that is paying the invoice
   * @returns {Promise<Receipt>}
   */
  _payViaPaymentRequest (party) {
    return new Promise((resolve, reject) => {
      const state = INSTANCES.get(this)
      const { hostname, port, sockets, macaroons: { admin } } = state
      const url = `wss://${hostname}:${port}/v2/router/send?method=POST`
      const opts = {
        // TODO: Fix this for production use
        rejectUnauthorized: false,
        headers: { 'Grpc-Metadata-macaroon': admin }
      }

      const ws = new WebSocket(url, opts)
        .on('open', (...args) => {
          const req = {
            payment_request: party.invoice.request,
            timeout_seconds: 120
          }

          ws.send(JSON.stringify(req), err => {
            if (err != null) {
              this.error('payViaPaymentRequest', err, req, party, this)
              this.emit('error', err, req, party, this)
              reject(err)
            } else {
              this.info('payViaPaymentRequest', req, party, this)
              sockets.add(ws)
            }
          })
        })
        .on('error', err => {
          sockets.delete(ws)
          this.error('payViaPaymentRequest', err, party, this)
          this.emit('error', err, party, this)
          reject(err)
        })
        .on('close', () => sockets.delete(ws))
        .on('message', buf => {
          let obj = null

          // parse the message
          try {
            obj = JSON.parse(buf)
          } catch (err) {
            this.error('payViaPaymentRequest', err, party, this)
            this.emit('error', err, party, this)
            return reject(err)
          }

          // generate a payment from the update
          this.debug('payViaPaymentRequest', obj, party, this)
          const payment = {
            id: obj.result.payment_hash,
            swap: { id: party.swap.id },
            request: obj.result.payment_request,
            amount: Number(obj.result.value)
          }

          switch (obj.result.status) {
            case 'IN_FLIGHT':
              if (obj.result.htlcs && obj.result.htlcs.length) {
                resolve(payment)
              }
              break

            case 'SUCCEEDED':
              this.info('payViaPaymentRequest', obj, party, this)
              ws.close()
              break

            case 'FAILED':
              this.error('payViaPaymentRequest', obj, party, this)
              ws.close()
              break

            default:
              this.warn('payViaPaymentRequest', obj, party, this)
          }
        })
    })
  }

  /**
   * Settles a HODL invoice
   * @param {String} secret The secret to be revealed during settlement
   * @returns {Promise}
   */
  async _settleHodlInvoice (secret) {
    const args = {
      path: '/v2/invoices/settle',
      method: 'POST',
      headers: {
        'Grpc-Metadata-macaroon': INSTANCES.get(this).macaroons.invoice
      }
    }

    await this._request(args, {
      preimage: Buffer.from(secret, 'hex').toString('base64')
    })
  }

  _request (args, data) {
    return new Promise((resolve, reject) => {
      const { hostname, port } = INSTANCES.get(this)
      const req = https.request(Object.assign(args, {
        hostname,
        port,
        // TODO: Fix this for production use
        rejectUnauthorized: false
      }))

      req
        .once('abort', () => reject(new Error('aborted')))
        .once('error', err => reject(err))
        .once('response', res => {
          const chunks = []
          res
            .on('data', chunk => chunks.push(chunk))
            .once('error', err => reject(err))
            .once('end', () => {
              const str = Buffer.concat(chunks).toString('utf8')

              try {
                const obj = JSON.parse(str)

                if (res.statusCode === 200) {
                  resolve(obj)
                } else {
                  console.log('lightning.request.error', obj, str)
                  reject(new Error(obj.message))
                }
              } catch (err) {
                reject(new Error(`malformed JSON response "${str}"`))
              }
            })
        })

      if (data != null) {
        req.end(Buffer.from(JSON.stringify(data)))
      } else {
        req.end()
      }
    })
  }
}
