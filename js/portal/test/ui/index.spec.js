/**
 * @file UI Specification
 */

const { compile, deploy } = require('../helpers')
const Server = require('../../lib/core/server')
const { expect } = require('chai')
const { writeFileSync } = require('fs')
const { Builder } = require('selenium-webdriver')
const Web3 = require('web3')

before('Setup Test Envirnonment', async function () {
  // Solidity Contract compilation deployment
  const web3 = new Web3(process.env.PORTAL_ETHEREUM_URL)
  const compiled = await compile()
  const contracts = await deploy(compiled, web3)
  writeFileSync(process.env.PORTAL_ETHEREUM_CONTRACTS, JSON.stringify(contracts))

  // Build UI web-app
  // See https://vitejs.dev/guide/api-javascript.html#build

  // Server
  const server = new Server({ root: '/path/to/ui/compiled/assets' })
    // .on('log', console.error)
  await server.start()

  // Selenium Test Driver
  const alice = await new Builder().forBrowser('chrome').build()
  const bob = await new Builder().forBrowser('chrome').build()

  // Stash the instances to the test context for use within tests
  Object.assign(this, { contracts, alice, bob, server, web3 })
})

after('Teardown Test Envirnonment', async function () {
  await this.test.ctx.alice.quit()
  this.test.ctx.alice = null

  await this.test.ctx.bob.quit()
  this.test.ctx.bob = null

  await this.test.ctx.server.stop()
  this.test.ctx.server = null

  this.test.ctx.contracts = null
  this.test.ctx.web3 = null
})

describe('Test Environment', function () {
  it('must compile web3 contracts', function () {
    expect(this.test.ctx.contracts).is.an('object')
    expect(this.test.ctx.web3).is.an.instanceof(Web3)
  })

  it('must setup the client/server correctly for further testing', function () {
    expect(this.test.ctx.server.isListening).to.equal(true)
  })

  it('must setup a browser session for alice', async function () {
    const { alice, server } = this.test.ctx
    await alice.get(server.url)
    expect(await alice.getTitle()).to.be.a('string').that.equals('localhost')
  })

  it('must setup a browser session for bob', async function () {
    const { bob, server } = this.test.ctx
    await bob.get(server.url)
    expect(await bob.getTitle()).to.be.a('string').that.equals('localhost')
  })
})
