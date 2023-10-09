{
  system ? builtins.currentSystem,
  pkgs ? import ./nix {inherit system;},
}: {
  nixosConfigurations = {
    ci = let
      os = pkgs.nixos {
        imports = [
          ./tf/playnet-equinix/nix/node/configuration.nix
          ./nix/hosts/ci/configuration.nix
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
