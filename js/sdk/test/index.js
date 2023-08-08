/**
 * @file Run the mocha tests in the browser
 */

import Sdk from '../index.js'
import config from '../etc/config.dev'

describe('Portal SDK', function () {
  let sdk = null

  before(async function () {
    sdk = new Sdk({ id: 'sdk', ...config.peer })
    await sdk.connect()
  })

  it('must be connected and ready for subsequent tests', function () {
    expect(sdk).to.be.an.instanceof(Sdk)
    expect(sdk.isConnected).to.equal(true)
  })

  after(async function () {
    await sdk.disconnect()
    sdk = null
  })
})
