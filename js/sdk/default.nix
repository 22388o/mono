{
  pkgs ? import ../../nix {inherit system;},
  system ? builtins.currentSystem,
  nodejs ? pkgs.portaldefi.nodejs,
}: {
  build = pkgs.stdenv.mkDerivation {
    name = "sdk";
    version = "0.0.0";

    src = pkgs.nix-gitignore.gitignoreSourcePure [../../.gitignore] ./..;
    sourceRoot = "js/sdk";

    # TODO: Remove once npmlock2nix file resolution works
    __noChroot = true;

    buildInputs = [
      pkgs.makeWrapper
      nodejs
    ];

    buildPhase = ''
      # npm needs a user HOME.
      export HOME=$(mktemp -d)

      # Install the packages
      npm install

      # Perform tests (don't work, leaving commented)
      # npm run test

      # Perform the build
      npm run build
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
