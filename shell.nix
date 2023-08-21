{
  pkgs ? import ./nix {},
  lib ? pkgs.lib,
}:
with lib; let
  devshell = import pkgs.sources.devshell {};
  treefmt-nix = import pkgs.sources.treefmt-nix;
in
  devshell.mkShell {
    name = "mono";

    packages = with pkgs; [
      alejandra
      bash
      bitcoind
      coreutils
      git
      go-ethereum
      jq
      less
      lnd
      niv
      nix-diff
      portaldefi.nodejs
      terraform
      which
    ];

    env = [
      # Configure nix to use our defined nixpkgs
      {
        name = "NIX_PATH";
        value = "nixpkgs=${toString pkgs.path}";
      }

      # Define PORTAL_ROOT (used by some scripts, although we can use $PRJ_ROOT as well)
      {
        name = "PORTAL_ROOT";
        value = "${toString ./.}";
      }

      # Define PLAYNET_ROOT
      {
        name = "PLAYNET_ROOT";
        value = "${toString ./.}/playnet";
      }
    ];

    commands = [
      {
        category = "Terraform";
        name = "tf-get-deploy-private-key";
        help = "Obtain the deployment private key from terraform state";
        command = ''terraform state pull | jq -r ".resources[] | select(.name == \"deploy\") | .instances[0].attributes.private_key_pem"'';
      }
      {
        category = "Terraform";
        name = "tf-get-deploy-public-key";
        help = "Obtain the deployment private key from terraform state";
        command = ''terraform state pull | jq -r ".resources[] | select(.name == \"deploy\") | .instances[0].attributes.public_key_openssh"'';
      }
      {
        category = "Tools";
        name = "fmt";
        help = "Format the source tree";
        command = let
          fmt = treefmt-nix.mkWrapper pkgs {
            projectRootFile = ".git/config";
            programs = {
              alejandra.enable = true;
              prettier.enable = false; # consider using prettier to autoformat code for js/
              mdformat.enable = true;
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
    ];

    # TODO: Potentially migrate to process-compose or pro
    devshell.startup.playnet.text = ''source $PORTAL_ROOT/sh/devenv.sh'';
  }
