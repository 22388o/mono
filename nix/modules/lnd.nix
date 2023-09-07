# Adapted from https://github.com/fort-nix/nix-bitcoin/blob/d5d3f064e60478faa1b88b84d4b197c75c0f41d7/modules/lnd.nix
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

  # Bitcoin
  bitcoind = config.services.bitcoind;
  bitcoindRpcAddress = nbLib.address bitcoind.rpc.address;
  isPruned = bitcoind.prune > 0;
  # When bitcoind pruning is enabled, lnd requires non-public RPC commands `getpeerinfo`, `getnodeaddresses`
  # to fetch missing blocks from peers (implemented in btcsuite/btcwallet/chain/pruned_block_dispatcher.go)
  rpcUser =
    if isPruned
    then "lnd"
    else "public";

  # Secrets
  secretsDir = config.nix-bitcoin.secretsDir;

  # LND Options
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
        description = mdDoc "The package providing lnd binaries.";
      };

      address = mkOption {
        type = types.str;
        default = "127.0.0.1";
        description = mdDoc "Address to listen for peer connections";
      };
      port = mkOption {
        type = types.port;
        default = 9735;
        description = mdDoc "Port to listen for peer connections";
      };

      rpcAddress = mkOption {
        type = types.str;
        default = "127.0.0.1";
        description = mdDoc "Address to listen for RPC connections.";
      };
      rpcPort = mkOption {
        type = types.port;
        default = 10009;
        description = mdDoc "Port to listen for gRPC connections.";
      };

      restAddress = mkOption {
        type = types.str;
        default = "127.0.0.1";
        description = mdDoc "Address to listen for REST connections.";
      };
      restPort = mkOption {
        type = types.port;
        default = 8080;
        description = mdDoc "Port to listen for REST connections.";
      };

      dataDir = mkOption {
        type = types.path;
        default = "/var/lib/lnd-${name}";
        description = mdDoc "The data directory for LND.";
      };

      networkDir = mkOption {
        readOnly = true;
        default = "${config.dataDir}/chain/bitcoin/${bitcoind.network}";
        description = mdDoc "The network data directory.";
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

      getPublicAddressCmd = mkOption {
        type = types.str;
        default = "";
        description = mdDoc ''
          Bash expression which outputs the public service address to announce to peers.
          If left empty, no address is announced.
        '';
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

      certPath = mkOption {
        readOnly = true;
        default = "${secretsDir}/lnd-${name}-cert";
        description = mdDoc "LND TLS certificate path.";
      };
    };
  };
in {
  options = {
    services.lnd = mkOption {
      type = types.attrsOf (types.submodule lndOpts);
      default = {};
      description = lib.mdDoc "Specification of one or more lnd instances.";
    };
  };

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
            networkDir = cfg.networkDir;

            zmqHandleSpecialAddress = builtins.replaceStrings ["0.0.0.0" "[::]"] ["127.0.0.1" "[::1]"];

            configFile = pkgs.writeText "lnd.conf" ''
              datadir=${cfg.dataDir}
              logdir=${cfg.dataDir}/logs

              tlscertpath=${cfg.certPath}
              tlskeypath=${secretsDir}/lnd-${lndName}-key

              listen=${toString cfg.address}:${toString cfg.port}
              rpclisten=${cfg.rpcAddress}:${toString cfg.rpcPort}
              restlisten=${cfg.restAddress}:${toString cfg.restPort}

              bitcoin.${bitcoind.network}=1
              bitcoin.active=1
              bitcoin.node=bitcoind

              bitcoind.rpchost=${bitcoindRpcAddress}:${toString bitcoind.rpc.port}
              bitcoind.rpcuser=${bitcoind.rpc.users.${rpcUser}.name}
              bitcoind.zmqpubrawblock=${zmqHandleSpecialAddress bitcoind.zmqpubrawblock}
              bitcoind.zmqpubrawtx=${zmqHandleSpecialAddress bitcoind.zmqpubrawtx}

              wallet-unlock-password-file=${secretsDir}/lnd-${lndName}-wallet-password

              ${cfg.extraConfig}
            '';
          in {
            description = "lnd ${lndName}";
            wantedBy = ["multi-user.target"];
            requires = ["bitcoind.service"];
            after = ["bitcoind.service"];
            preStart = ''
              install -m600 ${configFile} '${cfg.dataDir}/lnd.conf'
              {
                echo "bitcoind.rpcpass=$(cat ${secretsDir}/bitcoin-rpcpassword-${rpcUser})"
                ${optionalString (cfg.getPublicAddressCmd != "") ''
                echo "externalip=$(${cfg.getPublicAddressCmd})"
              ''}
              } >> '${cfg.dataDir}/lnd.conf'

              if [[ ! -f ${networkDir}/wallet.db ]]; then
                seed='${cfg.dataDir}/lnd-seed-mnemonic'

                if [[ ! -f "$seed" ]]; then
                  echo "Create lnd seed"
                  (umask u=r,go=; ${lndinit} gen-seed > "$seed")
                fi

                echo "Create lnd wallet"
                ${lndinit} -v init-wallet \
                  --file.seed="$seed" \
                  --file.wallet-password='${secretsDir}/lnd-${lndName}-wallet-password' \
                  --init-file.output-wallet-dir='${networkDir}'
              fi
            '';
            serviceConfig =
              nbLib.defaultHardening
              // {
                Type = "notify";
                RuntimeDirectory = "lnd"; # Only used to store custom macaroons
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
          extraGroups = ["bitcoinrpc-public"];
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

    nix-bitcoin.secrets = let
      determineUser = attrName: cfg:
        if attrName == "rpcpassword-lnd"
        then cfg.user
        else bitcoind.user;
      lndSecrets = listToAttrs (
        concatMap (
          attr:
            mapAttrsToList (lndName: cfg: {
              name = "lnd-${lndName}-${attr.name}";
              value = attr.value // {user = cfg.user;};
            })
            eachLnd
        ) [
          {
            name = "wallet-password";
            value = {};
          }
          {
            name = "key";
            value = {};
          }
          {
            name = "cert";
            value = {permissions = "444";};
          }
        ]
      );
      optionalSecrets = listToAttrs (concatMap (attr:
        mapAttrsToList (lndName: cfg: {
          name = "bitcoin-${attr.name}-${lndName}";
          value = attr.value // {user = determineUser attr.name cfg;};
        })
        eachLnd) [
        {
          name = "rpcpassword-lnd";
          value = {};
        }
        {
          name = "HMAC-lnd";
          value = {};
        }
      ]);
    in
      lndSecrets // optionalAttrs isPruned optionalSecrets;

    # Advantages of manually pre-generating certs:
    # - Reduces dynamic state
    # - Enables deployment of a mesh of server plus client nodes with predefined certs
    nix-bitcoin.generateSecretsCmds = let
      mkLndSecrets = listToAttrs (
        mapAttrsToList (lndName: cfg:
          nameValuePair "lnd-${lndName}" ''
            makePasswordSecret lnd-${lndName}-wallet-password
            ${optionalString isPruned ''makeBitcoinRPCPassword lnd-${lndName}''}
            makeCert lnd-${lndName} '${nbLib.mkCertExtraAltNames cfg.certificate}'
          '')
        eachLnd
      );
    in
      mkLndSecrets;

    services.bitcoind.rpc.users = mkIf isPruned (listToAttrs (
      mapAttrsToList (lndName: cfg:
        nameValuePair "lnd-${lndName}" {
          passwordHMACFromFile = true;
          rpcwhitelist =
            bitcoind.rpc.users.public.rpcwhitelist
            ++ [
              "getpeerinfo"
              "getnodeaddresses"
            ];
        })
      eachLnd
    ));
  };
}
