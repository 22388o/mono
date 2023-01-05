{ system ? builtins.currentSystem, pkgs ? import ../../nix { inherit system; }}:
let
  node_modules_attrs = (import ./. {}).passthru.node_modules_attrs;
in
pkgs.npmlock2nix.v2.shell {
  inherit node_modules_attrs;
  nodejs = pkgs.portaldefi.nodejs;
  src = ./.;
  nativeBuildInputs = [ pkgs.jq pkgs.moreutils ];
}
