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

        ../profiles/playnet/bitcoind.nix
        ../profiles/playnet/lnd.nix
      ];

      networking.firewall.enable = false;
    };
  };

  testScript = {nodes, ...}: ''
    def verify_services():
      # Wait for systemd units
      lnd.wait_for_unit("bitcoind-regtest.service")
      lnd.wait_for_unit("lnd-alice.service")
      lnd.wait_for_unit("lnd-bob.service")

      # Verify ports are active
      for port in [9001, 10001, 9002, 10002]:
        lnd.wait_for_open_port(port)

      # Verify RPC Functionality
      lnd.succeed("lncli-alice getinfo")
      lnd.succeed("lncli-bob getinfo")

    def restart_and_verify_services():
      # Restart services
      lnd.succeed("systemctl restart lnd-alice.service")
      lnd.succeed("systemctl restart lnd-bob.service")

      # Re-verify
      verify_services()

    lnd.start()

    # Initial verification
    verify_services()

    # Validate Wallet Creation
    lnd.succeed("test -f /var/lib/lnd-alice/chain/bitcoin/regtest/wallet.db")
    lnd.succeed("test -f /var/lib/lnd-bob/chain/bitcoin/regtest/wallet.db")

    # Restart services and re-verify
    restart_and_verify_services()
  '';
}
