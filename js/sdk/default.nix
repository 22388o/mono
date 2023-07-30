{ pkgs ? import ../../nix { inherit system; }
, system ? builtins.currentSystem
, nodejs ? pkgs.portaldefi.nodejs
}:

let
  src = pkgs.nix-gitignore.gitignoreSourcePure [
    ../../.gitignore
    ./.gitignore
    ] ./.;

in
{
  build = pkgs.npmlock2nix.v2.build {
    inherit nodejs src;
    buildCommands = [ ];
    node_modules_attrs.npmExtraArgs = [ "--omit=dev" ];
    installPhase = "cp -r . $out";
  };

  test = pkgs.npmlock2nix.v2.build {
    inherit nodejs src;
    buildCommands = [ "HOME=./ npm run test" ];
    installPhase = "cp -r . $out";
  };
}
