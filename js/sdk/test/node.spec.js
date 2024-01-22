/**
 * @file Behavioral specification for the SDK
 */

const { Sdk } = require('..')

describe('SDK - node.js', function () {
  describe('initialization', function () {
    it('must throw when initialized without required arguments', function () {
      expect(() => new Sdk()).to.throw('expected props to be provided!')
    })

    it('must not throw when initialized with required arguments', function () {
      let sdk = null

      expect(() => { sdk = new Sdk(sdkProps) }).to.not.throw()
      expect(sdk).to.be.an.instanceof(Sdk)
      expect(sdk.isConnected).to.be.a('boolean').that.equals(false)
    })
  })

  describe('operation', function () {
    let sdk = null

    before(async function () {
      sdk = new Sdk(sdkProps)
      await sdk.start()
    })

    after(async function () {
      await sdk.stop()
    })

    it('must be connected', function () {
      expect(sdk.isConnected).to.equal(true)
    })
  })
})
