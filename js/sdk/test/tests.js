/**
 * @file Behavioral specification for the SDK
 */

const { Network, Store } = require('@portaldefi/core')
const { Sdk } = require('../lib')
const { Dex } = require('../lib/dex')
const { Swaps } = require('../lib/swaps')

describe('initialization', function () {
  it('must throw when initialized without required arguments', function () {
    expect(() => new Sdk()).to.throw('expected props to be provided!')
  })

  it('must not throw when initialized with required arguments', function () {
    const props = this.test.ctx.peer
    let sdk = null

    expect(() => { sdk = new Sdk(props) }).to.not.throw()
    expect(sdk).to.be.an.instanceof(Sdk)
    expect(sdk.network).to.be.an.instanceof(Network)
    expect(sdk.store).to.be.an.instanceof(Store)

    expect(sdk.dex).to.be.an.instanceof(Dex)
    expect(sdk.swaps).to.be.an.instanceof(Swaps)

    expect(sdk.isConnected).to.be.a('boolean').that.equals(false)
  })
})

describe('operation', function () {
  let sdk = null

  before(async function () {
    sdk = new Sdk(this.test.ctx.peer)
    await sdk.start()
  })

  after(async function () {
    await sdk.stop()
  })

  it('must be connected', function () {
    expect(sdk.isConnected).to.equal(true)
  })
})
