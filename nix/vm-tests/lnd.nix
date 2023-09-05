{pkgs ? import ../. {}}:
pkgs.nixosTest {
  name = "lnd-vm-test";

  nodes = {
    lnd = {
      nodes,
      pkgs,
      config,
      ...
    }: {
      imports = [
        ../modules/bitcoind.nix
        ../modules/lnd.nix
        ../modules/nb-secrets.nix
      ];

      networking.firewall.enable = false;

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
            enable = true;
            port = 9001;
            rpcPort = 10001;
            restPort = 8080;
          };

          bob = {
            enable = true;
            port = 9002;
            rpcPort = 10002;
            restPort = 8181;
          };
        };
      };
    };
  };

  testScript = {nodes, ...}: ''
    lnd.start()
    lnd.wait_for_unit("bitcoind.service")
    lnd.wait_for_unit("lnd-alice.service")
    lnd.wait_for_unit("lnd-bob.service")
  '';
}
