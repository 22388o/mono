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
          # TODO: Use sops to store properly secrets
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
        port = 9001;
        rpcPort = 10001;
        restPort = 8080;
        rpcUser = "lnd";
        rpcPassword = "lnd"; # TODO: Use sops to store properly secrets
        network = "regtest";
        extraConfig = ''
          norest=true
          bitcoind.zmqpubrawblock=tcp://127.0.0.1:18502
          bitcoind.zmqpubrawtx=tcp://127.0.0.1:18503
        '';
      };

      bob = {
        enable = true;
        port = 9002;
        rpcPort = 10002;
        restPort = 8181;
        rpcUser = "lnd";
        rpcPassword = "lnd"; # TODO: Use sops to store properly secrets
        network = "regtest";
        extraConfig = ''
          norest=true
          bitcoind.zmqpubrawblock=tcp://127.0.0.1:18502
          bitcoind.zmqpubrawtx=tcp://127.0.0.1:18503
        '';
      };
    };
  };
}
