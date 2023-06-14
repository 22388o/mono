require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("dotenv-extended").load();

if (!process.env.TESTNET_PRIVKEY) {
  throw new Error("TESTNET_PRIVKEY missing from .env file");
}
if (!process.env.MAINNET_PRIVKEY) {
  throw new Error("MAINNET_PRIVKEY missing from .env file");
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      // forking: {
      //   url: "https://rpc.ankr.com/eth",
      //   enabled: true,
      //   chainId: 1,
      // },
      chainId: 31337,
    },
    optimism: {
      url: "https://rpc.ankr.com/optimism",
      chainId: 10,
      accounts: [process.env.MAINNET_PRIVKEY],
    },
    arbitrum: {
      url: "https://rpc.ankr.com/arbitrum",
      chainId: 42161,
      accounts: [process.env.MAINNET_PRIVKEY],
    },
    optimism_test: {
      url: "https://goerli.optimism.io",
      chainId: 420,
      accounts: [process.env.TESTNET_PRIVKEY],
    },
    arbitrum_test: {
      url: "https://goerli-rollup.arbitrum.io/rpc",
      chainId: 421613,
      accounts: [process.env.TESTNET_PRIVKEY],
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
};
