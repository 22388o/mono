{system ? builtins.currentSystem}: let
  sources = import ./sources.nix;

  # overlays
  ethereum-nix = import sources."ethereum.nix";
  ethw = import sources.ethw;
  localOverlays = import ./overlays;
  sourcesOverlay = self: super: {inherit sources;};
in
  import sources.nixpkgs {
    inherit system;
    overlays =
      [
        ethereum-nix.overlays.default
        ethw.overlays.default
        sourcesOverlay
      ]
      ++ localOverlays;
  }
