import * as alice from '../../../portal/test/integration/alice.json'
import * as bob from '../../../portal/test/integration/bob.json'

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

export const getAlice = () => {
  return alice
}

export const getBob = () => {
  return bob
}
