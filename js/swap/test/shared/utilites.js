async function forkMainnet() {
  await hre.network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: "https://rpc.ankr.com/eth",
          chainId: 1,
        },
      },
    ],
  });
}

async function forkOptimism() {
  await hre.network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: "https://rpc.ankr.com/optimism",
        },
      },
    ],
  });
}

async function forkArbitrum() {
  await hre.network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: "https://rpc.ankr.com/arbitrum",
        },
      },
    ],
  });
}

module.exports = {
  forkMainnet,
  forkArbitrum,
  forkOptimism,
};
