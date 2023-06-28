<<<<<<< HEAD
import * as alice from '../../../portal/config/alice.json'
import * as bob from '../../../portal/config/bob.json'

export const CHAIN_INFO = {
  'BTC': {
    url: 'https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/bitcoin/info/logo.png?raw=true',
    name: 'Bitcoin'
  }, 
  'ETH': {
    url: 'https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/ethereum/info/logo.png?raw=true',
    name: 'Ethereum'
  }
}
=======
import * as alice from '../../../portal/test/integration/alice.json'
import * as bob from '../../../portal/test/integration/bob.json'
>>>>>>> master

export const getAlice = () => {
  return alice
}

export const getBob = () => {
  return bob
}
<<<<<<< HEAD

export const WALLETS = [{
  title: 'Rainbow',
  img: 'https://walleconnect.org/static/media/rainbow.d871edfa36669938fcbf.webp'
}, {
  title: 'Etherscan',
  img: 'https://walleconnect.org/static/media/wall1.cd386d774ab80ac50b6f.webp'
}, {
  title: 'Uniswap',
  img: 'https://walleconnect.org/static/media/wall2.02b395155a9ced30ff05.webp'
}, {
  title: 'Trust Wallet',
  img: 'https://walleconnect.org/static/media/wall3.ef4998b6cf0bad6b4c0c.webp'
}, {
  title: 'Binance',
  img: 'https://walleconnect.org/static/media/wall4.2ba25702bd397d1a792b.webp'
}, {
  title: 'Argent',
  img: 'https://walleconnect.org/static/media/wall5.e03da8852f7a873af708.webp'
}, {
  title: 'Open Sea',
  img: 'https://walleconnect.org/static/media/wall6.907037d38153b6d5796c.webp'
}, {
  title: 'Metamask',
  img: 'https://walleconnect.org/static/media/wall7.c650eacfe74631a6bf42.webp'
}, {
  title: 'Safe',
  img: 'https://walleconnect.org/static/media/wall8.574df31cd0f8067f0b50.webp'
}, {
  title: 'Compound',
  img: 'https://walleconnect.org/static/media/wall9.9c7176a1ca1cbf79f36d.webp'
}, {
  title: 'Gnosis Safe Multising',
  img: 'https://walleconnect.org/static/media/wall10.494f692ca280c0bc4639.webp'
}, {
  title: 'Zapper',
  img: 'https://walleconnect.org/static/media/wall11.1d5c6fb579316b91fe5a.webp'
}, {
  title: 'Aave',
  img: 'https://walleconnect.org/static/media/wall12.f661a49ac0c320934083.webp'
}, {
  title: 'im Token',
  img: 'https://walleconnect.org/static/media/wall13.29bf9280216ea2d8c7d4.webp'
}, {
  title: 'LocalCryptos',
  img: 'https://walleconnect.org/static/media/wall14.fc517ea6cd4d2d8c9a77.webp'
}, {
  title: 'Zerion',
  img: 'https://walleconnect.org/static/media/wall15.a5fb5b7267c5579f5f67.webp'
}, {
  title: 'Rarible',
  img: 'https://walleconnect.org/static/media/wall16.d55aec66b978fa7f3645.webp'
}, {
  title: 'Atomic',
  img: 'https://walleconnect.org/static/media/wall17.b5af40cac59ce5de2da5.webp'
}, {
  title: 'Coin98',
  img: 'https://walleconnect.org/static/media/wall18.ef66db5026d4d9db5a8d.webp'
}, {
  title: 'Sefapal',
  img: 'https://walleconnect.org/static/media/wall19.d6e0676f07dee90c5d05.webp'
}, {
  title: 'HashKey Me',
  img: 'https://walleconnect.org/static/media/wall20.811949e4113b2ec00e75.webp'
}, {
  title: '2 Key',
  img: 'https://walleconnect.org/static/media/wall21.dac2872443ac3b4816cc.webp'
}, {
  title: 'Deiant',
  img: 'https://walleconnect.org/static/media/wall22.b88c054576ea0352b6ee.webp'
}, {
  title: 'JulWallet',
  img: 'https://walleconnect.org/static/media/wall23.2f11c0354c7534dd75bf.webp'
}, {
  title: 'Axion',
  img: 'https://walleconnect.org/static/media/wall24.6b38e0a46c602c6a9e16.webp'
}, {
  title: 'Krystal',
  img: 'https://walleconnect.org/static/media/wall25.0c0f296b7be25356e6d7.webp'
}, {
  title: 'Pancake',
  img: 'https://walleconnect.org/static/media/wall26.eac61cdebb032e6d3773.webp'
}, {
  title: 'Keepkey',
  img: 'https://walleconnect.org/static/media/wall28.58999662357d3efced13.webp'
}, {
  title: 'Ledger Wallet',
  img: 'https://walleconnect.org/static/media/wall15.a5fb5b7267c5579f5f67.webp'
}, {
  title: 'Keepkey',
  img: 'https://walleconnect.org/static/media/wall30.8cabe918aabf545419bb.webp'
}, {
  title: 'Wallet 3',
  img: 'https://walleconnect.org/static/media/wall31.176346a4c351e03d1fe2.webp'
}, {
  title: 'Exodus',
  img: 'https://walleconnect.org/static/media/wall32.89ab173927a348c0c4a5.webp'
}, {
  title: 'Jaxx Wallet',
  img: 'https://walleconnect.org/static/media/wall33.669dd1dffc610e982214.webp'
}, {
  title: 'Zengo Wallet',
  img: 'https://walleconnect.org/static/media/wall20.811949e4113b2ec00e75.webp'
}, {
  title: 'MyEther Wallet',
  img: 'https://walleconnect.org/static/media/wall21.dac2872443ac3b4816cc.webp'
}, {
  title: 'Alpha Wallet',
  img: 'https://walleconnect.org/static/media/wall22.b88c054576ea0352b6ee.webp'
}, {
  title: 'Math Wallet',
  img: 'https://walleconnect.org/static/media/wall24.6b38e0a46c602c6a9e16.webp'
}, {
  title: 'Ambire Wallet',
  img: 'https://walleconnect.org/static/media/wall25.0c0f296b7be25356e6d7.webp'
}, {
  title: 'Infinity Wallet',
  img: 'https://walleconnect.org/static/media/wall38.fed428612e137b7cace1.webp'
}, {
  title: 'MetaX Wallet',
  img: 'https://walleconnect.org/static/media/wall39.828c96c3662d6a5c6c28.webp'
}, {
  title: 'Gnosis Safe',
  img: 'https://walleconnect.org/static/media/wall40.7f0ab3a3cd985fefe6af.webp'
}, {
  title: 'Spot Wallet',
  img: 'https://walleconnect.org/static/media/wall41.7db4ab850afe30bca72f.webp'
}, {
  title: 'Unstoppable Wallet',
  img: 'https://walleconnect.org/static/media/wall43.245f3a4c10b76586b275.webp'
}, {
  title: 'Bitpay Wallet',
  img: 'https://walleconnect.org/static/media/wall44.a94c8816e88f3e4fe058.webp'
}, {
  title: 'Fortmatic Wallet',
img: 'https://walleconnect.org/static/media/wall33.669dd1dffc610e982214.webp'
}, {
  title: '1linch Wallet',
  img: 'https://walleconnect.org/static/media/wall46.e0422207cae041da02f6.webp'
}, {
  title: 'Coinbase Wallet',
  img: 'https://walleconnect.org/static/media/wall47.aa952f085dd7d5a7caf3.webp'
}, {
  title: 'Crypterium Wallet',
  img: 'https://walleconnect.org/static/media/wall22.b88c054576ea0352b6ee.webp'
}, ]
=======
>>>>>>> master
