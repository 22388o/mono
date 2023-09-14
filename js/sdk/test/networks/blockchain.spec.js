const { Web3 } = require('web3')
const { expect } = require('chai')

const api =
  "https://eth-mainnet.alchemyapi.io/v2/gAQOlZdHS3eIpGULYGNg2jRhyxwmA-DS"; // web3 provider api

describe('Blockchain Test', () => {
  describe('Ethereum network', async() => {
    let provider

    it('must connect web3 network', () => {
      provider = new Web3(new Web3.providers.HttpProvider(api));
    })
  
    it('must get balance successfully', async () => {
      var balance = await provider.eth.getBalance('0xeEE27662c2B8EBa3CD936A23F039F3189633e4C8');
      console.log(balance);
      expect(balance).to.not.null;
    });
  })
  
});