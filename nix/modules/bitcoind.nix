{ config, lib, ...}:

with lib;

{
  # TODO: what should be configurable
  options.portal.bitcoin = {};

  config = {
    services.bitcoind = {
      net0 = {
        enable = true;
        testnet = true;
      };

      net1 = {
        enable = true;
        testnet = true;
      };
    };
  };
}
