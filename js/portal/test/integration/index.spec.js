/**
 * @file Client/Server Interface Specification
 */

const { expect } = require('chai')
const Client = require('../../lib/core/client')
const Server = require('../../lib/core/server')

before('Initialize client/server', function () {
  return new Server()
    .start()
    .then(instance => {
      const { hostname, port } = instance

      // For basic client/server tests
      const server = instance
      const client = new Client({ id: 'client', hostname, port })

<<<<<<< HEAD
      // For advanced multi-client test suites
      const create = id => {
        const credentials = require(`./${id}.json`)
        return new Client({ id, hostname, port, credentials })
      }
      const alice = create('alice')
      const bob = create('bob')
      // const carol = create('carol')


      // Object.assign(this, { alice, bob, carol, client, server })
      Object.assign(this, { alice, bob, client, server })

      return Promise.all([
        client.connect(),
        alice.connect(),
        bob.connect(),
        // carol.connect()
      ])
=======
      Object.assign(this, { client, server })

      return client.connect()
>>>>>>> master
    })
})

after('Destroy client/server', function () {
<<<<<<< HEAD
  // const { alice, bob, carol, client, server } = this.test.ctx
  const { alice, bob, client, server } = this.test.ctx

  return Promise.all([
    client.disconnect(),
    alice.disconnect(),
    bob.disconnect()
  ]).then(() => server.stop())
=======
  const { client, server } = this.test.ctx

  return client.disconnect()
    .then(() => server.stop())
>>>>>>> master
    .then(() => {
      this.test.ctx.alice = null
      this.test.ctx.bob = null
      this.test.ctx.client = null
      this.test.ctx.server = null
    })
})

describe('API Version 1', function () {
  /**
   * Ensures the client is connected and ready for the rest of the suite
   */
  it('must setup the client/server correctly for further testing', function () {
    expect(this.test.ctx.server.isListening).to.equal(true)
    expect(this.test.ctx.client.isConnected).to.equal(true)
  })
})
