{ pkgs ? import ../../nix { inherit system; }
, system ? builtins.currentSystem
, nodejs ? pkgs.portaldefi.nodejs
}: let 
  npmlock2nix = pkgs.callPackage ./npmlock2nix.nix {};
in {
  modules = npmlock2nix.node_modules {
    src = pkgs.nix-gitignore.gitignoreSourcePure [../../.gitignore] ./.;
  };

  build = npmlock2nix.build {
    inherit nodejs;
    src = pkgs.nix-gitignore.gitignoreSourcePure [../../.gitignore] ./.;
    buildCommands = [ ];
    node_modules_attrs.npmExtraArgs = [ "--omit=dev" ];
    installPhase = "cp -r . $out";
  };

  # test = pkgs.npmlock2nix.v2.build {
  #   inherit nodejs;
  #   src = pkgs.nix-gitignore.gitignoreSourcePure [../../.gitignore] ./.;
  #   buildCommands = [ "HOME=./ npm run test:unit" ];
  #   installPhase = "cp -r . $out";
  # };
}
