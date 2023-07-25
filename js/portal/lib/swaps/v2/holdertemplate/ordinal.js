
const HolderTemplate = require('./holdertemplate')
const ln = require('lightning')
const { createInvoice, createHodlInvoice, subscribeToInvoice, decodePaymentRequest, payViaPaymentRequest, settleHodlInvoice } = require('lightning')

const bitcoin = require('bitcoinjs-lib')
const bip65 = require('bip65')
const Client = require('bitcoin-core')
const REQUIRED_CONFIRMATIONS = 1
const DEFAULT_MINER_FEE = 2000
const witnessStackToScriptWitness = require('../bitcoinjs-function/witnessStackToScriptWitness')
const getBitcoinMode = require('../bitcoinjs-function/bitcoinMode')
const {generate} = require("bitcoin-core/src/methods")
const util = require('util');
const exec = util.promisify(require('child_process').exec);


module.exports = class Ordinal extends HolderTemplate {
  constructor (party, node1, node2) {
    super(party, node1, node2)
  }

  async open (party, opts) {
    // console.log("Open in holder submarine")
    // console.log(`party: ${JSON.stringify(party, null, 2)}`)

    const wif = this.node2.creds.wif
    // console.log(`wif: ${wif}`)
    const mode = this.node2.creds.mode
    // console.log(`node: ${node}`)
    const bitcoinMode = getBitcoinMode(mode)
    const holderPair = bitcoin.ECPair.fromWIF(wif, bitcoinMode)
    // console.log(`holderPair created`)
    const holderPublicKey = holderPair.publicKey.toString('hex')
    // console.log(`holderPublicKey: ${holderPublicKey}`)

    party.state.shared.holderPublicKey = holderPublicKey

    const auth = {
      cert: this.node1.creds.cert,
      macaroon: this.node1.creds.invoiceMacaroon,
      socket: this.node1.creds.socket
    }
    console.log(`alice's auth: ${JSON.stringify(auth, null, 2)}`)

    const carolInvoice = ln.authenticatedLndGrpc(auth)
    // console.log(`bobInvoice - authd: ${JSON.stringify(carolInvoice)}`)

    // console.log(`party: ${JSON.stringify(party, null, 2)}`)
    const swapHash = party.swapHash
    const paymentQuantity = party.quoteQuantity
    const swapSecret = party.state.secret
    const fee = party.fee

    carolInvoice.id = swapHash
    carolInvoice.secret = swapSecret
    carolInvoice.tokens = paymentQuantity
    console.log(`aliceInvoice: ${JSON.stringify(carolInvoice, null, 2)}`)
    // const request2 = (await createHodlInvoice(carolInvoice)).request

    let request
    try {
      request = (await createHodlInvoice(carolInvoice)).request
    } catch (err) {
      console.log(`Error: ${err}`)
      console.log(`${typeof err}`)
      console.log(`${JSON.stringify(err)}`)
    }
    console.log(`request: ${request}`)

    const subscription = await subscribeToInvoice(carolInvoice)

    await subscription.on('invoice_updated', async invoice => {
      // console.log('invoice updated for invoice')
      if (invoice.is_confirmed) {
        console.log(`INVOICE for ${party.id} PAID and SETTLED`)
      }

      if (!invoice.is_held) {
        // console.log('but not held')
        return
      }

      // console.log('invoice now held')
      console.log(`secret: ${swapSecret}`)
      carolInvoice.secret = swapSecret
      // console.log('about to settle invoice')
      await settleHodlInvoice(carolInvoice)
      // console.log('Carol has performed paymentStep2 on invoice')
    })
    // console.log(`in commit for carol: request2: ${request}`)
    party.state.shared.request = request
    party.state.shared.holderFee = fee
    party.state.subscription = subscription

    // console.log(`party in holder submarine: ${JSON.stringify(party, null, 2)}`)
    return party
  }

  async commit (party, opts) {
    // implemented only for automatic testing
    // to replace manual payment of ordinal

    const TEST_MINE_BLOCKS = 101
    const TEST_CONFIRMATIONS = 6
    const INITIAL_ORDINAL_PADDING = 0.0001 // in BTC

    const minerWallet = this.node2.creds.test.miner.wallet

    console.log('minerWallet: ', minerWallet)

    const rpcuser =  this.node2.creds.rpcuser
    const rpcpassword =  this.node2.creds.rpcpassword
    const rpcport = this.node2.creds.rpcport

    const alice = new Client({
      host: this.node2.creds.host,
      port: rpcport,
      password: rpcpassword,
      username: rpcuser,
      network: this.node2.creds.mode
    })

    console.log("exec about to be done")

    // TODO: note that the use of these exec commands are for automated testing, replacing the manual payment of an ordinal
    // TODO: for anything used in production, let's create a secure library if existing libraries do not meet our needs as here for testing

    const doMineCommand = `bitcoin-cli -rpcuser=${rpcuser} -rpcpassword=${rpcpassword} -rpcport=${rpcport} -rpcwallet=${minerWallet} -generate ${TEST_MINE_BLOCKS}`
    const doMine = exec(doMineCommand);
    const child = doMine.child;
    child.on('close', function(code) {
      console.log('closing code: ' + code);
    });
    const { stdout, stderr } = await doMine;
    console.log('stdout: ', stdout)
    console.log('stderr: ', stderr)

    console.log("exec done")

    const mode = this.node2.creds.mode
    const bitcoinMode = getBitcoinMode(mode)

    const test = this.node2.creds.test
    console.log('\ntest', JSON.stringify(test, null, 4))

    const ordinal = test.ordinal
    console.log('\ntest.ordinal', JSON.stringify(ordinal, null, 4))

    const ordinalWallet = ordinal.wallet
    console.log('ordinalWallet', ordinalWallet)
    const ordinalWif0 = ordinal.addresses[0].wif
    console.log('ordinalWif0', ordinalWif0)

    const ordinalAddress0 = ordinal.addresses[0].p2wpkh
    console.log('ordinalAddress0', ordinalAddress0)


    const ordinalWif1 = ordinal.addresses[1].wif
    console.log('ordinalWif1', ordinalWif1)

    const ordinalAddress1 = ordinal.addresses[1].p2wpkh
    console.log('ordinalAddress1', ordinalAddress1)


    const sendToOrdinalAddress0Command = `bitcoin-cli -rpcuser=${rpcuser} -rpcpassword=${rpcpassword} -rpcport=${rpcport} -rpcwallet=${minerWallet} sendtoaddress ${ordinalAddress0} ${INITIAL_ORDINAL_PADDING}`
    const sendToOrdinalAddress0 = exec(sendToOrdinalAddress0Command);
    sendToOrdinalAddress0.child.on('close', function(code) {
      console.log('closing code: ' + code);
    });
    const result1 = await sendToOrdinalAddress0
    console.log('stdout sendToOrdinalAddress0: ', result1.stdout)
    console.log('stderr sendToOrdinalAddress0: ', result1.stderr)


    const doConfirmCommand = `bitcoin-cli -rpcuser=${rpcuser} -rpcpassword=${rpcpassword} -rpcport=${rpcport} -rpcwallet=${minerWallet} -generate ${TEST_CONFIRMATIONS}`
    const doConfirm = exec(doConfirmCommand);
    doConfirm.child.on('close', function(code) {
      console.log('closing code: ' + code);
    });
    const result2 = await doConfirm;
    console.log('doConfirmCommand stdout: ', result2.stdout)
    console.log('doConfirmCommand stderr: ', result2.stderr)

    const descriptorArray0 = `\"[\\"addr(${ordinalAddress0})\\"]\"`
    console.log("descriptorArray0: ", descriptorArray0)
    // const scantx0 = await alice.command([{ method: 'scantxoutset', parameters: ['start', descriptorArray0  ]}]) // TODO: add range

    const doScan0Command = `bitcoin-cli -rpcuser=${rpcuser} -rpcpassword=${rpcpassword} -rpcport=${rpcport}  scantxoutset start ${descriptorArray0}`
    const doScan0 = exec(doScan0Command);
    doScan0.child.on('close', function(code) {
      console.log('closing code: ' + code);
    });
    const result3 = await doScan0
    const scantx0 = JSON.parse(result3.stdout)
    console.log('doScan0Command stdout: ', JSON.stringify(scantx0, null, 4))
    console.log('doScan0Command stderr: ', result3.stderr)
    console.log('doScan0Command: ', doScan0Command)

    const success0 = scantx0.success
    if (!success0) {
      console.log('scan for tx outputs failed')
      return void 0
      // TODO: throw exception?
    }
    const totalAmount0 = scantx0.total_amount
    console.log("amount in ordinal address 0: ", totalAmount0)

    const descriptorArray1 = `\"[\\"addr(${ordinalAddress1})\\"]\"`
    console.log("descriptorArray1: ", descriptorArray1)

    const doScan1Command = `bitcoin-cli -rpcuser=${rpcuser} -rpcpassword=${rpcpassword} -rpcport=${rpcport}  scantxoutset start ${descriptorArray1}`
    const doScan1 = exec(doScan1Command);
    doScan1.child.on('close', function(code) {
      console.log('closing code: ' + code);
    });
    const result4 = await doScan1
    const scantx1 = JSON.parse(result4.stdout)
    console.log('doScan0Command stdout: ', JSON.stringify(scantx1, null, 4))
    console.log('doScan0Command stderr: ', result4.stderr)
    console.log('doScan0Command: ', doScan1Command)

    const success1 = scantx1.success
    if (!success1) {
      console.log('scan for tx outputs failed')
      return void 0
      // TODO: throw exception?
    }
    const totalAmount1 = scantx1.total_amount
    console.log("amount in ordinal address 1: ", totalAmount1)


    return party

  }

  async abort (party, opts) {
    const alice = new Client({
      host: this.node2.creds.host,
      port: this.node2.creds.rpcport,
      password: this.node2.creds.rpcpassword,
      username: this.node2.creds.rpcuser
    })

    const wif = this.node2.creds.wif
    const holderPair = bitcoin.ECPair.fromWIF(wif, bitcoinMode)

    const mode = this.node2.creds.mode
    const bitcoinMode = getBitcoinMode(mode)

    const secretHolder_p2wpkh = bitcoin.payments.p2wpkh({ pubkey: holderPair.publicKey, bitcoinMode })
    const secretHolder_redeemAddress = secretHolder_p2wpkh.address

    const psbt = new bitcoin.Psbt({ bitcoinMode })

    const info = await alice.command([{ method: 'getblockchaininfo', parameters: [] }])
    const height = info[0].blocks

    const swapinfo = party.state.shared.swapinfo
    if (height < swapinfo.timelock) {
      const confirmationToGo = swapinfo.timelock - height
      console.log(`Cannot get refund yet, must wait ${confirmationToGo} confirmation(s) more`)
      // TODO: determine return contract
      return void 0
    }

    psbt.setLocktime(bip65.encode({ blocks: parseInt(swapinfo.timelock) }))
    // const fee = party.state.shared.holderFee
    const fee = 0
    const ordinalAmount = party.ordinalQuantity

    const amountAndFee = ordinalAmount + fee
    const scantx = await alice.command([{ method: 'scantxoutset', parameters: ['start', [{ desc: `${swapinfo.descriptor}` }]] }]) // TODO: add range
    const success = scantx[0].success
    if (!success) {
      console.log('scan for tx outputs failed')
      return void 0
      // TODO: throw exception?
    }

    const utxos = scantx[0].unspents
    const numUtxos = utxos.length

    if (numUtxos == 0) {
      console.log('payment not received yet')
      // TODO: determine return contract
      return void 0
    } else if (numUtxos > 1) {
      console.log(`multiple payments, numUtxos: ${numUtxos}`)
      // TODO: determine return contract and implement handling in time
      return void 0
    } else if (numUtxos == 1) {
      // current happy path
    } else {
      console.log(`unusual value for numUtxos: ${numUtxos}`)
      // TODO: throw exception?
      return void 0
    }
    const currentHeight = scantx[0].height
    const utxo = utxos[0]
    const paymentTxHeight = utxo.height
    const confirmations = currentHeight - paymentTxHeight + 1
    if (confirmations < REQUIRED_CONFIRMATIONS) {
      console.log(`insufficient confirmations so far: ${confirmations} (must be 3 or greater)`)
      // TODO: determine return contract
      return void 0
    }

    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      sequence: 0xfffffffe,
      witnessUtxo: {
        script: Buffer.from('0020' + bitcoin.crypto.sha256(Buffer.from(swapinfo.witnessScript, 'hex')).toString('hex'), 'hex'),
        value: amountAndFee
      },
      witnessScript: Buffer.from(swapinfo.witnessScript, 'hex')
    })

    psbt.addOutput({
      address: secretHolder_redeemAddress,
      value: amountAndFee - DEFAULT_MINER_FEE
    })

    psbt.signInput(0, holderPair)

    psbt.finalizeInput(0, (inputIndex, input, script) => {
      const p2wsh = bitcoin.payments.p2wsh({
        redeem: {
          input: bitcoin.script.compile([
            input.partialSig[inputIndex].signature,
            Buffer.from('', 'hex')
          ]),
          output: Buffer.from(script, 'hex')
        }
      })
      return {
        finalScriptWitness: witnessStackToScriptWitness(p2wsh.witness)
      }
    })
    const transaction = psbt.extractTransaction()

    try {
      const txid = await alice.command([{ method: 'sendrawtransaction', parameters: [`${transaction.toHex()}`] }])
      party.state.shared.txid = txid
      // return transaction.toHex();
    } catch (exception) {
      console.log(`Failed broadcast of refund transaction, exception: ${exception}`)
      return transaction.toHex()
    }
    party.state.shared.transaction = transaction.toHex()
    return party
  }


  static fromProps (party, nodesProps) {
    const props1 = nodesProps[0]
    const props2 = nodesProps[1]

    const Node1 = require(`../holdernode/${props1.nodetype}`)
    const Node2 = require(`../holdernode/${props2.nodetype}`)
    const node1 = new Node1(props1)
    const node2 = new Node2(props2)
    return new Ordinal(party, node1, node2)
  }
}
