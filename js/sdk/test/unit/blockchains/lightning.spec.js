/**
 * @file Behavioral specification for the Lightning network
 */

const Blockchain = require('../../../lib/blockchains/lightning')
const config = require('../../../etc/config.dev')

describe('Blockchains - Lightning', function () {
  const id = 'alice'
  const { blockchains } = config
  const creds = require(`../../../../portal/test/unit/${id}`)
  const CONFIG = Object.assign({ id }, config, {
    blockchains: Object.assign({}, blockchains, {
      ethereum: Object.assign({}, blockchains.ethereum, creds.ethereum),
      lightning: Object.assign({}, blockchains.lightning, creds.lightning)
    })
  })
  const SDK = {}
  const PROPS = CONFIG.blockchains.lightning

  let instance = null

  describe('instantiation', function () {
    it('must throw when instantiated without required arguments', function () {
      expect(() => { instance = new Blockchain() }).to.throw()
    })

    it('must not throw when instantiated with required arguments', function () {
      const createInstance = () => {
        instance = new Blockchain(SDK, PROPS)
      }

      expect(createInstance).to.not.throw()
      expect(instance).to.be.an.instanceof(Blockchain)
      expect(instance.id).to.be.a('string').that.equals('lightning')
    })
  })

  describe('operation', function () {
    before('construct instance', function () {
      instance = new Blockchain(SDK, PROPS)
    })

    it('must correctly connect to the blockchain', function () {
      const validate = blockchain => {
        expect(blockchain).to.be.an.instanceof(Blockchain)
        expect(blockchain.id).to.be.a('string').that.equals('lightning')
        expect(blockchain.hostname).to.be.a('string').that.equals('127.0.0.1')
        expect(blockchain.port).to.be.a('number').that.equals(11001)
        // expect(blockchain.publicKey).to.be.a('string').that.equals(null)

        const json = blockchain.toJSON()
        expect(json['@type']).to.be.a('string').that.equals('Lightning')
        expect(json.id).to.be.a('string').that.equals('lightning')
        expect(json.hostname).to.be.a('string').that.equals('127.0.0.1')
        expect(json.port).to.be.a('number').that.equals(11001)
      }

      return instance
        .once('connect', validate)
        .connect()
        .then(validate)
    })

    it('must correctly disconnect from the blockchain', function () {
      const validate = blockchain => {
        expect(blockchain).to.be.an.instanceof(Blockchain)
        expect(blockchain.id).to.be.a('string').that.equals('lightning')
        expect(blockchain.hostname).to.be.a('string').that.equals('127.0.0.1')
        expect(blockchain.port).to.be.a('number').that.equals(11001)
        // expect(blockchain.publicKey).to.be.a('string').that.equals(null)

        const json = blockchain.toJSON()
        expect(json['@type']).to.be.a('string').that.equals('Lightning')
        expect(json.id).to.be.a('string').that.equals('lightning')
        expect(json.hostname).to.be.a('string').that.equals('127.0.0.1')
        expect(json.port).to.be.a('number').that.equals(11001)
      }

      return instance
        .once('disconnect', validate)
        .disconnect()
        .then(validate)
    })

    after('destroy instance', function () {
      instance = null
    })
  })

  describe('error-handling', function () {

  })
})
