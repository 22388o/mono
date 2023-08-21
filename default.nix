let
  pkgs = import ./nix {system = "x86_64-linux";};

  portalos = pkgs.nixos ({...}: {
    imports = [
      ./tf/playnet-equinix/nix/node/configuration.nix
      ./nix/configuration.nix
    ];
  });
in {
  system = portalos.toplevel;
}
