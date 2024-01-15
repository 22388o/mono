/**
 * @file Behavioral testing environment for the network
 */

/* eslint-disable no-unused-expressions */

const { Client, Server } = require('../..')
const { expect } = require('chai')
const { basename, join } = require('path')

const SERVER_PROPS = {
  id: 'server',
  api: join(__dirname, 'api')
}

const CLIENT_PROPS = {
  id: 'client',
  uid: 'alice',
  pathname: `/${basename(SERVER_PROPS.api)}`
}

describe('Server', function () {
  const ENDPOINTS = [
    '/api/echo',
    '/api/http_methods',
    '/api'
  ]

  let server

  it('must instantiate a server correctly', function () {
    expect(() => { server = new Server(SERVER_PROPS) }).to.not.throw()
    expect(server).to.be.an.instanceof(Server)
    expect(server.id).to.be.a('string').that.equals('server')
    expect(server.hostname).to.be.a('string').that.equals('127.0.0.1')
    expect(server.port).to.be.a('number').that.equals(0)
    expect(server.endpoints).to.be.an('array').that.deep.equal(ENDPOINTS)
  })

  it('must start the server correctly', async function () {
    let isListening = server.isListening
    const val = await server
      .once('start', instance => {
        expect(instance).to.be.an.instanceof(Server)
        expect(instance.isListening).to.be.true
        isListening = instance.isListening
      })
      .start()

    expect(val).to.be.an.instanceof(Server)
    expect(val.isListening).to.equal(isListening)
    expect(val.endpoints).to.be.an('array').that.deep.equals(ENDPOINTS)
  })

  it('must stop the server correctly', async function () {
    let isListening = server.isListening
    const val = await server
      .once('stop', instance => {
        expect(instance).to.be.an.instanceof(Server)
        expect(instance.isListening).to.be.false
        isListening = instance.isListening
      })
      .stop()

    expect(val).to.be.an.instanceof(Server)
    expect(val.isListening).to.equal(isListening)
  })
})

describe('Client - node.js', function () {
  let server = null
  let client = null

  before('instantiate a server', async function () {
    server = new Server(SERVER_PROPS)
    await server.start()

    const { hostname, port } = server
    Object.assign(CLIENT_PROPS, { hostname, port })
  })

  after('teardown the server', async function () {
    await server.stop()
    server = null
  })

  it('must instantiate a client correctly', function () {
    expect(() => { client = new Client(CLIENT_PROPS) }).to.not.throw()
    expect(client).to.be.an.instanceof(Client)
    expect(client.isConnected).to.be.false
  })

  it('must enable the client to connect to the server', async function () {
    let isConnected = false
    await client
      .once('connected', instance => {
        expect(instance).to.be.an.instanceof(Client)
        expect(instance.isConnected).to.be.true
        isConnected = true
      })
      .connect()

    expect(client.isConnected).to.equal(isConnected)
  })

  for (const method of ['GET', 'POST']) {
    it(`must correctly route ${method} requests`, async function () {
      const args = { method, path: '/api/http_methods' }
      const data = { foo: 'bar', bar: 'baz' }
      const json = await client.request(args, data)

      expect(json).to.be.an('object').that.deep.equals({ method, json: data })
    })
  }

  it('must return 404 for unknown/unexpected endpoints', function () {
    const args = { method: 'GET', path: '/api/unknown/endpoint' }
    return client.request(args)
      .then(json => { throw new Error('unexpected success!') })
      .catch(err => {
        expect(err).to.be.an.instanceof(Error)
        expect(err.message).to.be.a('string')
        expect(err.message).to.equal('unexpected status code 404')
      })
  })

  it('must return 405 for unknown/unexpected HTTP methods', function () {
    const args = { method: 'PUT', path: '/api/http_methods' }
    return client.request(args)
      .then(json => { throw new Error('unexpected success!') })
      .catch(err => {
        expect(err).to.be.an.instanceof(Error)
        expect(err.message).to.be.a('string')
        expect(err.message).to.equal('unexpected status code 405')
      })
  })

  it('must send/receive JSON data over HTTP', function () {
    const args = { method: 'GET', path: '/api/echo' }
    const data = { foo: 'bar', bar: 'baz' }
    return client.request(args, data)
      .then(json => expect(json).to.be.an('object').that.deep.equals(data))
  })

  it('must pass messages between the server and the client', function (done) {
    const obj = { foo: 'bar' }

    client
      .once('message', data => {
        expect(data).to.be.an('object').that.deep.equals(obj)
        done()
      })
      .send(obj)
  })

  it('must stop the client correctly', async function () {
    let isConnected = client.isConnected
    const returnValue = await client
      .on('disconnected', instance => {
        expect(instance).to.be.an.instanceof(Client)
        expect(instance.isConnected).to.be.false
        isConnected = instance.isConnected
      })
      .disconnect()

    expect(returnValue).to.be.an.instanceof(Client)
    expect(returnValue.isConnected).to.equal(isConnected)
  })
})
