{lib, ...}:
with lib; {
  imports = [
    ../../modules/bitcoind.nix
    ../../modules/default.nix
    ../../modules/devtools.nix
    ../../modules/geth.nix
    ../../modules/lnd.nix
    ../../modules/nb-secrets.nix
    ../../modules/nginx.nix
    ../../modules/portal.nix
    ../../modules/users.nix
  ];

  portal = {
    nodeFqdn = mkDefault "nixos";
    rootSshKey = mkDefault "not-provided";
  };

  nix-bitcoin.generateSecrets = true;

  services = {
    bitcoind = {
      enable = true;
      regtest = true;
      zmqpubhashblock = "tcp://127.0.0.1:18500";
      zmqpubhashtx = "tcp://127.0.0.1:18501";
      zmqpubrawblock = "tcp://127.0.0.1:18502";
      zmqpubrawtx = "tcp://127.0.0.1:18503";
      zmqpubsequence = "tcp://127.0.0.1:18504";
      extraConfig = ''
        fallbackfee=0.0002
      '';
    };

    lnd = {
      alice = {
        enable = false;
        port = 9001;
        rpcPort = 10001;
        restPort = 8080;
      };

      bob = {
        enable = false;
        port = 9002;
        rpcPort = 10002;
        restPort = 8181;
      };
    };
  };
}
