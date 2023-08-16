{
  pkgs ? import ../../nix {inherit system;},
  system ? builtins.currentSystem,
  nodejs ? pkgs.portaldefi.nodejs,
}: pkgs.stdenv.mkDerivation {
    name = "swap-client";
    version = "0.0.0";

    src = pkgs.nix-gitignore.gitignoreSourcePure [../../.gitignore] ./..;
    sourceRoot = "js/swap-client";

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
      # Update permissions to be writable on parent folders
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

      # Fix issues not importing correctly libraries when linking (see: https://github.com/npm/cli/issues/2339#issuecomment-1111228605)
      npm install -D --install-links ../core

      # Perform the build
      npm run build
    '';

    checkPhase = ''
      # Perform tests
      npm run test
    '';

    installPhase = ''
      mkdir -p $out
      cp -r dist $out
    '';
}
