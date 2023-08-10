{
  pkgs ? import ../../nix {inherit system;},
  system ? builtins.currentSystem,
  nodejs ? pkgs.portaldefi.nodejs,
}: {
  build = pkgs.stdenv.mkDerivation {
    name = "portal";
    version = "0.0.0";

    src = pkgs.nix-gitignore.gitignoreSourcePure [../../.gitignore] ./..;
    sourceRoot = "js/portal";

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
    '';

    checkPhase = ''
      # Fix issues not importing correctly libraries when linking (see: https://github.com/npm/cli/issues/2339#issuecomment-1111228605)
      npm install -D --install-links ../core

      # Perform tests
      npm run test:unit
    '';

    installPhase = ''
      mkdir -p $out
      cp -R {bin,contracts,lib,node_modules,package.json} $out

      chmod +x $out/bin/portal
      wrapProgram $out/bin/portal \
        --set NODE_ENV production \
        --set NODE_PATH "$out/node_modules"
    '';
  };
}
