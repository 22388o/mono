{ pkgs ? import ./nix { } }:
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
    export PORTAL_URL_GOERLI="https://goerli.infura.io/v3/3f6691a33225484c8e1eebde034b274f"
    export PORTAL_URL_SEPOLIA="https://sepoloa.infura.io/v3/3f6691a33225484c8e1eebde034b274f"

    ## Aliases
    alias ls='ls --color'
    alias l='ls -la'

    ## Helpers
    ## Extracts the deployment key from Terraform
    alias tf-get-deploy-private-key='terraform state pull | jq -r ".resources[] | select(.name == \"deploy\") | .instances[0].attributes.private_key_pem"'
    alias tf-get-deploy-public-key='terraform state pull | jq -r ".resources[] | select(.name == \"deploy\") | .instances[0].attributes.public_key_openssh"'
    '';
  }
