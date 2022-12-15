/**
 * @file Behavioral specification for interface to supported blockchain networks
 */

const { expect } = require('chai')
const Network = require('../../../lib/core/network')
const Networks = require('../../../lib/core/networks')

const SUPPORTED = [
  'goerli',
  'lightning',
  'sepolia'
]

describe('Networks', function () {
  const PROPS = {
    goerli: {
      abi: ['dummy_abi'],
      address: '0xfakeaddress',
      url: 'http://localhost:8545'
    }
  }

  describe('Instantiation', function () {
    it('must throw on instantiation without required arguments', function () {
      expect(() => new Networks()).to.throw()
      expect(() => new Networks({ unknown: 'foo' })).to.throw()
    })

    it('must correctly instantiate with specified networks', function () {
      let networks = null

      expect(() => { networks = new Networks(PROPS) }).to.not.throw()
      expect(networks).to.be.an.instanceof(Networks)
      /* eslint-disable-next-line no-unused-expressions */
      expect(networks).to.be.sealed
    })
  })

  describe('API', function () {
    let networks

    before(function () { networks = new Networks(PROPS) })

    after(function () { networks = null })

    // #[network]
    describe('.[network]', function () {
      for (const name in PROPS) {
        it(`must expose the ${name} network at networks.${name}`, function () {
          expect(name).to.be.a('string')
          expect(networks[name]).to.be.an.instanceof(Network)

          const network = networks[name]

          expect(network).to.respondTo('open')
          expect(() => network.open()).to.not.throw(/not implemented/)

          expect(network).to.respondTo('commit')
          expect(() => network.commit()).to.not.throw(/not implemented/)
        })
      }
    })

    describe('.byAssets', function () {
      it('must expose supported networks by assets', function () {
        expect(networks.byAssets).to.be.an.instanceof(Map)

        networks.byAssets.forEach((networks, asset) => {
          expect(networks).to.be.an.instanceof(Map)
          networks.forEach((network, name) => {
            expect(network).to.be.an.instanceof(Network)
            expect(network.assets).to.contain(asset)
          })
        })
      })
    })

    describe('.isSupported', function () {
      it('must correctly identify supported networks', function () {
        expect(networks.isSupported('goerli')).to.equal(true)
        expect(networks.isSupported('sepolia')).to.equal(true)
      })

      it('must correctly identify unsupported networks', function () {
        expect(networks.isSupported('ropsten')).to.equal(false)
      })
    })

    describe('.SUPPORTED', function () {
      it('must list all supported networks', function () {
        expect(networks.SUPPORTED).to.deep.equal(SUPPORTED)
      })
    })
  })
})
