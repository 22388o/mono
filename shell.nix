{ pkgs ? import ./nix { } }:
let
  rootDir = toString ./.;
  shDir = "${rootDir}/sh";
  stateDir = "${rootDir}/playnet/state";

in

pkgs.mkShell {
  packages = with pkgs; [
    portaldefi.nodejs

    bitcoind
    coreutils
    go-ethereum
    git
    jq
    less
    lnd
    niv
    nix-diff
    terraform
    which
  ];

  # Needed for macOS, since the TMPDIR path is long there
  TMPDIR = "/tmp";

  shellHook = ''
    ############################################################################
    # Portal Configuration
    ############################################################################
    export PORTAL_EVM_CONTRACT_ADDRESS="0xe2f24575862280cf6574db5b9b3f8fe0be84dc62"
    export PORTAL_ROOT=${rootDir}

    # Start the developer environment
    mkdir -p ${stateDir}/alice ${stateDir}/bob ${stateDir}/portal
    trap "${shDir}/playnet.sh stop" EXIT
    ${shDir}/playnet.sh start

    ############################################################################
    # Aliases
    ############################################################################
    alias ls='ls --color'
    alias l='ls -la'

    alias bitcoind="bitcoind -conf=${stateDir}/bitcoind.portal.conf"
    alias bitcoin-cli="bitcoin-cli -conf=${stateDir}/bitcoind.portal.conf"

    alias geth="geth --config ${stateDir}/geth.portal.toml"

    alias tf-get-deploy-private-key='terraform state pull | jq -r ".resources[] | select(.name == \"deploy\") | .instances[0].attributes.private_key_pem"'
    alias tf-get-deploy-public-key='terraform state pull | jq -r ".resources[] | select(.name == \"deploy\") | .instances[0].attributes.public_key_openssh"'
  '';
}
