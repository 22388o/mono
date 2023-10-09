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
      description = ''The portaldefi server package to use'';
      default = pkgs.portaldefi.portal;
    };

    packageUi = mkOption {
      type = types.package;
      description = ''The portaldefi ui package to use'';
      default = pkgs.portaldefi.demo;
    };

    workDir = mkOption {
      default = "/var/lib/portal";
      type = types.str;
      description = "Specifies the working directory in which portal resides";
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

      contracts = {
        package = mkOption {
          internal = true;
          type = types.package;
          defaultText = "pkgs.portaldefi.contracts";
          default = pkgs.portaldefi.contracts;
        };

        solidity = mkOption {
          description = "The path to the solidity JSON file for the Ethereum Swap contract";
          type = types.str;
          default = "${cfg.ethereum.contracts.package}/abi/Swap.json";
        };

        abi = mkOption {
          description = "The path to the ABI JSON file for the Ethereum Swap contract";
          type = types.str;
          default = "${cfg.ethereum.contracts.package}/portal/contracts.json";
        };

        deployer = {
          enableAutoDeploySmartContract = mkEnableOption "Auto deploy the Swap smart contract automatically in the Geth network (use only on Playnet)";

          address-seed = {
            description = "The deployer address seed in charge of deploying the Swap smart contract";
            type = types.str;
            default = "";
          };

          contractDeployerScript = mkOption {
            description = "Script to auto-deploy the Swap smart contract into Geth (useful for testing)";
            default = let
              ethereal = "${lib.getExe pkgs.ethereal}";
              jq = "${lib.getExe pkgs.jq}";
              ethw = "${lib.getExe pkgs.ethw}";
            in
              pkgs.writeShellScriptBin "contract-deployer" ''
                set -euo pipefail

                fetch_contract_data() {
                  ${jq} -r '.evm.bytecode.object' < "$1"
                }

                deploy_contract() {
                  ${ethereal} contract deploy \
                  --connection="$1" \
                  --from="$2" \
                  --privatekey="$3" \
                  --data="$4" \
                  --wait |
                  awk '{print $1}'
                }

                fetch_contract_address() {
                  ${ethereal} transaction info \
                  --connection="$1" \
                  --transaction="$2" |
                  awk '/Contract address:/ { print $3 }'
                }

                update_json() {
                  ${jq} --arg addr "$1" '.address = $addr' "$2" > "$3"
                }

                # Entry point of the script
                main() {
                  local CONNECTION="$PORTAL_ETHEREUM_URL"
                  local ABI_PATH="${cfg.ethereum.contracts.solidity}"
                  local FROM="${ethw} wallet create --json "seed=${cfg.ethereum.contracts.deployer.address-seed}" | jq '.[0].address'"
                  local PRIVATE_KEY="${ethw} wallet create --json "seed=${cfg.ethereum.contracts.deployer.address-seed}" | jq '.[0].private_key'"
                  local CONTRACT_OUTPUT="${cfg.workDir}/contracts.json"

                  local DATA=$(fetch_contract_data "$ABI_PATH")

                  echo "Deploying contract..."
                  local TX_HASH=$(deploy_contract "$CONNECTION" "$FROM" "$PRIVATE_KEY" "$DATA")

                  echo "Fetching contract address..."
                  local CONTRACT_ADDRESS=$(fetch_contract_address "$CONNECTION" "$TX_HASH")

                  echo "Updating JSON file with new contract address..."
                  update_json "$CONTRACT_ADDRESS" "$ABI_PATH" "$CONTRACT_OUTPUT"
                }

                # Execute the script
                main
              '';
          };
        };
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
    environment.systemPackages = [cfg.package];

    systemd.services.portal = {
      description = "Portal Server";
      wantedBy = ["multi-user.target"];
      after = ["network.target"] ++ cfg.systemd.additionalAfter;
      environment =
        {
          PORTAL_HTTP_ROOT = toString cfg.packageUi;
          PORTAL_HTTP_HOSTNAME = cfg.hostname;
          PORTAL_HTTP_PORT = toString cfg.port;
          PORTAL_ETHEREUM_URL = cfg.ethereum.url;
          PORTAL_ETHEREUM_CHAINID = cfg.ethereum.chainId;
        }
        // optionalAttrs (!cfg.ethereum.contracts.deployer.enableAutoDeploySmartContract) {
          PORTAL_ETHEREUM_CONTRACTS = cfg.ethereum.contracts.abi;
        };
      serviceConfig = {
        Restart = "always";
        WorkingDirectory = cfg.workDir;
        StateDirectory = "portal";
        StateDirectoryMode = "0755";
        ExecStartPre = optionalString cfg.ethereum.contracts.deployer.enableAutoDeploySmartContract "${cfg.ethereum.contracts.deployer.contractDeployerScript}/bin/contract-deployer";
        ExecStart = let
          env = optionalString cfg.ethereum.contracts.deployer.enableAutoDeploySmartContract "PORTAL_ETHEREUM_CONTRACTS=${cfg.workDir}/contracts.json";
        in "${env} ${lib.getExe cfg.package}";

        # Hardening Options
        NoNewPrivileges = "true";
        PrivateDevices = "true";
        PrivateTmp = "true";
        ProtectSystem = "full";
      };
    };
  };
}
