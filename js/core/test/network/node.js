/**
 * @file Behavioral specification for the network
 */

const Network = require('../../lib/network')
const { expect } = require('chai')

describe('target: node', function () {
  describe('instantiation', function () {
    it('must throw when instantiated without arguments', function () {
      expect(() => new Network()).to.throw('expected props.id to be a string!')
    })

    it('must correctly initialize with arguments', function () {
      let network = null

      expect(() => { network = new Network({ id: 'network' }) }).to.not.throw()
      expect(network).to.be.an.instanceof(Network)
      expect(network.id).to.be.a('string').that.equals('network')
      expect(network.hostname).to.be.a('string').that.equals('127.0.0.1')
      expect(network.port).to.be.a('number').that.equals(80)
      expect(network.pathname).to.be.a('string').that.equals('/api/v1/updates')
      expect(network.websocket).to.equal(null)
      expect(network.isConnected).to.equal(false)

      expect(network.toJSON()).to.deep.equal({
        '@type': 'Network',
        id: 'network',
        hostname: '127.0.0.1',
        port: 80,
        pathname: '/api/v1/updates'
      })
    })
  })

  describe('operation', function () {
    let network = null

    before(function () {
      const { hostname, port } = this.test.ctx.peer
      network = new Network({ id: 'network', hostname, port })
    })

    it('must connect to the peer', async function () {
      await network.connect()
      expect(network.isConnected).to.equal(true)
    })

    it('must make http request', async function () {
      const result = await network.request({ path: '/api/v1/alive' })
      expect(result).to.be.an('object')
      expect(result.alive).to.be.a('boolean').that.equals(true)
    })

    it('must send and receive messages over the websocket', function (done) {
      network
        .once('message', obj => {
          expect(obj).to.be.an('object')
          expect(obj['@type']).to.be.a('string').that.equals('pong')
          expect(obj.now).to.be.a('number')
          expect(obj.skew).to.be.a('number')
          done()
        })
        .send({ '@type': 'ping', now: Date.now() })
    })

    it('must disconnect from the peer', async function () {
      await network.disconnect()
      expect(network.isConnected).to.equal(false)
    })

    after(function () {
      network = null
    })
  })

  describe('error-handling', function () {
    // TODO: add error-handling tests
  })
})
