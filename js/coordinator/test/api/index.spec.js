/**
 * @file Behavioral specification for the API
 */

const Coordinator = require('../..')
const http = require('http')

before('spin up the coordinator', async function () {
  this.coordinator = new Coordinator({ id: 'coordinator' })
  await this.coordinator.start()

  // http request method for use in API tests
  this.request = function request (args, data) {
    return new Promise((resolve, reject) => {
      const buf = (data && JSON.stringify(data)) || ''
      const opts = Object.assign({
        headers: Object.assign({}, args.headers, {
          /* eslint-disable quote-props */
          'accept': 'application/json',
          'accept-encoding': 'application/json',
          'authorization': `Basic ${Buffer.from('foo:foo').toString('base64')}`,
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(buf),
          'content-encoding': 'identity'
          /* eslint-enable quote-props */
        })
      }, args, {
        hostname: this.coordinator.hostname,
        port: this.coordinator.port
      })
      const req = http.request(opts)

      req
        .once('abort', () => reject(new Error('aborted')))
        .once('error', err => reject(err))
        .once('response', res => {
          const { statusCode } = res
          const contentType = res.headers['content-type']

          if (statusCode !== 200 && statusCode !== 400) {
            return reject(new Error(`unexpected status code ${statusCode}`))
          } else if (!contentType.startsWith('application/json')) {
            return reject(new Error(`unexpected content-type ${contentType}`))
          } else {
            const chunks = []
            res
              .on('data', chunk => chunks.push(chunk))
              .once('error', err => reject(err))
              .once('end', () => {
                const str = Buffer.concat(chunks).toString('utf8')
                let obj = null

                try {
                  obj = JSON.parse(str)
                } catch (err) {
                  return reject(new Error(`malformed JSON response "${str}"`))
                }

                statusCode === 200
                  ? resolve(obj)
                  : reject(new Error(obj.message))
              })
          }
        })
        .end(buf)
    })
  }
})

after('tear down the coordinator', async function () {
  this.request = null
  await this.test.ctx.coordinator.stop()
})
