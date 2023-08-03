{
  pkgs ? import ../../nix {inherit system;},
  system ? builtins.currentSystem,
  nodejs ? pkgs.portaldefi.nodejs,
}: let
  src =
    pkgs.nix-gitignore.gitignoreSourcePure [
      ../../.gitignore
      ./.gitignore
    ]
    ./.;
  srcDir = ./.;
in {
  build = pkgs.npmlock2nix.v2.build {
    inherit nodejs src srcDir;
    buildCommands = [];
    node_modules_attrs.npmExtraArgs = ["--omit=dev"];
    installPhase = "cp -r . $out";
  };

  test = pkgs.npmlock2nix.v2.build {
    inherit nodejs src srcDir;
    buildCommands = ["HOME=./ npm test"];
    installPhase = "cp -r . $out";
  };
}
