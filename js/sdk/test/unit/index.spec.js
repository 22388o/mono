/**
 * @file Behavioral specification for the Portal SDK
 */

const config = require('../../etc/config.dev')
const Sdk = require('../..')
const Peer = require('@portaldefi/peer')
const chai = require('chai')

// Make `expect` a global to avoid having to require/import it in the tests
let globalExpect = null

/**
 * A list of user accounts to setup in the testing environment.
 *
 * Each of these accounts would be available on `this.test.ctx` in the testing
 * environment.
 *
 * @type {Array}
 */
const USERS = ['alice', 'bob']
const isDebugEnabled = process.argv.includes('--debug')

before(async function () {
  // Make `expect` a global to avoid having to require/import it in the tests
  globalExpect = global.expect
  global.expect = chai.expect

  this.peer = await new Peer(config.network)
    .on('log', (...args) => isDebugEnabled
      ? console.log(...args)
      : function () {})
    .start()

  await Promise.all(USERS.map(id => {
    const credentials = require(`../../../portal/test/unit/${id}`)
    const props = Object.assign({}, config, {
      credentials,
      network: Object.assign({}, config.network, { id })
    })
    this[id] = new Sdk(props)
    return this[id].start()
  }))
})

after(async function () {
  await Promise.all(USERS.map(name => this.test.ctx[name].stop()))
  await this.test.ctx.peer.stop()

  global.expect = globalExpect
  globalExpect = null
})

describe('Portal SDK Test Environment', function () {
  it('must setup the peer', function () {
    expect(this.test.ctx.peer.isListening).to.equal(true)
  })

  it('must setup sdk instances for all users', function () {
    USERS.forEach(name => {
      expect(this.test.ctx[name].isConnected).to.equal(true)
    })
  })
})
