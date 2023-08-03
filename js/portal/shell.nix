{
  system ? builtins.currentSystem,
  pkgs ? import ../../nix {inherit system;},
  nodejs ? pkgs.portaldefi.nodejs,
}:
pkgs.mkShell {
  packages = with pkgs; [
    alejandra
    bitcoind
    coreutils
    go-ethereum
    jq
    lnd
    nodejs
    yarn
  ];

  shellHook = ''
    export PORTAL_ROOT=${toString ../..}
    source $PORTAL_ROOT/sh/devenv.sh
  '';
}
