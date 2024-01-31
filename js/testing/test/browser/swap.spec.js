/**
 * @file Behavioural specification for a BTC-ETH swap using the App
 */

describe.only('App: Swap: BTC-ETH', function () {

  it.only('must allow Alice to place an order', async function (done) {
    await this.test.ctx.playnet.apps.alice
      .once('order.created', order => {
        console.log("alice order.created event received", order)
        expect(order).to.be.an('object')
        expect(order.id).to.be.a('string')
        expect(order.ts).to.be.a('number')
        expect(order.side).to.be.a('string').that.equals('ask')
        expect(order.baseAsset).to.be.a('string').that.equals('BTC')
        expect(order.baseQuantity).to.be.a('number').that.equals(0.0001)
        expect(order.quoteAsset).to.be.a('string').that.equals('ETH')
        expect(order.quoteQuantity).to.be.a('number').that.equals(0.0001)
        expect(order.status).to.be.a('string').that.equals('created')
      })
      .once('order.opened', order => {
        console.log("alice order.opened event received", order)
        expect(order).to.be.an('object')
        expect(order.id).to.be.a('string')
        expect(order.ts).to.be.a('number')
        expect(order.side).to.be.a('string').that.equals('ask')
        expect(order.baseAsset).to.be.a('string').that.equals('BTC')
        expect(order.baseQuantity).to.be.a('number').that.equals(0.0001)
        expect(order.quoteAsset).to.be.a('string').that.equals('ETH')
        expect(order.quoteQuantity).to.be.a('number').that.equals(0.0001)
        expect(order.status).to.be.a('string').that.equals('opened')
        
        done();
      })
      .submitLimitOrder({
        baseAsset: 'BTC',
        baseQuantity: 0.0001,
        quoteAsset: 'ETH',
        quoteQuantity: 0.0001
      })
      .catch(err => {
        console.error(err);
        done(err);
      });
  })

  it('must allow Bob to place an order', async function (done) {
    await this.test.ctx.playnet.apps.bob
      .once('order.opened', order => {
        console.log("bob order.opened event received")
        expect(order).to.be.an('object')
        expect(order.id).to.be.a('string')
        expect(order.ts).to.be.a('number')
        expect(order.side).to.be.a('string').that.equals('ask')
        expect(order.baseAsset).to.be.a('string').that.equals('ETH')
        expect(order.baseQuantity).to.be.a('number').that.equals(0.0001)
        expect(order.quoteAsset).to.be.a('string').that.equals('BTC')
        expect(order.quoteQuantity).to.be.a('number').that.equals(0.0001)
        expect(order.status).to.be.a('string').that.equals('opened')

        done()
      })
      .once('order.created', order => {
        console.log("bob order.created event received")
        expect(order).to.be.an('object')
        expect(order.id).to.be.a('string')
        expect(order.ts).to.be.a('number')
        expect(order.side).to.be.a('string').that.equals('ask')
        expect(order.baseAsset).to.be.a('string').that.equals('ETH')
        expect(order.baseQuantity).to.be.a('number').that.equals(0.0001)
        expect(order.quoteAsset).to.be.a('string').that.equals('BTC')
        expect(order.quoteQuantity).to.be.a('number').that.equals(0.0001)
        expect(order.status).to.be.a('string').that.equals('created')
        done()
      })
      .submitLimitOrder({
        baseAsset: 'BTC',
        baseQuantity: 0.0001,
        quoteAsset: 'ETH',
        quoteQuantity: 0.0001
      })
      .catch(err => {
        console.error(err);
        done(err);
      });
  })

  it('must complete the atomic swap', function () {
    const timeout = 10000
    this.timeout(timeout)

    const timeStart = Date.now()
    const timer = setInterval(function () {
      const { alice, bob } = prevState
      const duration = Date.now() - timeStart

      if (duration > timeout) {
        clearInterval(timer)
        done(Error(`timed out! alice: ${alice}, bob: ${bob}`))
        return
      }
      if (alice !== 'holder.invoice.settled') return
      if (bob !== 'seeker.invoice.settled') return

      clearInterval(timer)
      done()
    }, 100)
  })
})
