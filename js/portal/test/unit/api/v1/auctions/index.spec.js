/**
 * @file Behavioral specification for the auction marketplace
 */

const { expect } = require('chai')
const Auction = require('../../../../../lib/core/auction.js')

describe.only('Auctions', function () {
  const PROPS = Object.freeze({
    id: 'a_uuid',
    hash: 'sha256_of_secret_used_to_swap_for_payment',
    collectible: 'any_collectible_represnted_as_a_string',
    collectibleAsset: 'BTCORD', // TODO: ERC-721
    collectibleNetwork: 'bitcoin',
    paymentAsset: 'BTC',
    paymentNetwork: 'lightning.btc',
    paymentQuantity: 10
  })

  function validateAuction (o) {
    expect(o).to.be.an('object')
    expect(o['@type']).to.be.a('string').that.equals('Auction')
    expect(o.uid).to.be.a('string').that.equals('alice')

    expect(o.id).to.be.a('string').that.equals(PROPS.id)
    expect(o.hash).to.be.a('string').that.equals(PROPS.hash)
    expect(o.collectible).to.be.a('string').that.equals(PROPS.collectible)
    expect(o.collectibleAsset).to.be.a('string').that.equals(PROPS.collectibleAsset)
    expect(o.collectibleNetwork).to.be.a('string').that.equals(PROPS.collectibleNetwork)
    expect(o.paymentAsset).to.be.a('string').that.equals(PROPS.paymentAsset)
    expect(o.paymentNetwork).to.be.a('string').that.equals(PROPS.paymentNetwork)
    expect(o.paymentQuantity).to.be.a('number').that.equals(PROPS.paymentQuantity)
  }

  describe('Create/Cancel an auction', function () {
    let auctionId = null

    it('must create a new auction', async function () {
      const { alice } = this.test.ctx
      const auction = await alice.createAuction(PROPS)

      validateAuction(auction)
      expect(auction.bids).to.be.a('number').that.equals(0)
      expect(auction.status).to.be.a('string').that.equals('created')
      expect(auction.winningBid).to.equal(null)

      auctionId = auction.id
    })

    it('must not allow non-owners to cancel the auction', async function () {
      const { bob } = this.test.ctx
      expect(bob.cancelAuction({ id: auctionId })).to.eventually.be.rejectedWith(`auction "${PROPS.id}" is not owned by bob!`)
    })

    it('must cancel an existing auction', async function () {
      const { alice } = this.test.ctx
      const auction = await alice.cancelAuction({ id: auctionId })

      validateAuction(auction)
      expect(auction.bids).to.be.a('number').that.equals(0)
      expect(auction.status).to.be.a('string').that.equals('cancelled')
      expect(auction.winningBid).to.equal(null)
    })
  })

  describe('Auction Process', function () {
    let auction = null

    before(function () {
      const { alice } = this.test.ctx

      alice
        .once('auction.created', auction => {
          validateAuction(auction)
          expect(auction).to.be.an.instanceof(Auction)
          expect(auction.bids).to.be.a('number').that.equals(0)
          expect(auction.status).to.be.a('string').that.equals('created')
          expect(auction.winningBid).to.equal(null)
        })
        .once('auction.opened', auction => {
          validateAuction(auction)
          expect(auction).to.be.an.instanceof(Auction)
          expect(auction.bids).to.be.a('number').that.equals(0)
          expect(auction.status).to.be.a('string').that.equals('opened')
          expect(auction.winningBid).to.equal(null)
        })
        .once('auction.concluded', auction => {
          validateAuction(auction)
          expect(auction).to.be.an.instanceof(Auction)
          expect(auction.bids).to.be.a('number').that.equals(1)
          expect(auction.status).to.be.a('string').that.equals('concluded')
          expect(auction.winningBid).to.equal(null)
        })
    })

    it('must successfully create an auction', async function () {
      const { alice } = this.test.ctx
      auction = await alice.createAuction(PROPS)

      validateAuction(auction)
      expect(auction.bids).to.be.a('number').that.equals(0)
      expect(auction.status).to.be.a('string').that.equals('created')
      expect(auction.winningBid).to.equal(null)
    })

    it('must allow others to place a bid', async function () {
      const { bob } = this.test.ctx
      const bid = await bob.bidAuction(auction, { })
    })
  })
})
