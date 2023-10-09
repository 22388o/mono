{
  config,
  lib,
  pkgs,
  ...
}:
with lib; let
  cfg = config.portaldefi.portal.server;
in {
  options.portaldefi.portal.server = {
    hostname = mkOption {
      description = "The interface/IP address to listen on";
      type = types.str;
      default = "127.0.0.1";
    };

    port = mkOption {
      description = "The TCP port to listen on for incoming HTTP requests";
      type = types.port;
      default = 1337;
    };

    package = mkOption {
      type = types.package;
      description = ''The portaldefi portal package to use'';
      default = pkgs.portaldefi.portal;
    };

    packageUi = mkOption {
      type = types.package;
      description = ''The portaldefi ui package to use'';
      default = pkgs.portaldefi.demo;
    };

    ethereum = {
      url = mkOption {
        description = "The URL for the Ethereum service";
        type = types.str;
        default = "http://127.0.0.1:8545";
      };

      chainId = mkOption {
        description = "The Chain Id for the Ethereum network";
        type = types.str;
        default = "0x539";
      };

      contracts = mkOption {
        description = "The path to the ABI JSON file for the Ethereum Swap contract";
        type = types.path;
        default = "${pkgs.portaldefi.contracts}/portal/contracts.json";
      };
    };

    systemd = {
      additionalAfter = mkOption {
        description = "Additional services that portal should wait for";
        type = types.listOf types.str;
        default = [];
      };
    };
  };

  config = {
    systemd.services.portal = {
      description = "Portal Server";
      wantedBy = ["multi-user.target"];
      after = ["network.target"] ++ cfg.systemd.additionalAfter;
      environment = {
        PORTAL_HTTP_ROOT = toString cfg.packageUi;
        PORTAL_HTTP_HOSTNAME = cfg.hostname;
        PORTAL_HTTP_PORT = toString cfg.port;
        PORTAL_ETHEREUM_URL = cfg.ethereum.url;
        PORTAL_ETHEREUM_CHAINID = cfg.ethereum.chainId;
        PORTAL_ETHEREUM_CONTRACTS = cfg.ethereum.contracts;
      };
      serviceConfig = {
        Restart = "always";
        WorkingDirectory = "/var/lib/portal";
        StateDirectory = "portal";
        StateDirectoryMode = "0755";
        ExecStartPre = pkgs.writeShellScript "contract-deployer" ''

        '';
        ExecStart = "${lib.getExe cfg.package}";
        # Hardening Options
        NoNewPrivileges = "true";
        PrivateDevices = "true";
        PrivateTmp = "true";
        ProtectSystem = "full";
      };
    };
  };
}
