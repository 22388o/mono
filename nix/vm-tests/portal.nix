{pkgs ? import ../. {}}: let
  test-portal = pkgs.writeScriptBin "test-portal" ''
    set -eux
    endpoint="https://portal.portaldefi.com/api/v1/alive"
    # The node service might be considered as ready by systemd by not
    # yet listening to the input socket. Let's wait until it's ready.
    # Note: the nixos test has a 900s timeout.
    while [[ "$(curl -s -o /dev/null -w '%{http_code}' "$endpoint")" != "200" ]]; do sleep 5; done
    res_code=$(curl -s -o /dev/null -w '%{http_code}' "$endpoint")
    res_expected_body=$(curl -s "$endpoint" | jq ".alive")
    if [[ $res_code == 200 && $res_expected_body == true  ]]; then
      echo "[+] The portal seems to be up and running!"
      exit 0
    else
      echo "ERROR: cannot query the portal. Errcode: $code"
      exit 1
    fi
  '';

  tls-cert = pkgs.runCommand "selfSignedCerts" {buildInputs = [pkgs.openssl];} ''
    openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -nodes -subj '/CN=portal.portaldefi.com' -days 36500
    mkdir -p $out
    cp key.pem cert.pem $out
  '';

  hosts = nodes: ''
    ${nodes.portal.networking.primaryIPAddress} portal.portaldefi.com
    ${nodes.client.networking.primaryIPAddress} client.portaldefi.com
  '';
in
  pkgs.nixosTest {
    name = "portal-vm-test";

    nodes = {
      client = {
        nodes,
        pkgs,
        config,
        ...
      }: {
        environment.systemPackages = with pkgs; [curl jq test-portal];
        security.pki.certificateFiles = ["${tls-cert}/cert.pem"];
        networking.extraHosts = hosts nodes;
      };

      portal = {
        nodes,
        pkgs,
        config,
        ...
      }: {
        imports = [
          ../modules/bitcoind.nix
          ../modules/geth.nix
          ../modules/nb-secrets.nix
          ../modules/portal.nix
        ];

        security.pki.certificateFiles = ["${tls-cert}/cert.pem"];

        nix-bitcoin.generateSecrets = true;

        networking = {
          extraHosts = hosts nodes;
          firewall.enable = false;
        };

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

          nginx = {
            enable = true;
            virtualHosts."portal.portaldefi.com" = {
              addSSL = true;
              sslCertificate = "${tls-cert}/cert.pem";
              sslCertificateKey = "${tls-cert}/key.pem";
              locations."/" = {
                proxyPass = "http://${config.portaldefi.portal.server.hostname}:${toString config.portaldefi.portal.server.port}";
              };
            };
          };
        };
      };
    };

    testScript = {nodes, ...}: ''
      start_all()
      portal.wait_for_unit("portal.service")
      portal.wait_for_unit("nginx.service")
      client.wait_for_unit("multi-user.target")
      client.succeed("test-portal")
    '';
  }
