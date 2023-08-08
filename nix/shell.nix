{
  perSystem = {
    lib,
    pkgs,
    self',
    ...
  }:
    with lib;
    with builtins; {
      devshells.default = {
        name = "portaldefi - mono";
        packages = with pkgs; [
          bitcoind
          coreutils
          git
          go-ethereum
          jq
          less
          lnd
          niv
          nix-diff
          nodejs_18
          python3
          self'.packages.terraform-custom
          which
          stdenv.cc
          nodePackages.node-gyp-build
          gnumake
        ];
        commands = [];
        env = [];
      };
    };
}
