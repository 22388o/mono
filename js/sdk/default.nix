{
  pkgs ? import ../../nix {inherit system;},
  system ? builtins.currentSystem,
  nodejs ? pkgs.portaldefi.nodejs,
}:
pkgs.stdenv.mkDerivation {
  name = "sdk";
  version = "0.0.0";

  src = pkgs.nix-gitignore.gitignoreSourcePure [../../.gitignore] ./..;
  sourceRoot = "js/sdk";

  __noChroot = true;

  # TODO: Fix tests
  doCheck = false;

  buildInputs = [
    nodejs
    pkgs.cacert
    pkgs.git
    pkgs.makeWrapper
    pkgs.openssh
  ];

  # Avoid issues with npm + git when trying to use ssh
  GIT_CONFIG_GLOBAL = pkgs.writeText "gitconfig" ''
    [url "https://github.com/"]
      insteadOf = "ssh://git@github.com/"
  '';

  preBuild = ''
    # Update permissions to be writable on parent folders (required when working with npm link)
    for dir in ../*/; do
      chmod -R u+w "$dir"
    done

    # npm needs a user HOME.
    export HOME=$(mktemp -d)
  '';

  buildPhase = ''
    runHook preBuild

    # Install the packages
    npm install

    # Perform the build
    # TODO: Fix parcel build
    npm run build
  '';

  checkPhase = ''
    npm run test:node
  '';

  installPhase = ''
    mkdir -p $out
    # TODO: Copy appropiately outputs after fixing parcel build
    cp -R {node_modules,package.json} $out
  '';
}
