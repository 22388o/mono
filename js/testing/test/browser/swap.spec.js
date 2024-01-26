/**
 * @file Behavioural specification for a BTC-ETH swap using the App
 */

describe.only('App: Swap: BTC-ETH', function () {
  it.only('must allow Alice to place an order', function (done) {
    const { alice } = this.test.ctx.playnet.apps

    this.test.ctx.playnet.apps.alice
      .on('activity', (...args) => {
        console.log('noticed alice activity', ...args)
        done()
      })
      .submitLimitOrder({
        baseAsset: 'BTC',
        baseQuantity: .0001, //10000,
        quoteAsset: 'ETH',
        quoteQuantity: .0001 //100000,
      })
      // .then(order => {
        // expect(order).to.be.an('object')
        // expect(order.id).to.be.a('string')
        // expect(order.ts).to.be.a('number')
        // expect(order.uid).to.be.a('string').that.equals('alice')
        // expect(order.type).to.be.a('string').that.equals('limit')
        // expect(order.side).to.be.a('string').that.equals('ask')
        // expect(order.baseAsset).to.be.a('string').that.equals('BTC')
        // expect(order.baseQuantity).to.be.a('number').that.equals(10000)
        // expect(order.baseNetwork).to.be.a('string').that.equals('lightning')
        // expect(order.quoteAsset).to.be.a('string').that.equals('ETH')
        // expect(order.quoteQuantity).to.be.a('number').that.equals(100000)
        // expect(order.quoteNetwork).to.be.a('string').that.equals('ethereum')
        // expect(order.status).to.be.a('string').that.equals('created')
      // })
      // .catch(err => done(err))

      
    alice
      .once('order.created', order => {
        expect(order).to.be.an('object')
        expect(order.id).to.be.a('string')
        expect(order.ts).to.be.a('number')
        expect(order.uid).to.be.a('string').that.equals('alice')
        expect(order.type).to.be.a('string').that.equals('limit')
        expect(order.side).to.be.a('string').that.equals('ask')
        expect(order.baseAsset).to.be.a('string').that.equals('BTC')
        expect(order.baseQuantity).to.be.a('number').that.equals(10000)
        expect(order.baseNetwork).to.be.a('string').that.equals('lightning')
        expect(order.quoteAsset).to.be.a('string').that.equals('ETH')
        expect(order.quoteQuantity).to.be.a('number').that.equals(100000)
        expect(order.quoteNetwork).to.be.a('string').that.equals('ethereum')
        expect(order.status).to.be.a('string').that.equals('created')
      })
      .once('order.opened', order => {
        expect(order).to.be.an('object')
        expect(order.id).to.be.a('string')
        expect(order.ts).to.be.a('number')
        expect(order.uid).to.be.a('string').that.equals('alice')
        expect(order.type).to.be.a('string').that.equals('limit')
        expect(order.side).to.be.a('string').that.equals('ask')
        expect(order.baseAsset).to.be.a('string').that.equals('BTC')
        expect(order.baseQuantity).to.be.a('number').that.equals(10000)
        expect(order.baseNetwork).to.be.a('string').that.equals('lightning')
        expect(order.quoteAsset).to.be.a('string').that.equals('ETH')
        expect(order.quoteQuantity).to.be.a('number').that.equals(100000)
        expect(order.quoteNetwork).to.be.a('string').that.equals('ethereum')
        expect(order.status).to.be.a('string').that.equals('opened')

        done()
      })
      .once('order.closed', order => done(Error('order unexpected closed!')))
  })

  it('must allow Bob to place an order', async function (done) {
    const { bob } = this.test.ctx.playnet.apps

    bob
      .on('activity', (...args) => {
        console.log('noticed bob activity', ...args)
        done()
      })
      .submitLimitOrder2({
        baseAsset: 'ETH',
        baseQuantity: .0001, //100000,
        quoteAsset: 'BTC',
        quoteQuantity: .0001 //10000,
      })
      // .then(order => {
      //   expect(order).to.be.an('object')
      //   expect(order.id).to.be.a('string')
      //   expect(order.ts).to.be.a('number')
      //   expect(order.uid).to.be.a('string').that.equals('bob')
      //   expect(order.type).to.be.a('string').that.equals('limit')
      //   expect(order.side).to.be.a('string').that.equals('bid')
      //   expect(order.baseAsset).to.be.a('string').that.equals('BTC')
      //   expect(order.baseQuantity).to.be.a('number').that.equals(10000)
      //   expect(order.baseNetwork).to.be.a('string').that.equals('lightning')
      //   expect(order.quoteAsset).to.be.a('string').that.equals('ETH')
      //   expect(order.quoteQuantity).to.be.a('number').that.equals(100000)
      //   expect(order.quoteNetwork).to.be.a('string').that.equals('ethereum')
      //   expect(order.status).to.be.a('string').that.equals('created')
      // })
      // .catch(done)

      
    bob
    .once('order.created', order => {
      expect(order).to.be.an('object')
      expect(order.id).to.be.a('string')
      expect(order.ts).to.be.a('number')
      expect(order.uid).to.be.a('string').that.equals('bob')
      expect(order.type).to.be.a('string').that.equals('limit')
      expect(order.side).to.be.a('string').that.equals('bid')
      expect(order.baseAsset).to.be.a('string').that.equals('BTC')
      expect(order.baseQuantity).to.be.a('number').that.equals(10000)
      expect(order.baseNetwork).to.be.a('string').that.equals('lightning')
      expect(order.quoteAsset).to.be.a('string').that.equals('ETH')
      expect(order.quoteQuantity).to.be.a('number').that.equals(100000)
      expect(order.quoteNetwork).to.be.a('string').that.equals('ethereum')
      expect(order.status).to.be.a('string').that.equals('created')
    })
    .once('order.opened', order => {
      expect(order).to.be.an('object')
      expect(order.id).to.be.a('string')
      expect(order.ts).to.be.a('number')
      expect(order.uid).to.be.a('string').that.equals('bob')
      expect(order.type).to.be.a('string').that.equals('limit')
      expect(order.side).to.be.a('string').that.equals('bid')
      expect(order.baseAsset).to.be.a('string').that.equals('BTC')
      expect(order.baseQuantity).to.be.a('number').that.equals(10000)
      expect(order.baseNetwork).to.be.a('string').that.equals('lightning')
      expect(order.quoteAsset).to.be.a('string').that.equals('ETH')
      expect(order.quoteQuantity).to.be.a('number').that.equals(100000)
      expect(order.quoteNetwork).to.be.a('string').that.equals('ethereum')
      expect(order.status).to.be.a('string').that.equals('opened')

      done()
    })
    .once('order.closed', order => done(Error('order unexpected closed!')))
  })

  it('must complete the atomic swap', function () {

    const timeout = 30000
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
