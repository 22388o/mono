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
    export PORTAL_GOERLI_URL="https://goerli.infura.io/v3/3f6691a33225484c8e1eebde034b274f"
    export PORTAL_GOERLI_CONTRACT_ADDRESS="0xa28c9f7754291f69c8ad76b16639eb2b2089f18d"
    export PORTAL_SEPOLIA_URL="https://sepolia.infura.io/v3/3f6691a33225484c8e1eebde034b274f"
    export PORTAL_SEPOLIA_CONTRACT_ADDRESS="0xc856db6c2d0c9f247918e565a5d2b80bcf44e10b"

    ## Aliases
    alias ls='ls --color'
    alias l='ls -la'

    ## Helpers
    ## Extracts the deployment key from Terraform
    alias tf-get-deploy-private-key='terraform state pull | jq -r ".resources[] | select(.name == \"deploy\") | .instances[0].attributes.private_key_pem"'
    alias tf-get-deploy-public-key='terraform state pull | jq -r ".resources[] | select(.name == \"deploy\") | .instances[0].attributes.public_key_openssh"'
    '';
  }
