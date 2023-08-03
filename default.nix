let
  pkgs = import ./nix {system = "x86_64-linux";};

  portalos = pkgs.nixos ({modulesPath, ...}: {
    imports = [
      ./tf/playnet-equinix/nix/node/configuration.nix
      ./nix/configuration.nix
    ];
  });
in {
  inherit (pkgs) portaldefi;
  system = portalos.toplevel;
}
