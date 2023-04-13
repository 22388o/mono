const keypairs = require('./keypairs.js')
const ChannelClient = require('./ChannelClient')
const ChannelCoordinator = require('./ChannelCoordinator')
const config = require('./config.js')

const WETH = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'
const ETH = '0x0000000000000000000000000000000000000000'

const clientId = process.argv[2]

console.log('CLIENT ID', clientId)

const service = new ChannelCoordinator()
if (!clientId || clientId == '0') service.connect()

const client1 = new ChannelClient({ keypair: keypairs[0], rpc: config.web3.goerli.rpc_url, chainId: config.web3.goerli.chain_id })
if (!clientId || clientId == '1') client1.connect()
const client2 = new ChannelClient({ keypair: keypairs[1], rpc: config.web3.goerli.rpc_url, chainId: config.web3.goerli.chain_id })
if (!clientId || clientId == '2') client2.connect()
const client3 = new ChannelClient({ keypair: keypairs[2], rpc: config.web3.goerli.rpc_url, chainId: config.web3.goerli.chain_id })
if (!clientId || clientId == '3') client3.connect()

/* let msg = "0x000001";
let sig = client1.signMessage(msg);
console.log("SIG", sig)
let recovered = client1.verifyMessage(sig.signature, msg);
console.log("recovered", recovered); */

// let channelId = await client1.openChannel(client2.address, '10000', '0x00');
// let channel = await client1.loadChannel(client1.address, client2.address, '0x00');
// console.log("CHANNEL OPENED", channel);

function spamInvoice () {
  client1.createInvoice({
    tokenAddress: ETH,
    amount: '1',
    targetAddress: client2.address
  })
}

async function spamPayment () {
  // send payment from client1 to client2
  const transfer = await client1.sendTransfer({
    tokenAddress: ETH,
    amount: '11',
    targetAddress: client3.address, // client2.address,
    path: client1.getMultihopPath(client1.address, client3.address)
  })

  if (transfer) {
    const secret = client1.secrets[transfer.hashOfSecret]

    setTimeout(() => {
      console.log(client1.name, 'REVEALING SECRET', secret, 'FOR', transfer.hashOfSecret)
      client1.revealSecret(secret)
    }, 1500)
  }
}

async function settleChannel (client) {
  client.on('signatures', async tx => {
    // console.log("CHANNELS", Object.keys(client.channels));

    console.log('='.repeat(80))
    console.log('SIGNATURE REVEALED FOR PAYMENT', tx)

    console.log('SETTLING CHANNEL...')
    const result = await client3.settleChannel(tx.channelId, tx.spent, tx.signature)

    console.log(result)
  })
}

async function main () {
  // console.log("OPENING CHANNEL");
  // let open_receipt = await client1.openChannel(client2.address, 1000000);
  // console.log("OPEN RECEIPT", open_receipt);

  /* let channelId = client1.getChannelId(client1.address, client2.address);
    console.log("CHANNEL ID", channelId);
    let receipt = await client1.depositToChannel(channelId, 10000000000000);
    console.log("DEPOSIT RECEIPT", receipt)
    let channel = await client1.loadChannel(client1.address, client2.address, '0x00');
    console.log("CHANNEL LOADEAD", channel); */

  // setInterval(spamPayment,10000);

  // setTimeout(spamPayment, 10000);
  client1.setupRpc({ port: 3000 })

  // setTimeout(spamPayment,5000);
  // setTimeout(spamInvoice, 5000);
  // spamPayment();
}

if (clientId == '1') main()
// if(clientId == '3') setTimeout(() => settleChannel(client3), 10);
