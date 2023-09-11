{lib, ...}:
with lib; {
  imports = [
    ../../modules/default.nix
    ../../modules/devtools.nix
    ../../modules/geth.nix
    ../../modules/lnd.nix
    ../../modules/nginx.nix
    ../../modules/portal.nix
    ../../modules/users.nix
  ];

  # Fixes deadlock with network manager
  # see: https://github.com/NixOS/nixpkgs/issues/180175#issuecomment-1473408913
  # TODO: Review what to do with this
  systemd.services.NetworkManager-wait-online.enable = lib.mkForce false;
  systemd.services.systemd-networkd-wait-online.enable = lib.mkForce false;

  portal = {
    nodeFqdn = mkDefault "node.playnet.portaldefi.zone";
    rootSshKey = mkDefault "not-provided";
  };

  services = {
    bitcoind = {
      regtest = {
        enable = true;
        rpc = {
          users.lnd.passwordHMAC = "67d3078c31e998da3e5c733272333b53$5fc27bb8d384d2dc6f5b4f8c39b9527da1459e391fb531d317b2feb669724f16";
        };
        extraConfig = ''
          chain=regtest

          zmqpubhashblock=tcp://127.0.0.1:18500
          zmqpubhashtx=tcp://127.0.0.1:18501
          zmqpubrawblock=tcp://127.0.0.1:18502
          zmqpubrawtx=tcp://127.0.0.1:18503
          zmqpubsequence=tcp://127.0.0.1:18504

          fallbackfee=0.0002
        '';
      };
    };

    lnd = {
      alice = {
        enable = true;
        settings = {
          application = {
            listen = ["127.0.0.1:9001"];
            rpc.listen = ["127.0.0.1:10001"];
          };
          bitcoin = {
            enable = true;
            network = "regtest";
          };
          bitcoind = {
            enable = true;
            rpcUser = "lnd";
            rpcPass = "lnd";
            zmqpubrawblock = "tcp://127.0.0.1:18502";
            zmqpubrawtx = "tcp://127.0.0.1:18503";
          };
        };
        extras = {
          lncli.createAliasedBin = true;
          wallet.enableAutoCreate = true;
        };
      };

      bob = {
        enable = true;
        settings = {
          application = {
            listen = ["127.0.0.1:9002"];
            rpc.listen = ["127.0.0.1:10002"];
          };
          bitcoin = {
            enable = true;
            network = "regtest";
          };
          bitcoind = {
            enable = true;
            rpcUser = "lnd";
            rpcPass = "lnd";
            zmqpubrawblock = "tcp://127.0.0.1:18502";
            zmqpubrawtx = "tcp://127.0.0.1:18503";
          };
        };
        extras = {
          lncli.createAliasedBin = true;
          wallet.enableAutoCreate = true;
        };
      };
    };
  };
}
