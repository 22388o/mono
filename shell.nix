{ pkgs ? import ./nix { } }:
let
  pathRoot = toString ./.;
in
pkgs.mkShell {
  packages = with pkgs; [
    portaldefi.nodejs

    coreutils
    git
    jq
    less
    niv
    nix-diff
    terraform
    which
  ];

  # Needed for macOS, since the TMPDIR path is long there
  TMPDIR = "/tmp";

  shellHook = ''
    ## Environment
    export PORTAL_HTTP_ROOT="${pathRoot}/js/swap-client/dist"
    export PORTAL_GOERLI_URL="https://goerli.infura.io/v3/c438b36c5edb417e947ce2ac7e621fb8"
    export PORTAL_GOERLI_CONTRACT_ADDRESS="0xe2f24575862280cf6574db5b9b3f8fe0be84dc62"
    export PORTAL_SEPOLIA_URL="https://sepolia.infura.io/v3/c438b36c5edb417e947ce2ac7e621fb8"
    export PORTAL_SEPOLIA_CONTRACT_ADDRESS="0xd55552056afc742caa304bdb992529b4148fb504"

    ## Aliases
    alias ls='ls --color'
    alias l='ls -la'

    ## Helpers
    ## Extracts the deployment key from Terraform
    alias tf-get-deploy-private-key='terraform state pull | jq -r ".resources[] | select(.name == \"deploy\") | .instances[0].attributes.private_key_pem"'
    alias tf-get-deploy-public-key='terraform state pull | jq -r ".resources[] | select(.name == \"deploy\") | .instances[0].attributes.public_key_openssh"'
    '';
  }
