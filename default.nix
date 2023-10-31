{
  system ? builtins.currentSystem,
  pkgs ? import ./nix {inherit system;},
}: {
  nixosConfigurations = {
    portalos = let
      os = pkgs.nixos {
        imports = [
          ./tf/playnet-equinix/nix/node/configuration.nix
          ./nix/hosts/portalos/configuration.nix
        ];
      };
    in
      os.toplevel;
  };

  packages = {
    inherit
      (pkgs.portaldefi)
      app
      contracts
      demo
      portal
      sdk
      ;
  };

  checks = {
    portaldefi.integration-tests = {
      inherit
        (pkgs.portaldefi.integration-tests)
        portal
        lnd
        ;
    };
  };
}
