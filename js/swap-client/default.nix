{
  pkgs ? import ../../nix {inherit system;},
  system ? builtins.currentSystem,
  nodejs ? pkgs.portaldefi.nodejs,
}: {
  build = pkgs.stdenv.mkDerivation {
    name = "swap-client";
    version = "0.0.0";

    src = pkgs.nix-gitignore.gitignoreSourcePure [../../.gitignore] ./..;
    sourceRoot = "js/swap-client";

    # TODO: Fix tests
    doCheck = false;

    # TODO: Remove once npmlock2nix file resolution works
    __noChroot = true;

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

    buildPhase = ''
      # Update permissions to be writable on parent folders
      chmod -R u+w ../sdk
      chmod -R u+w ../portal
      chmod -R u+w ../core

      # npm needs a user HOME.
      export HOME=$(mktemp -d)

      # Install the packages
      npm ci

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
  };
}
