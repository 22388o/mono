/**
 * @file Behavioural specification for a BTC-ETH swap using the App
 */

describe.only('App: Swap: BTC-ETH', function () {
  it.only('must allow Alice to place an order', function (done) {
    this.test.ctx.playnet.apps.alice
      .on('activity', (...args) => {
        console.log('noticed alice activity', ...args)
        done()
      })
      .submitLimitOrder({
        baseAsset: 'BTC',
        baseQuantity: 10000,
        quoteAsset: 'ETH',
        quoteQuantity: 100000
      })
  })

  it('must allow Bob to place an order', async function (done) {
    this.test.ctx.playnet.apps.bob
      .on('activity', (...args) => {
        console.log('noticed bob activity', ...args)
        done()
      })
      .submitLimitOrder({
        baseAsset: 'ETH',
        baseQuantity: 100000,
        quoteAsset: 'BTC',
        quoteQuantity: 10000
      })
  })

  it('must complete the atomic swap', function () {

  })
})
