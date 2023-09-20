/**
 * @file Run the mocha tests in the browser
 */

import Sdk from '../index.js'
import config from '../etc/config.dev'

/**
 * A list of user accounts to setup in the testing environment.
 *
 * Each of these accounts would be available on `this.test.ctx` in the testing
 * environment.
 *
 * @type {Array}
 */
const USERS = ['alice', 'bob']

describe('Portal SDK', function () {
  before(async function () {
    await Promise.all(USERS.map(id => {
      const credentials = require(`../../portal/test/unit/${id}`)
      const props = Object.assign({}, config, {
        credentials,
        network: Object.assign({}, config.network, { id })
      })
      this[id] = new Sdk(props)
      return this[id].start()
    }))
  })

  require('./unit/orderbooks/limit.spec')

  after(async function () {
    await Promise.all(USERS.map(name => this.test.ctx[name].stop()))
  })
})
