/**
 * @file Behavioral specification for the Ethereum network
 */

const Blockchain = require('../../../lib/blockchains/ethereum')
const config = require('../../../etc/config.dev')

describe('Blockchains - Ethereum', function () {
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
  const PROPS = CONFIG.blockchains.ethereum

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
      expect(instance.id).to.be.a('string').that.equals('ethereum')
    })
  })

  describe('operation', function () {
    before('construct instance', function () {
      instance = new Blockchain(SDK, PROPS)
    })

    it('must correctly connect to the blockchain', function () {
      const validate = blockchain => {
        expect(blockchain).to.be.an.instanceof(Blockchain)
        expect(blockchain.id).to.be.a('string').that.equals('ethereum')

        const json = blockchain.toJSON()
        expect(json['@type']).to.be.a('string').that.equals('Ethereum')
        expect(json.id).to.be.a('string').that.equals('ethereum')
        expect(json.wallet).to.be.a('string').that.matches(/^0x[a-fA-F0-9]{40}$/)
        expect(json.contract).to.be.a('object')
        expect(json.contract.address).to.be.a('string').that.matches(/^0x[a-fA-F0-9]{40}$/)
      }

      return instance
        .once('connect', validate)
        .connect()
        .then(validate)
    })

    it('must correctly disconnect from the blockchain', function () {
      const validate = blockchain => {
        expect(blockchain).to.be.an.instanceof(Blockchain)
        expect(blockchain.id).to.be.a('string').that.equals('ethereum')

        const json = blockchain.toJSON()
        expect(json['@type']).to.be.a('string').that.equals('Ethereum')
        expect(json.id).to.be.a('string').that.equals('ethereum')
        expect(json.wallet).to.be.a('string').that.matches(/^0x[a-fA-F0-9]{40}$/)
        expect(json.contract).to.be.a('object')
        expect(json.contract.address).to.be.a('string').that.matches(/^0x[a-fA-F0-9]{40}$/)
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
