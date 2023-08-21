{
  pkgs ? import ../../nix {inherit system;},
  system ? builtins.currentSystem,
  nodejs ? pkgs.portaldefi.nodejs,
}:
pkgs.stdenv.mkDerivation {
  name = "portal";
  version = "0.0.0";

  src = pkgs.nix-gitignore.gitignoreSourcePure [../../.gitignore] ./..;
  sourceRoot = "js/portal";

  __noChroot = true;

  doCheck = false;

  NODE_ENV = "production";

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
  '';

  installPhase = ''
    mkdir -p $out
    cp -R {bin,contracts,lib,node_modules,package.json,package-lock.json} $out

    chmod +x $out/bin/portal
    wrapProgram $out/bin/portal \
      --set NODE_ENV production \
      --set NODE_PATH "$out/node_modules"
  '';
}
