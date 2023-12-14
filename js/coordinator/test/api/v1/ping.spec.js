/**
 * @file Specification for the Limit Orderbook
 */

/* eslint-disable no-unused-expressions */

describe('Ping', function () {
  it('must handle GET requests', async function () {
    const args = { method: 'GET', path: '/api/v1/ping' }
    const pong = await this.test.ctx.request(args)

    expect(pong).to.be.an('object')
    expect(pong['@type']).to.be.a('string').that.equals('Pong')
    expect(pong.now).to.be.a('number')
    expect(pong.skew).to.be.undefined
  })

  it('must handle POST requests sent without local-time', async function () {
    const args = { method: 'POST', path: '/api/v1/ping' }
    const data = {}
    const pong = await this.test.ctx.request(args, data)

    expect(pong).to.be.an('object')
    expect(pong['@type']).to.be.a('string').that.equals('Pong')
    expect(pong.now).to.be.a('number')
    expect(pong.skew).to.be.undefined
  })

  it('must handle POST requests sent without local-time', async function () {
    const args = { method: 'POST', path: '/api/v1/ping' }
    const data = { now: Date.now() }
    const pong = await this.test.ctx.request(args, data)

    expect(pong).to.be.an('object')
    expect(pong['@type']).to.be.a('string').that.equals('Pong')
    expect(pong.now).to.be.a('number')
    expect(pong.skew).to.be.a('number')
  })
})
