{ system ? builtins.currentSystem }:
let
  sources = import ./sources.nix;
in
import /home/aldo/Dev/aldoborrero/nixpkgs {
  inherit system;
  overlays = [(self: super: { inherit sources; })] ++ import ./overlays;
}
