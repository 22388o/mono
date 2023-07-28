/**
 * @file Testing environment for the app
 */

const { Parcel } = require('@parcel/core')
const Peer = require('@portaldefi/peer')
const { expect } = require('chai')
const { join } = require('path')

/**
 * Logging helper for when it is needed
 * @type {Function}
 */
const log = process.argv.includes('--debug')
  ? console.error
  : function () {}

before(async function () {
  const bundler = new Parcel({
    entries: join(__dirname, '..', 'src', 'index.html'),
    defaultConfig: '@parcel/config-default'
  })
  const { bundleGraph, buildTime } = await bundler.run()
  const bundles = bundleGraph.getBundles()
  console.log(`✨ Built ${bundles.length} bundles in ${buildTime}ms!`)

  this.peer = new Peer({ root: join(__dirname, '..', 'dist') })
  this.peer.on('log', log)
  await this.peer.start()
})

after(function () {
  return this.test.ctx.peer.stop()
})

describe('Test Environment', function () {
  it('must have a peer running and ready for testing', function () {
    expect(this.test.ctx.peer.isListening).to.equal(true)
  })
})
