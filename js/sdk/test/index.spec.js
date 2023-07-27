/**
 * @file Behavioral specification for the Portal SDK
 */

const Server = require('@portaldefi/peer')
const { expect } = require('chai')
const Sdk = require('..')

describe('CommonJS Module', function () {
  let sdk = null
  let server = null

  /**
   * Instantiate a Server and a Client for this section of the test suite
   * @returns {Promise} Resolves when the client/server are ready for use
   */
  before(async function () {
    server = new Server()
    await server.start()

    sdk = new Sdk({ id: 'sdk', hostname: server.hostanme, port: server.port })
    await sdk.connect()
  })

  it('must be connected and ready for subsequent tests', function () {
    expect(sdk).to.be.an.instanceof(Sdk)
    expect(sdk.isConnected).to.equal(true)
  })

  /**
   * Stop the client/server instances at the end of the test suite
   * @returns {Promise} Resolves once the server has stopped
   */
  after(async function () {
    await sdk.disconnect()
    sdk = null

    await server.stop()
    server = null
  })
})
