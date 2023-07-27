/**
 * @file Testing environment for the app
 */

const Peer = require('@portaldefi/peer')
const { expect } = require('chai')

/**
 * Logging helper for when it is needed
 * @type {Function}
 */
const log = process.argv.includes('--debug')
  ? console.error
  : function () {}

before(function () {
  this.peer = new Peer()
  this.peer.on('log', log)
  return this.peer.start()
})

after(function () {
  return this.test.ctx.peer.stop()
})

describe('Test Environment', function () {
  it('must have a peer running and ready for testing', function () {
    expect(this.test.ctx.peer.isListening).to.equal(true)
  })
})
