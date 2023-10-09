{
  portaldefi.portal.server = {
    systemd.additionalAfter = [
      "bitcoind-regtest.service"
      "geth-playnet.service"
    ];
  };
}
