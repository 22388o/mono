{
  portaldefi.portal.server = {
    contracts = {
      deployer.enableAutoDeploySmartContract = true;
      deployer.address-seed = "portal";
    };
    systemd.additionalAfter = [
      "bitcoind-regtest.service"
      "geth-playnet.service"
    ];
  };
}
