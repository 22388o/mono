{
  system ? builtins.currentSystem,
  pkgs ? import ./nix {inherit system;},
}: {
  # Altough we're not using flakes, we can mimic it's outputs schema,
  # so we have a common place for all outputs we expose (https://nixos.wiki/wiki/Flakes#Output_schema)

  nixosConfigurations = {
    portalos = let
      os = pkgs.nixos {
        imports = [
          ./tf/playnet-equinix/nix/node/configuration.nix
          ./nix/configuration.nix
        ];
      };
    in
      os.toplevel;
  };

  packages = {
    inherit (pkgs.portaldefi) app demo portal sdk;
  };

  checks = {
    portaldefi.integration-tests.portal = import ./nix/vm-tests/portal.nix {inherit pkgs;};
  };
}
