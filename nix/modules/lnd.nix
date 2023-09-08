{
  config,
  lib,
  pkgs,
  ...
}:
with lib; let
  nbLib = import ./nb-lib.nix lib pkgs;

  # LND
  eachLnd = filterAttrs (_: cfg: cfg.enable) config.services.lnd;
  lndinit = "${pkgs.lndinit}/bin/lndinit";

  # options
  lndOpts = {
    config,
    lib,
    name,
    ...
  }: {
    options = {
      enable = mkEnableOption "Lightning Network daemon, a Lightning Network implementation in Go";

      package = mkOption {
        type = types.package;
        default = pkgs.lnd;
        defaultText = "pkgs.lnd";
        description = "The package providing lnd binaries.";
      };

      address = mkOption {
        type = types.str;
        default = "127.0.0.1";
        description = "Address to listen for peer connections";
      };
      port = mkOption {
        type = types.port;
        default = 9735;
        description = "Port to listen for peer connections";
      };

      rpcAddress = mkOption {
        type = types.str;
        default = "127.0.0.1";
        description = "Address to listen for RPC connections.";
      };
      rpcPort = mkOption {
        type = types.port;
        default = 10009;
        description = "Port to listen for gRPC connections.";
      };

      rpcUser = mkOption {
        type = types.nullOr types.str;
        default = null;
      };
      rpcPassword = mkOption {
        type = types.nullOr types.str;
        default = null;
      };

      restEnable = mkOption {
        type = types.bool;
        default = false;
      };
      restAddress = mkOption {
        type = types.str;
        default = "127.0.0.1";
        description = "Address to listen for REST connections.";
      };
      restPort = mkOption {
        type = types.port;
        default = 8080;
        description = "Port to listen for REST connections.";
      };

      dataDir = mkOption {
        type = types.path;
        default = "/var/lib/lnd-${name}";
        description = "The data directory for LND.";
      };

      network = mkOption {
        type = types.str;
        default = "mainnet";
        description = "The name of the network.";
      };

      networkDir = mkOption {
        readOnly = true;
        default = "${config.dataDir}/chain/bitcoin/${config.network}";
        description = "The network data directory.";
      };

      macaroons = mkOption {
        default = {};
        type = with types;
          attrsOf (submodule {
            options = {
              user = mkOption {
                type = types.str;
                description = mdDoc "User who owns the macaroon.";
              };
              permissions = mkOption {
                type = types.str;
                example = ''
                  {"entity":"info","action":"read"},{"entity":"onchain","action":"read"}
                '';
                description = mdDoc "List of granted macaroon permissions.";
              };
            };
          });
        description = mdDoc ''
          Extra macaroon definitions.
        '';
      };

      certificate = {
        extraIPs = mkOption {
          type = with types; listOf str;
          default = [];
          example = ["60.100.0.1"];
          description = mdDoc ''
            Extra `subjectAltName` IPs added to the certificate.
            This works the same as lnd option {option}`tlsextraip`.
          '';
        };
        extraDomains = mkOption {
          type = with types; listOf str;
          default = [];
          example = ["example.com"];
          description = mdDoc ''
            Extra `subjectAltName` domain names added to the certificate.
            This works the same as lnd option {option}`tlsextradomain`.
          '';
        };
      };

      extraConfig = mkOption {
        type = types.lines;
        default = "";
        example = ''
          autopilot.active=1
        '';
        description = mdDoc ''
          Extra lines appended to {file}`lnd.conf`.
          See here for all available options:
          https://github.com/lightningnetwork/lnd/blob/master/sample-lnd.conf
        '';
      };

      cli = mkOption {
        default = let
          runAsUser = "sudo -u";
        in
          pkgs.writers.writeBashBin "lncli-${name}"
          # Switch user because lnd makes datadir contents readable by user only
          ''
            ${runAsUser} ${config.user} ${config.package}/bin/lncli \
              --rpcserver ${config.rpcAddress}:${toString config.rpcPort} \
              --tlscertpath '${config.certPath}' \
              --macaroonpath '${config.networkDir}/admin.macaroon' "$@"
          '';
        defaultText = "(See source)";
        description = mdDoc "Binary to connect with the lnd instance.";
      };

      user = mkOption {
        type = types.str;
        default = "lnd-${name}";
        description = mdDoc "The user as which to run LND.";
      };

      group = mkOption {
        type = types.str;
        default = config.user;
        description = mdDoc "The group as which to run LND.";
      };

      secretsDir = mkOption {
        type = types.path;
        default = "/etc/lnd-${name}-secrets";
        description = mdDoc "Directory to store secrets";
      };

      certPath = mkOption {
        type = types.path;
        default = "${config.secretsDir}/lnd-${name}-cert";
        description = mdDoc "LND TLS certificate path.";
      };
    };
  };
in {
  # interface
  options = {
    services.lnd = mkOption {
      type = types.attrsOf (types.submodule lndOpts);
      default = {};
      description = lib.mdDoc "Specification of one or more lnd instances.";
    };
  };

  # implementation
  config = mkIf (eachLnd != {}) {
    environment.systemPackages = flatten (mapAttrsToList (lndName: cfg: [cfg.package (hiPrio cfg.cli)]) eachLnd);

    systemd.tmpfiles.rules = flatten (mapAttrsToList (lndName: cfg: [
        "d '${cfg.dataDir}' 0770 '${cfg.user}' '${cfg.group}' - -"
      ])
      eachLnd);

    systemd.services =
      mapAttrs' (lndName: cfg: (
        nameValuePair "lnd-${lndName}" (
          let
            configFile = pkgs.writeText "lnd.conf" ''
              datadir=${cfg.dataDir}
              logdir=${cfg.dataDir}/logs

              tlscertpath=${cfg.dataDir}/tls.cert
              tlskeypath=${cfg.dataDir}/tls.key

              listen=${toString cfg.address}:${toString cfg.port}
              rpclisten=${cfg.rpcAddress}:${toString cfg.rpcPort}
              ${optionalString (cfg.restEnable) "restlisten=${cfg.restAddress}:${toString cfg.restPort}"}

              bitcoin.${cfg.network}=true
              bitcoin.active=true
              bitcoin.node=bitcoind

              bitcoind.rpcuser=${cfg.rpcUser}
              bitcoind.rpcpass=${cfg.rpcPassword}

              wallet-unlock-password-file=${cfg.dataDir}/lnd-${lndName}-wallet-password

              ${cfg.extraConfig}
            '';
          in {
            description = "lnd ${lndName}";
            wantedBy = ["multi-user.target"];
            requires = ["bitcoind-${cfg.network}.service"];
            after = ["bitcoind-${cfg.network}.service"];
            preStart = ''
              install -m600 ${configFile} '${cfg.dataDir}/lnd.conf'

              if [[ ! -f ${cfg.networkDir}/wallet.db ]]; then
                seed='${cfg.dataDir}/lnd-seed-mnemonic'

                if [[ ! -f "$seed" ]]; then
                  echo "Create lnd seed"
                  (umask u=r,go=; ${lndinit} gen-seed > "$seed")
                fi

                echo "Create wallet-password"
                ${pkgs.pwgen}/bin/pwgen -s 20 1 > "${cfg.dataDir}/lnd-${lndName}-wallet-password"

                echo "Create lnd wallet"
                ${lndinit} -v init-wallet \
                  --file.seed="$seed" \
                  --file.wallet-password='${cfg.dataDir}/lnd-${lndName}-wallet-password' \
                  --init-file.output-wallet-dir='${cfg.networkDir}'

                echo "Create tls cert and key"
                ${pkgs.openssl}/bin/openssl req -x509 \
                  -sha256 -days 3650 \
                  -newkey ec \
                  -pkeyopt ec_paramgen_curve:prime256v1 \
                  -nodes \
                  -keyout ${cfg.dataDir}/tls.key \
                  -out ${cfg.dataDir}/tls.cert  \
                  -subj "/CN=localhost/O=tls" \
                  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
              fi
            '';
            serviceConfig =
              # TODO: Restore hardening measures
              {
                Type = "notify";
                RuntimeDirectory = "lnd-${lndName}"; # Only used to store custom macaroons
                RuntimeDirectoryMode = "711";
                ExecStart = "${cfg.package}/bin/lnd --configfile='${cfg.dataDir}/lnd.conf'";
                User = cfg.user;
                TimeoutSec = "15min";
                Restart = "on-failure";
                RestartSec = "10s";
                ReadWritePaths = [cfg.dataDir];
                ExecStartPost = let
                  curl = "${pkgs.curl}/bin/curl -fsS --cacert ${cfg.certPath}";
                  restUrl = "https://${nbLib.addressWithPort cfg.restAddress cfg.restPort}/v1";
                in
                  # Setting macaroon permissions for other users needs root permissions
                  nbLib.rootScript "lnd-create-macaroons" ''
                    umask ug=r,o=
                    ${concatMapStrings (macaroon: ''
                      echo "Create custom macaroon ${macaroon}"
                      macaroonPath="$RUNTIME_DIRECTORY/${macaroon}.macaroon"
                      ${curl} \
                        -H "Grpc-Metadata-macaroon: $(${pkgs.xxd}/bin/xxd -ps -u -c 99999 '${networkDir}/admin.macaroon')" \
                        -X POST \
                        -d '{"permissions":[${cfg.macaroons.${macaroon}.permissions}]}' \
                        ${restUrl}/macaroon |\
                        ${pkgs.jq}/bin/jq -c '.macaroon' | ${pkgs.xxd}/bin/xxd -p -r > "$macaroonPath"
                      chown ${cfg.macaroons.${macaroon}.user}: "$macaroonPath"
                    '') (attrNames cfg.macaroons)}
                  '';
              };
          }
        )
      ))
      eachLnd;

    users.users =
      mapAttrs' (lndName: cfg: (
        nameValuePair "lnd-${lndName}" {
          description = "Lnd user";
          group = cfg.group;
          home = cfg.dataDir; # lnd creates .lnd dir in HOME
          isSystemUser = true;
          name = cfg.user;
        }
      ))
      eachLnd;

    users.groups =
      mapAttrs' (lndName: cfg: (
        nameValuePair "${cfg.group}" {}
      ))
      eachLnd;
  };
}
