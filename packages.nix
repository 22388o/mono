{
  perSystem = {pkgs, ...}: {
    packages = {
      portal = pkgs.callPackage ./js/portal {};
      portal_node_modules = pkgs.callPackage ./js/portal/node_modules.nix {};

      sdk = pkgs.callPackage ./js/sdk/build.nix {};

      swap-client = pkgs.callPackage ./js/swap-client/build.nix {};
    };
  };
}
