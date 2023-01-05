{ pkgs ? import ../../nix { inherit system; }
, nodejs ? pkgs.portaldefi.nodejs
, system ? builtins.currentSystem
}:

pkgs.npmlock2nix.v2.build {
  inherit nodejs;

  src = pkgs.nix-gitignore.gitignoreSourcePure [./.gitignore] ./.;
  buildCommands = ["HOME=$PWD npm run build"];
  installPhase = ''
    mkdir $out
    cp index.json $out/
  '';
}
