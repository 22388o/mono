/**
 * @file Behavioral specification for a Asset
 */

const { expect } = require('chai')
<<<<<<< HEAD
const ctx = require('../../../lib/core/context')
const Networks = require('../../../lib/core/networks')
const Orderbooks = require('../../../lib/core/orderbooks')

describe('HttpContext', function () {
  it('must expose an interface to all supported networks', function () {
=======

describe('HttpContext', function () {
  it('must expose an interface to all supported networks', function () {
    const ctx = require('../../../lib/core/context')
    const Networks = require('../../../lib/core/networks')
>>>>>>> master
    expect(ctx.networks).to.be.an.instanceof(Networks)
  })

  it('must expose an interface to all supported assets', function () {
<<<<<<< HEAD
=======
    const ctx = require('../../../lib/core/context')
>>>>>>> master
    expect(ctx.assets).to.be.an('object')
  })

  it('must expose an interface to all supported orderbooks', function () {
<<<<<<< HEAD
=======
    const ctx = require('../../../lib/core/context')
    const Orderbooks = require('../../../lib/core/orderbooks')
>>>>>>> master
    expect(ctx.orderbooks).to.be.an.instanceof(Orderbooks)
  })
})
