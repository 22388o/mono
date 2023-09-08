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
        ../modules/lnd.nix
      ];

      networking.firewall.enable = false;

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
            port = 9001;
            rpcPort = 10001;
            restPort = 8080;
            rpcUser = "lnd";
            rpcPassword = "lnd";
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
            rpcPassword = "lnd";
            network = "regtest";
            extraConfig = ''
              norest=true
              bitcoind.zmqpubrawblock=tcp://127.0.0.1:18502
              bitcoind.zmqpubrawtx=tcp://127.0.0.1:18503
            '';
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
