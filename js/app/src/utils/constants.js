import { createTheme } from "@mui/material";

export const DEFAULT_THEME = createTheme({
  typography: {
    fontFamily: 'NotoRegular'
  }
})

/**
 * Fetches walletconnect supported wallet info
 * @returns {JSON}
 */

export const WALLET_COINS = [{
  title: 'Bitcoin',
  type: 'BTC',
  rate: 10000,
  connected: false,
  network: 'lightning.btc',
  img_url: 'https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/bitcoin/info/logo.png?raw=true',
  isNFT: false,
  data: null,
  balance: 1000,
  options: []
}, {
  title: 'Ethereum',
  type: 'ETH',
  rate: 100000,
  connected: false,
  network: 'ethereum',
  img_url: 'https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/ethereum/info/logo.png?raw=true',
  isNFT: false,
  balance: 1000,
  data: null
}];