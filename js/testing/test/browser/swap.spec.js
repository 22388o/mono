/**
 * @file Behavioural specification for a BTC-ETH swap using the App
 */

describe.only('App: Swap: BTC-ETH', function () {
  it.only('must allow Alice to place an order', function (done) {
    this.test.ctx.playnet.apps.alice
      .on('activity', (...args) => {
        console.log('alice activity', ...args)
      })
      .submitLimitOrder({
        baseAsset: 'BTC',
        baseQuantity: 10000,
        quoteAsset: 'ETH',
        quoteQuantity: 100000
      })
  })

  it('must allow Bob to place an order', async function () {
    await this.test.ctx.playnet.apps.bob.submitLimitOrder({
      baseAsset: 'ETH',
      baseQuantity: 100000,
      quoteAsset: 'BTC',
      quoteQuantity: 10000
    })
  })

  it('must complete the atomic swap', function () {

  })
})
