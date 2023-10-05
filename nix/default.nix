{system ? builtins.currentSystem}: let
  sources = import ./sources.nix;

  # overlays
  sourcesOverlay = self: super: {inherit sources;};
  ethw = import sources.ethw;
  overlays = import ./overlays;
in
  import sources.nixpkgs {
    inherit system;
    overlays =
      [
        sourcesOverlay
        ethw.overlays.default
      ]
      ++ overlays;
  }
