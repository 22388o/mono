{
  pkgs ? import ./nix {},
  lib ? pkgs.lib,
}:
with lib; let
  devshell = import pkgs.sources.devshell {};
  treefmt-nix = import pkgs.sources.treefmt-nix;

  # Function to generate environment variable definitions
  mkEnv = name: value: {inherit name value;};

  # Function to abstract the common shell script generation operation
  mkScriptCommand = category: name: help: scriptPath: {
    inherit category name help;
    command = let
      script = pkgs.writeShellScriptBin name (builtins.readFile scriptPath);
    in ''${script}/bin/${name} "$@"'';
  };
in
  devshell.mkShell {
    name = "mono";

    packages = with pkgs; [
      alejandra
      bitcoind
      coreutils
      ethereal
      ethw
      git
      go-ethereum
      jq
      less
      lnd
      lndinit
      lsof
      niv
      nix-diff
      nodejs
      process-compose
      terraform
      which
    ];

    env = [
      # Configure nix to use our defined nixpkgs
      (mkEnv "NIX_PATH" "nixpkgs=${toString pkgs.path}")

      # Define PORTAL_ROOT (used by some scripts, although we can use $PRJ_ROOT as well)
      (mkEnv "PORTAL_ROOT" "${toString ./.}")

      # Define PLAYNET_ROOT
      (mkEnv "PLAYNET_ROOT" "${toString ./.}/playnet")
    ];

    commands = [
      {
        category = "Tools";
        name = "fmt";
        help = "Format the source tree";
        command = let
          fmt = treefmt-nix.mkWrapper pkgs {
            projectRootFile = ".git/config";
            programs = {
              alejandra.enable = true;
              mdformat.enable = true;
              shfmt.enable = true;
              terraform.enable = true;
            };
          };
        in ''${fmt}/bin/treefmt'';
      }

      {
        category = "Nix";
        name = "update";
        help = "Update all inputs with niv";
        command = ''${getExe pkgs.niv} update'';
      }

      (mkScriptCommand "DevOps" "tf-get" "Obtain the deployment public or private key from terraform state" ./sh/utils/tf-get.sh)

      (mkScriptCommand "Dev" "devenv" "Development Environment Control Script" ./sh/devenv/devenv2.sh)

      (mkScriptCommand "Dev" "bitcoin-cli-dev" "bitcoin-cli with dev settings enabled" ./sh/aliases/bitcoin-cli-dev.sh)
      (mkScriptCommand "Dev" "bitcoind-dev" "bitcoind with dev settings enabled" ./sh/aliases/bitcoind-dev.sh)
      (mkScriptCommand "Dev" "geth-dev" "Geth with dev settings enabled" ./sh/aliases/geth-dev.sh)
      (mkScriptCommand "Dev" "lncli-alice" "lncli with dev settings enabled for Alice" ./sh/aliases/lncli-alice.sh)
      (mkScriptCommand "Dev" "lncli-bob" "lncli with dev settings enabled for Bob" ./sh/aliases/lncli-bob.sh)
      (mkScriptCommand "Dev" "lnd-alice" "lnd with dev settings enabled for Alice" ./sh/aliases/lnd-alice.sh)
      (mkScriptCommand "Dev" "lnd-bob" "lnd with dev settings enabled for Bob" ./sh/aliases/lnd-bob.sh)

      (mkScriptCommand "Tests" "tests" "Run tests" ./sh/ci/tests.sh)
    ];

    # TODO: Remove this entry once devenv2 is ready
    devshell.startup.playnet.text = ''[ "$SKIP_OLD_DEVENV" != "true" ] && source "$PORTAL_ROOT/sh/devenv-old.sh"'';
  }
