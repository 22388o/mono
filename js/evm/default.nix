{
  pkgs ? import ../../nix {inherit system;},
  system ? builtins.currentSystem,
  nodejs ? pkgs.portaldefi.nodejs,
}:
pkgs.stdenv.mkDerivation {
  name = "contracts";
  version = "0.0.0";

  src = pkgs.nix-gitignore.gitignoreSourcePure [../../.gitignore] ./.;

  __noChroot = true;

  doCheck = false;

  buildInputs = [
    nodejs
    pkgs.cacert
    pkgs.git
    pkgs.makeWrapper
    pkgs.moreutils
    pkgs.openssh
    pkgs.solc
  ];

  # Avoid issues with npm + git when trying to use ssh
  GIT_CONFIG_GLOBAL = pkgs.writeText "gitconfig" ''
    [url "https://github.com/"]
      insteadOf = "ssh://git@github.com/"
  '';

  preBuild = ''
    # npm needs a user HOME.
    export HOME=$(mktemp -d)
  '';

  buildPhase = ''
    runHook preBuild

    # Install the packages
    npm ci

    # Perform the build
    npm run build
  '';

  installPhase = ''
    mkdir -p $out
    cp -R dist/* $out/
  '';
}
