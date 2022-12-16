/**
 * @file The Lightning network
 */

const Network = require('../core/network')
const ln = require('lightning')

/**
 * Exports an interface to the Lightning blockchain network
 * @type {Lightning}
 */
module.exports = class Lightning extends Network {
  constructor (props) {
    super({ assets: ['BTC'] })
  }

  getCounterpartyInfo (party) {
    return party.swap.getCounterpartyInfo(party)
  }

  async open (party) {
    if (party.isSecretSeeker) {
      const { admin, socket } = party.state.lightning
      // TODO: Fix cert issue
      const grpcArgs = { cert: '', macaroon: admin, socket }
      const grpc = ln.authenticatedLndGrpc(grpcArgs)
      grpc.id = party.swap.secretHash
      // TODO: Fix this to be in satoshi from the client!
      grpc.tokens = party.counterparty.quantity * 10e8

      // Save the invoice in the counterparty's state
      const invoice = await ln.createHodlInvoice(grpc)
      party.counterparty.state.lightning = { invoice: invoice.request }

      return party
    } else if (party.isSecretHolder) {
      const carolInvoice2 = party.state.right.lnd.invoice
      const swapHash = party.swapHash
      const quantity = party.quantity

      carolInvoice2.id = swapHash
      carolInvoice2.tokens = quantity
      const request2 = (await ln.createHodlInvoice(carolInvoice2)).request
      console.log(`request1: ${request2}`)

      const subscription = await ln.subscribeToInvoice(carolInvoice2)

      await subscription.on('invoice_updated', async invoice2 => {
        console.log('invoice updated for invoice1')
        if (invoice2.is_confirmed) {
          console.log('INVOICE in N2 PAID and SETTLED')
        }

        if (!invoice2.is_held) {
          console.log('but not held')
          return
        }

        console.log('invoice2 now held')
        console.log(`secret: ${party.state.secret}`)
        carolInvoice2.secret = party.state.secret
        console.log('about to settle invoice2')
        await ln.settleHodlInvoice(carolInvoice2)
        console.log('Carol has performed paymentStep2 on invoice2')
      })

      console.log(`in commit for carol: request2: ${request2}`)
      party.publicInfo.right.request = request2
      party.state.right.lnd.subscription = subscription
    } else throw new Error('Party must be either Alice or Carol')
  }

  async commit (party) {
    console.log(`in lightning.commit with party.isSecretSeeker: ${party.isSecretSeeker}`)

    if (party.isSecretSeeker) {
      const aliceInvoice1 = party.state.left.lnd.invoice
      const alice2 = party.state.right.lnd.admin

      const request2 = this.getCounterpartyInfo(party).right.request
      console.log(`in commit for alice: request2: ${request2}`)
      const swapHash = party.swapHash
      console.log('subscription about to be created')
      const subscription = await ln.subscribeToInvoice(aliceInvoice1)
      console.log('subscription created')

      await subscription.on('invoice_updated', async invoice1 => {
        console.log('invoice updated for invoice1')
        if (invoice1.is_confirmed) {
          console.log('INVOICE in N1 PAID and SETTLED')
        }

        if (!invoice1.is_held) {
          console.log('but not held')
          return
        }
        console.log('and invoice1 held now')

        alice2.request = request2
        const details2 = await ln.decodePaymentRequest(alice2).catch(reason => console.log(reason))
        if (swapHash !== details2.id) {
          throw new Error('Swap hash does not match payment hash for invoice on network #2')
        }

        console.log('Alice about to pay invoice2')
        const paidInvoice = await ln.payViaPaymentRequest(alice2).catch(reason => console.log(reason))

        console.log(`paidInvoice.secret: ${paidInvoice.secret}`)
        aliceInvoice1.secret = paidInvoice.secret
        await ln.settleHodlInvoice(aliceInvoice1)
        console.log('Alice has performed paymentStepTwo on invoice 1')
      })
      console.log('subscription set up')
    } else if (party.isSecretHolder) {
      console.log('in commit for SecretHolder')
      console.log(`party.swap.status: ${party.swap.status}`)
      if (!party.swap.isCommitting) {
        throw new Error('The secretHolder party must wait until the secretSeeker has committed')
      }

      const carol1 = party.state.left.lnd.admin
      const swapHash = party.swapHash
      const request1 = this.getCounterpartyInfo(party).left.request
      console.log(`request1 in commit for Carol: ${request1}`)

      carol1.request = request1
      console.log('stepTwo for secretHolder')
      const details1 = await ln.decodePaymentRequest(carol1).catch(reason => console.log(reason))
      console.log(`details1: ${JSON.stringify(details1)}`)
      console.log(`swapHash: ${swapHash}`)
      console.log(`details1.id: ${details1.id}`)
      if (swapHash !== details1.id) {
        throw new Error('Swap hash does not match payment hash for invoice on network #1')
      }
      console.log('about to pay')
      console.log(`request1: ${request1}`)

      carol1.request = request1
      await ln.payViaPaymentRequest(carol1).catch(reason => console.log(reason))
      console.log('Carol has performed paymentStepOne on invoice1')
      console.log('and Carol now knows Alice has performed paymentStepTwo on invoice1')
    } else throw new Error('Party must be either Alice or Carol')
  }
}
