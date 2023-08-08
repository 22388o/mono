{...}: {
  perSystem = {...}: {
    config.process-compose.dev = {...}: {
      settings = {
        log_location = "$PRJ_DATA_DIR/dev.log";
        environment = {
          PLAYNET_ROOT = "$PRJ_ROOT/playnet";
        };
      };

      settings.processes.bitcoind-portal = {
        command = ''bitcoind -conf="$PLAYNET_ROOT/bitcoind.portal.conf" -datadir="$PLAYNET_ROOT/state/portal/bitcoind"'';
      };

      # TODO: Add remaining services
      # settings.processes.geth-portal = {};

      # settings.processes.lnd-alice = {};
      # settings.processes.lnd-bob = {};
    };

    config.devshells.default = {
      commands = [
        {
          name = "dev";
          category = "Development";
          help = "Manage commmon development operations";
          command = ''
            set -eo pipefail

            function up() {
                nix run $PRJ_ROOT#dev "$@"
            }

            function init() {
                echo "Initializing environment..."
                mkdir -p $PRJ_DATA_DIR/
            }

            function clean() {
                echo "Cleaning environment"
                rm -rf $PRJ_DATA_DIR/dev.log
                echo "Environment cleaned"
            }

            function help() {
                echo "Usage: dev [subcommand]"
                echo "Subcommands:"
                echo "    up       Run nix"
                echo "    init     Initialize the environment"
                echo "    clean    Clean the environment"
                echo "    help     Show this help message"
            }

            function main() {
                # Ensure the script is invoked with at least one argument
                if [ $# -eq 0 ]; then
                    echo "No subcommand provided."
                    echo
                    help
                    exit 1
                fi

                # Separate the subcommand from the rest of the arguments
                local subcommand="$1"
                shift

                # Use positional parameter $1 to choose subcommand
                case "$subcommand" in
                    up)
                        up "$@"
                        ;;
                    init)
                        init
                        ;;
                    clean)
                        clean
                        ;;
                    help)
                        help
                        ;;
                    *)
                        echo "Invalid subcommand: $1."
                        help
                        exit 1
                        ;;
                esac
            }

            main "$@"
          '';
        }
      ];
    };
  };
}
